var express = require('express');
var router = express.Router();
var { createUserTable } = require('../model/userSchema')

const authController = require('../controller/authController')

createUserTable()
router.post('/signUp', authController.signUp)
router.post('/login', authController.login)


module.exports = router;
