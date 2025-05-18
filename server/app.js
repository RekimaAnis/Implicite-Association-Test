const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user'); 
var wordRouter = require('./routes/word'); 
const accessRouter = require('./routes/access.route');



var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/html', express.static(path.join(__dirname, '../client/html')));
app.use('/css', express.static(path.join(__dirname, '../client/css')));
app.use('/javascripts', express.static(path.join(__dirname, '../client/javascripts')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../client/html')));


app.use('/', indexRouter);
app.use('/word', wordRouter);
app.use('/user', userRouter);
app.use('/access', accessRouter);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
