const passport = require('passport')

function delayResponse(cb){
	setTimeout(()=>{
		cb()
	}, 1000)
}

function authController(UserMod, LoginMod){
   
	function _regenerateSession(req,res,next){

		return new Promise((resolve, reject)=>{
		  let userPassport = Object.assign({},req.session.passport)
   	  req.session.regenerate(function(err){
	        req.session.passport = userPassport;
	        req.session.save(function(err){
					if(err) reject(err)
	            resolve(true);
	        });
	     });
		})
	}
	
	function _handleAuth(req, res, next){
		return (err, validPw, info)=>{
        // failure callback triggered in passport-local strategy
		  if (err || !validPw) {
			 return LoginMod.noteFailedLoginAttempt(`${req.body.email}-${req.ip}`)
				.then((loginKeyData)=>{
					info.loginStatus = loginKeyData
					return res.status(403).json(info)
				}).catch((err)=>{
					console.error(err)
				})
		  }

		  let userRecord = info
		  req.login(info, (err)=>{
			  if (err) { 
				console.error(err)
				return res.status(500).send(err) 
			  }
   		  LoginMod
				.noteSuccessfulLoginAttempt(`${userRecord.email}-${req.ip}`)
				.then( (d)=>{ return _regenerateSession(req,res,next) } )
				.then(()=>{
				   let userRecordJSON = req.user.toObject()
				   delete userRecordJSON.password
					return res.json(userRecordJSON).status(200) 
				})
				.catch((err)=> { console.error(err); res.status(500).send(err)} )
		  })
		}
	}
	
	function _handleUserSave(req, res, next){	
	  return (err, results) => {
		 
		 let newUser = new UserMod(req.body)

  	    if (err) return res.status(500).json(err)

  	    if(results !== null && results.length > 0 ) { 
  		    return res.status(401).json({msg: `oops, record for <${req.body.email}> already exists`})
  	    }

  	    newUser.save((err, record)=>{
	  		 if(err) {
	  			 return res.status(500).json(err)
	  		 }
	  		 let userRecordJSON = newUser.toObject()
	  		 delete userRecordJSON.password
	  		 return res.json(userRecordJSON).status(200)
	  	 })
	  }
	  
	}
	
	function registerUser(req, res){
     // passport appends json-data to request.body
     // console.log(req.body)
     UserMod.find({email: req.body.email}, _handleUserSave(req,res) )
   }

	function getCurrentUser (req, res) {
     if (req.user) {
			return res.json({user: req.user}).status(200);
	  } else {
         return res.json({user: null}).status(200)
	  }
   }

	function authenticateUser(req, res, next){
	  LoginMod.canAuthenticate(`${req.body.email}-${req.ip}`).then((hasPermission)=>{
		  delayResponse(()=>{
   	  	passport.authenticate('local', _handleAuth(req,res,next))(req,res,next)  
   	  })		
	  })
   }
	
	function logoutUser(req, res) {
     if (!req.user) { return res.json({msg: 'error: no current user'}).status(200) }
     
	  let email = req.user.email
     req.logout()
     return res.json({msg: `user <${email}> logged out`}).status(200) 
   }

	return {
		registerUser,
		getCurrentUser,
		authenticateUser,
		logoutUser
	}
}

module.exports = authController
