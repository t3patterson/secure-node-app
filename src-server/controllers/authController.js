const passport = require('passport')

function delayResponse(cb){
	setTimeout(()=>{
		cb()
	}, 1000)
}

function authController(UserMod, LoginMod){

	function registerUser(req, res){
     // passport appends json-data to request.body
     // console.log(req.body)
     let newUser = new UserMod(req.body)

     UserMod.find({email: req.body.email}, function(err, results){
       if (err) return res.status(500).json(err)

       if(results !== null && results.length > 0 ) { 
         return res.status(401).send(`oops, record for <${req.body.email}> already exists`)
       }

       newUser.save((err, record)=>{
			
         if(err) {
				console.log(err)
				return res.status(500).json(err)
			}
         let userCopy = newUser.toObject()
         userCopy.password = undefined
         delete userCopy.password
         return res.json(userCopy).status(200)
       })
     })
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
		  console.log('resolved promise')
		  console.log(hasPermission);
		  delayResponse(()=>{
   	  	passport.authenticate('local', _handleAuth(req,res,next))(req,res,next)  
   	  })		
	  })
	  
   }
	
	function _handleAuth(req,res,next){
		return (err, validPw, info)=>{
        // failure callback triggered in passport-local strategy
		  if (err || !validPw) {
			 return LoginMod.noteFailedLoginAttempt(`${req.body.email}-${req.ip}`)
				.then((loginKeyData)=>{
					info.loginStatus = loginKeyData
					console.log("FAILED LOGIN")
					console.log(info)
					return res.status(403).json(info)
				}).catch((err)=>{
					console.error(err)
				})
		  }

		  let userRecord = info
		  req.login(info, (err)=>{
			  if (err) { return res.status(500).send(err) }
			  userRecord.password = undefined
			  delete userRecord.password
   		  LoginMod.noteSuccessfulLoginAttempt(`${req.body.email}-${req.ip}`)
			  return res.json(userRecord).status(200)
		  })
		}
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
