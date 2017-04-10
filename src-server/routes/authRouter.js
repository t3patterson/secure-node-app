let Router = require('express').Router;
let passport = require ('passport')
let {User} = require('../db/models/userModel.js')
let {Logins} = require('../db/models/loginsModel.js')

let {registerUser, getCurrentUser, logoutUser, authenticateUser } = require('../controllers/authController.js')(User, Logins)
const authRouter = Router()

authRouter
  .post('/register', registerUser)
  .get('/current', getCurrentUser)
  .post('/login', authenticateUser)
  .get('/logout', logoutUser)


module.exports = authRouter