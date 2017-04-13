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
		console.log('watt???')
		this.find({identityKey: key}).remove().then((idKeyRecordToDelete)=>{
			resolve(idKeyRecordToDelete)
		}).catch((err)=>{
			console.log(err);
			reject(err)
		})
	})
})


let Logins = mongoose.model('Login', LoginSchema)
module.exports = {
	Logins
}