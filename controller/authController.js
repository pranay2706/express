var createError = require('http-errors');
var validator = require('validator')
var bcrypt = require('bcrypt')
var jwt = require('jsonwebtoken')
var { promisify } = require('util')

var catchAsync = require('../utils/catchAsync')
var Email = require('../utils/email')
var { createUser, getUserByUseremail } = require('../model/userSchema')

async function isPasswordCorrect(candiatePassword, userPassword) {
    return await bcrypt.compare(candiatePassword, userPassword)
}

async function createAndSendToken(user, statusCode, res) {
    let token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '30d' })

    const cookieOptions = {
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
        httpOnly: true,
    }

    if (process.env.NODE_ENV === 'production') cookieOptions.secure = true

    res.cookie('jwt', token, cookieOptions)

    user.password = undefined

    res.status(statusCode).json({
        status: "success",
        data: {
            user
        }
    })
}

exports.signUp = catchAsync(async function (req, res, next) {
    let { username, email, password } = req.body

    if (!username) {
        return next(new Error('Enter a username'))
    }

    if (!email) {
        return next(new Error('Enter a email'))
    }

    if (!password) {
        return next(new Error('Enter a password'))
    }

    if (!validator.isAlphanumeric(username) || !validator.isLength(username, { min: 3, max: 30 })) {
        return next(new Error('Username must be alphanumeric and between 3 to 30 characters long'));
    }

    if (!validator.isEmail(email)) {
        return next(new Error('Please enter a valid email address'));
    }

    if (!validator.isLength(password, { min: 6 })) {
        return next(new Error('Password must be at least 6 characters long'));
    }


    if (await getUserByUseremail(email)) {
        return next(new Error('User already exists. Please login'));
    }

    password = await bcrypt.hash(password, 12)


    const newUser = await createUser(username, email, password);
    await new Email(newUser).sendWelcome('Welocme to our family I hope you will enjoy')
    createAndSendToken(newUser, 201, res)

})

exports.login = catchAsync(async function (req, res, next) {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new Error('Enter a valid email and password'))
    }

    const user = await getUserByUseremail(email)


    if (!user || !await isPasswordCorrect(password, user.password)) {
        return next(new Error('Invalid email and password'))
    }

    createAndSendToken(user, 200, res)
})

exports.protect = catchAsync(async (req, res, next) => {

    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }

    if (!token) {
        return next(new AppError('You are not logged in! Please login', 401))
    }

    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    const currentUser = await getUserByUseremail(decoded.email)

    if (!currentUser) {
        return next(new Error('User no longer exists'))
    }

    req.user = currentUser;

    next()
})