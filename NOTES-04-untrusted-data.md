##Untrusted Data


### Good Rules
##### Rule 1: Any data that is being provided from an external source can be identified as untrusted
- form input values
- HTTP request header
  + User-Agent -- can be spoofed
 
##### Rule 2: If the data has crossed a trust boundary then it can be assumed to be untrusted data
- trust boundary === web server
  + local resources
  + static files
  + config files

- potentially untrusted sources
  + external api / services
  + http requests

Key question: What path has the data traveled?

##### Rule 3: Be aware of who has access to data
+ DBAs? 
+ Devs?
+ Services? 

##### Rule 4: Keep untrusted data as far away from critical systems as possible
+ Use validation middleware


### Remedy 1 - Data Validation Middleware
**(a)** in `server.js`, import  **[express-validator](https://github.com/ctavan/express-validator)** and use as middleware
```js
app.use( expressValidator() )
```

**(b)**
in `src-server/config/` create `validationSchema.js`
(example w/ the registration schema)
```js
const registrationSchema = {
	"email" : {
		notEmpty: true,
		isEmail: {
			errorMessage: "Invalid Email"
		}
	},
	"password": {
		notEmpty: true,
		errorMessage: "Invalid Password",
		isLength:{
			options: [{min: 12}],
			errorMessage: "Must be at least 12 characters"
		},
		matches: {
			options: ["(?=.*[a-zA-Z])(?=.*[0-9]+).*","g"],
			errorMessage: "Password must be alphanumeric"
		}
	}
}

module.exports = {
	registrationSchema
}
```

**(c)**
in `src-server/middleware/` create `validateValues.js`
```js
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
```



### Remedy 2 - Database Validation Schema

### Remedy 3 - Escaping Untrusted Data
**Escaping** is a technique to ensure that characters are *treated as data* and *NOT to be executed*.

Example:  `<script>` --> `&lt;script&lt;`

