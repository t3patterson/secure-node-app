const {registrationSchema} = require('../config/validationSchema.js')

function validateData(validationRequirement){
	return (req, res, next)=>{
		switch(validationRequirement){
			case "NEW_USER":
				req.checkBody(registrationSchema)
				break;
			default:
				//no-op
		}	
		const errors = req.validationErrors();
		if(errors){
			return  res.status(400).json("To many errors, in your validation, bits")

		}
		
		next()
	}
}

module.exports = validateData