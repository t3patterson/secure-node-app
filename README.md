# Node App Security

## Passwords
-----
### 1) Password Storage
**bcrypt** for hashing passwords. in `userModel.js`

```js
function hashNewPassword(next){
   let user = this //context is 
	if(!user.isModified('password')){ return next() }
   bcrypt.hash(user.password, 10, (err, hash)=>{
      if(err){ return next(err)}
      user.password = hash;
      next()
   })
}

function handlePasswordCompare(inputPW, user){
	return function(resolve, reject){
		bcrypt.compare(inputPW, user.password, (err, passwordMatch)=>{
			if(err || !passwordMatch){ return reject(false) }
			return resolve(user)
		})	
	}
}
```


### 2) Password Strength
- regex for password strength: upper&lower case + numbers + symbol

```js
 email:     { 
  type: String, 
  required: true,
  match: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,10}$/i
},
 password:  { 	
  type: String, 
  required: true,
  match: /(?=.*[a-zA-Z]+)(?=.*[0-9]+)(?=.*[!*&^$#@()+]+).*/,
  minlength: 12	
},
```

### 3) Preventing Brute Force Attacks

`delayResponse` by that waits a second to fire off the response

```js
function delayResponse(func){
	setTimeout(()=>{
		func()
	}, 1000)
}

function authenticateUser(req, res, next){
  delayResponse(()=>{
  	passport.authenticate('local', _handleAuth(req,res,next))(req,res,next)  
  })		
}
```

### 4) Tracking Failed Logins

```js
LoginSchema.static('canAuthenticate', function(key){
	let timeoutElapsed = (loginRec, minutes = 1)=>{
		let nowTime = new Date().now()
		let lockoutExpire = loginRec.timeout.getTime() + 1000 * 60 * minutes
		return nowTime > lockoutExpire
	}
				
	return new Promise((resolve, reject)=>{
		this.findOne({identityKey: key}).exec().then((loginRecord)=>{
		
			if(!loginRecord || loginRecord.failedAttempts < 10){
				return resolve(true)
			} 

			if( timeoutElapsed(loginRecord , 2) ){	
				this.find({identityKey: key}).remove()
				return resolve(true)
			}
				
			resolve(false)
		}).catch((err)=>{
			console.error(err);
		})
	})
})

LoginSchema.static('noteFailedLoginAttempt', function(key){
	return new Promise((resolve, reject)=>{
		let query = {identityKey: key}
		let updateParams = {$inc: {failedAttempts: 1}, timeout: new Date()}
		let options = {upsert: true, new: true}
		this.findOneAndUpdate( query, updateParams, options ).exec().then((resultRecord)=>{
			if(resultRecord){
				resolve(resultRecord)
			} 				
		}).catch((err)=>{
			console.error(err);
		})
	})
})

LoginSchema.static("noteSuccessfulLoginAttempt", function(key){
	return new Promise((resolve, reject)=>{
		this.find({identityKey: key}).remove().then((idKeyRecordToDelete)=>{
			resolve(idKeyRecordToDelete)
		}).catch((err)=>{
			console.error(err);
		})
	})
})
```


## Sessions
----
- uses *connect-mongo* dependency

### Security Measures
- Hide the session management middleware
  + set `name` property to '*id*' on express-session. This will change  the *set-cookie: connect.sid=...* in the headers to *set-cookie: id=...*

- set time to live (ttl) on MongoStore to limit length of session

- don't recycle sessions
```js
function _regenerateSession(req,res,next){

	return new Promise((resolve, reject)=>{
	  let userRecordJSON = req.user.toObject()
	  delete userRecordJSON.password
	  req.session.regenerate(function(err){
		  req.session.passport = userRecordJSON;
		  req.session.save(function(err){
				console.log('pw regenerated?', err)
				if(err) reject(err)
				resolve(userRecordJSON);
		  });
	 });		
	})
}
```

- 

### Configuration

in `./src-server/config/sessionConfig.js`
```js
const {sessionSecret} = require('../../secrets.js')
const session =  require('express-session')
const mongoStoreFactory =  require('connect-mongo')

module.exports = function(configObj){
	session.Session.prototype.login = function(user){
		this.userInfo = user
	}

	const MongoStore = mongoStoreFactory(session)

	return session({
		store: new MongoStore({
			url: configObj.dbUrl, 
			ttl: (1 * 60 * 60) 
		}),	
		secret: require('../../secrets.js').sessionSecret,
		resave: true,
		saveUninitialized: true,
		resave: false,
		cookie: {
			path: '/',
			httpOnly: true,
			secure: false
		},
		name: 'id'
	})

}
```


	