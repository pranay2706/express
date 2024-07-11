var createError = require('http-errors');
var validator = require('validator')
var bcrypt = require('bcrypt')

var Email = require('../utils/email')
var { createUser, getUserByUseremail } = require('../model/userSchema')
var jwt = require('jsonwebtoken')

async function isPasswordCorrect(candiatePassword, userPassword) {
    return await bcrypt.compare(candiatePassword, userPassword)
}

async function createAndSendToken(user, statusCode, res) {
    let token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' })

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

exports.signUp = async function (req, res, next) {
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
        return res.status(400).json({ error: 'Username must be alphanumeric and between 3 to 30 characters long' });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    if (!validator.isLength(password, { min: 6 })) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }


    if (await getUserByUseremail(email)) {
        return res.status(400).json({ error: 'User already exists. Please login' });
    }

    password = await bcrypt.hash(password, 12)

    try {
        const newUser = await createUser(username, email, password);
        await new Email(newUser).sendWelcome('Welocme to our family I hope you will enjoy')
        createAndSendToken(newUser, 201, res)
    } catch (err) {
        console.error('Error signing up:', err.message);
        res.status(500).json({ error: 'Failed to sign up' });
    }

}

exports.login = async function (req, res, next) {
    const { email, password } = req.body

    if (!email || !password) {
        return next(new Error('Enter a valid email and password'))
    }

    const user = await getUserByUseremail(email)


    if (!user || !await isPasswordCorrect(password, user.password)) {
        return next(new Error('Invalid email and password'))
    }

    createAndSendToken(user, 200, res)
}