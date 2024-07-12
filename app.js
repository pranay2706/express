var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var dotenv = require('dotenv')

dotenv.config({ path: './config.env' })

var { connectSQLDB } = require('./sqlDbConnection')
var { logErr } = require('./utils/winston')
connectSQLDB()

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);


app.use(function (err, req, res, next) {
  res.locals.message = err.message;
  res.status(err.status || 500);
  logErr(err)
  res.json({
    status: "fail",
    message: err.message
  })
});

module.exports = app;
