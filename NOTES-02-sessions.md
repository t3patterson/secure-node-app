
## Sessions
----
- uses *connect-mongo* dependency

### Security Measures
- Hide the session management middleware
  + set `name` property to '*id*' on express-session. This will change  the *set-cookie: connect.sid=...* in the headers to *set-cookie: id=...*

- set time to live (ttl) on MongoStore to limit length of session

- don't recycle sessions (regenerate sessions)
```js
function _regenerateSession(req,res,next){

	return new Promise((resolve, reject)=>{
	  let userRecordJSON = req.user.toObject()
	  delete userRecordJSON.password
	  req.session.regenerate(function(err){
		  req.session.passport = userRecordJSON;
		  req.session.save(function(err){
				if(err) reject(err)
				resolve(userRecordJSON);
		  });
	 });		
	})
}
```

- HttpOnly flag -- makes session cookie only available to the browser. Other scripts can't access your application's cookie (cannot access session info with `document.cookie`).

- Forbid the *set-cookie* Response Header from being sent revealing the session id if there is mixed content served over http

### Session Configuration
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
			httpOnly: false,
			secure: false
		},
		name: 'id'
	})

}
```
