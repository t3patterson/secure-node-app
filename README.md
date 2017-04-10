# Node App Security

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
```

```

	