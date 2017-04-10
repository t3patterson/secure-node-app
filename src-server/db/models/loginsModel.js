const mongoose = require('mongoose');
const Schema = mongoose.Schema

const LoginSchema = new Schema({
	identityKey: {
		type: String,
		required: true,
		index: {
			unique: true
		}
	},
	failedAttempts: {
		type: Number,
		required: true,
		default: 0
	},
	timeout: {
		type: Date,
		required: true,
		default: new Date()
	},
	
	inProgress: {
		type: Boolean
	}
})

LoginSchema.static('canAuthenticate', function(key){
	console.log('CAN auth????');
	return new Promise((resolve, reject)=>{
		this.findOne({identityKey: key}).exec().then((loginRecord)=>{
			console.log('user login record found for __', key ,'__');
			if(!loginRecord || loginRecord.failedAttempts < 10){
				console.log( 'can login:', '--', loginRecord )
				resolve(true)
			} else {
				console.log( 'cannot login. too much fail:', '--', loginRecord )
				resolve(false)
			}
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
		console.log('updating???')
		this.findOneAndUpdate( query, updateParams, options ).exec().then((resultRecord)=>{
			console.log('KEY found', resultRecord)
			if(resultRecord){
				resolve(resultRecord)
			} 				
		}).catch((err)=>{
			console.error(err);
		})
	})
})

LoginSchema.static("noteSuccessfulLoginAttempt", function(key){
	console.log('login is so successful!');
	return new Promise((resolve, reject)=>{
		this.find({identityKey: key}).remove().then((idKeyRecordToDelete)=>{
			console.log('deleting key:', idKeyRecordToDelete)
			resolve(idKeyRecordToDelete)
		}).catch((err)=>{
			console.error(err);
		})
		
	})
})


let Logins = mongoose.model('Login', LoginSchema)
module.exports = {
	Logins
}