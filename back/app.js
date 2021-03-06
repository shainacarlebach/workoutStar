//use const to increase runtime efficiency of code, const replaced at runtime in compiled language 

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const busboy = require("then-busboy");
const upload =require('./routes/upload');
const login= require('./routes/login');

const app = express();
app.use(express.json());
const root = path.join(__dirname,'../front');
var corsOptions ={
  origin:'http://localhost:3000',
     credentials: true
};


app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use (express.static(root));
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(upload);
app.use(login.router);

  app.get('/',(req, res) => {
     res.sendFile('index.html', { root })
 });

app.listen(3000,() => {
    console.log('3000 is ready')
});
