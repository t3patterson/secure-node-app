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

