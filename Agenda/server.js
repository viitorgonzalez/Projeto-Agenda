require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const path = require('path');
const helmet = require('helmet');
const csrf = require('csurf');

const { middlewareGlobal, checkCsrfError, csrfMiddleware } = require('./src/middlewares/middleware');
const routes = require('./routes');

const app = express();

// Configuração do banco de dados
mongoose.connect(process.env.CONNECTIONSTRING, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.emit('ready');
  })
  .catch(e => console.log(e));

// Configuração do middleware helmet para segurança
app.use(helmet());

// Middleware para lidar com dados enviados através do corpo da requisição (URL-encoded)
app.use(express.urlencoded({ extended: true })); 

// Middleware para lidar com dados enviados em formato JSON
app.use(express.json());

// Configuração da pasta 'public' como pasta estática para arquivos estáticos (CSS, imagens, etc.)
app.use(express.static(path.resolve(__dirname, 'public')));

// Configuração das opções de sessão
const sessionOptions = session({
  secret: '12345abcd',
  store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // O cookie vai durar 7 dias
    httpOnly: true
  }
});
app.use(sessionOptions);
app.use(flash());

// Configuração da pasta 'views' como local dos arquivos de visualização (views)
app.set('views', path.resolve(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

// Middleware para proteção contra CSRF
app.use(csrf());

// Nossos próprios middlewares
app.use(middlewareGlobal);
app.use(checkCsrfError);
app.use(csrfMiddleware);
app.use(routes);

app.on('ready', () => {
  app.listen(process.env.PORT, () => {
    console.log('Acessar http://localhost:3000');
    console.log('Servidor executando na porta 3000');
  });
});