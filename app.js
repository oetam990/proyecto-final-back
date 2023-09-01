var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require('express-fileupload');
var cors = require('cors');
require('dotenv').config();
var pool = require('./models/db');
var cloudinary = require('cloudinary').v2;

var usuarioModel = require('./models/usuarioModel');
const session = require('express-session');
var indexRouter = require('./routes/index');
var loginRouter = require('./routes/admin/index');
var indexPropiedadesRouter = require('./routes/admin/propiedades');
var indexAgentesRouter = require('./routes/admin/agentes');
var apiRouter = require('./routes/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(session({
  secret: 'hsdhuyrbfjfkkdfsjad',
  resave: false,
  saveUninitialized: true,
}));
secured = async (req, res, next) => {
  try {
    if (req.session.usuario) {
      next();
    } else {
      res.redirect('/admin');
    }
  } catch (error) {
    console.log(error)
  }
}

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/temp/'
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', loginRouter);
app.use('/admin/propiedades', secured, indexPropiedadesRouter);
app.use('/admin/agentes', secured, indexAgentesRouter);
app.use('/api', cors(), apiRouter);
app.post('/ingresar', async (req, res, next) => {
  try {
    const usuario = req.body.usuario;
    const password = req.body.password;
    var data = await usuarioModel.login(usuario, password)
    if (data != undefined) {
      req.session.usuario = data.id
      req.session.nombre = data.username
      req.session.password = password
      req.session.rol = data.rol == 1
      if (data.img_perfil != '') {
        const imagen = cloudinary.image(data.img_perfil, {
          class: 'img-fluid dropdown-user-img'
        });
        req.session.imagen = imagen
      }
      res.redirect('admin/propiedades')
    } else {
      res.render('admin/login', {
        error: true
      })
    }
  } catch (error) {
    console.log(error);
  }
});
app.get('/salir', function (req, res) {
  req.session.destroy()
  res.redirect('/admin')
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
