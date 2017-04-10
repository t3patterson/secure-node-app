const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

// ----------------------
// USERS
// ----------------------
const UsersSchema = new Schema({
  // required for authentication: DO NOT TOUCH Or You May Get Punched
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
  // x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x..x
  
   // example of optional fields
  username:  { type: String },
  createdAt: { type: Date, default: Date.now }

})

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

UsersSchema.pre('save', hashNewPassword )

UsersSchema.methods.checkPasswordToHash = function(inputPW, callback){
	let userRecord = this
	return new Promise( handlePasswordCompare(inputPW, userRecord) )
}

module.exports = {
  User: mongoose.model('User', UsersSchema)
}
