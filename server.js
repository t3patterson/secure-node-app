//IMPORTS
//import webpack + webpack middleware;
global.chalk = require('chalk')
global.PROJECT_NAME = require('./src-server/config/projectName.js')

if(typeof PROJECT_NAME !== 'string' ){ 
	require('./src-server/cli/setProjectName.js')
	throw new Error(`\n${chalk.bgRed.bold('There must be a project name exported from :')} ${chalk.grey.bold('./src-server/config/projectName.js')} \n ${chalk.bgWhite.black(' you must execute: ')} ${chalk.cyan.bold('npm run set-project-name')}` ) 
}

const	bodyParser = require('body-parser')
const express = require('express') //import express web server
const renderFile = require('ejs').renderFile //import view templating engine 

const passport = require('passport')
const session = require('express-session')
const cookieParser = require('cookie-parser')

const configurePassport_Local = require('./src-server/config/passportConfig-local.js')

const configSession = require('./src-server/config/sessionConfig.js')
const connectToDB = require('./src-server/db/db-connect.js') //connect to db

const indexRouter = require('./src-server/routes/indexRouter.js')
const apiRouter = require('./src-server/routes/apiRouter.js')
const authRouter = require('./src-server/routes/authRouter.js')

const expressValidator = require('express-validator')

// =========
// RUN APP
// =========
// connect to DB
const dbLocation = connectToDB(PROJECT_NAME)
const app = express()




// =========
// Middleware
// =========

//configure bodyParser middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use( cookieParser() )
app.use( configSession({dbUrl: dbLocation}) )

app.use( expressValidator() )
// init passport and configure sessions w/ passport
app.use(passport.initialize())
app.use(passport.session())
configurePassport_Local()

// set port if exists in environment for heroku or live site, else set to 3000 for dev
const PORT = process.env.PORT || 3000
app.set('port', PORT)


//CONFIGURING TEMPLATING ENGINE FOR .HTML
//-----------------------
app.set('views', './dist');
app.engine('html', renderFile)
app.set('view engine', 'html');

// CONFIGURING STATIC FILES  (js, css, images)
// ------------------------------
// js, css, and imafiles from dist/assets/
app.use( express.static( `${__dirname}/dist`) );


// ------------------------------
// Wire up the router
// ------------------------------
app.use('/', indexRouter)
app.use('/api', apiRouter)
app.use('/auth', authRouter)


//---------------------
//EXECUTION SCRIPTS
//---------------------

//Tell Server to listen @ port-location
app.listen(PORT, function() {
	console.log(chalk.bold.bgGreen(` App listening on http://localhost:${PORT} `))
})
