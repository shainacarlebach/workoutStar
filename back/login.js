const express = require('express');
const mysql = require('mysql');
const expressValidator = require("express-validator");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const router = express.Router();
const fs = require('fs');
var _ = require('underscore');
var youtube = require('../library/googleyoutube');
var youtube = new youtube();

// create jwt token to be used as object 
let userToken = {};

const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    database: 'workoutstar',
    multipleStatements: true
});

conn.connect((err) => {
    if (err) {
        console.log("Cannot connect to Database" + err);
        return;
    }
    console.log('Connected');
});

module.exports = { router, userToken };
//create jwt with user payload 
const createToken = user => {
    return jwt.sign(user, 'my_secret_key', { expiresIn: 86400 * 1000 })
}


//retrieve payload from jwt
const decodeToken = (token, callback) => {
    jwt.verify(token, 'my_secret_key', callback)

}

router.use(cookieParser());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.use(expressValidator());

//check if email exists in db
router.post('/trainers/email', (req, res, next) => {
    //prevent sql injection 
    var sql = 'SELECT email FROM trainers where email =' + conn.escape(req.body.email);
    conn.query(sql, (err, rows) => {
        if (rows.length > 0) {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            } else {
                console.log(rows);
                return res.send(rows);
            }
        } else {
            return res.send(null);
        }
    })
})

//validate user before login
const validateUser = (req, res, next) => {
    var passre = "(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=[^0-9]*[0-9]).{8,}";
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('password', 'Password must be minimum eight to ten characters, at least one capital letter,one lowercase letter and one number.')
        .matches(passre);
    var errors = req.validationErrors();
    if (errors) {
        var response = { errors: [] };
        errors.forEach((err) => {
            response.errors.push(err.msg);
        });
        res.statusCode = 400;
        return res.json(response);
    }
    return next();
}
//validate user before register 
const validateNewUser = (req, res, next) => {
    var namere = "[a-zA-Z]*";
    req.checkBody('first_name', 'first_name is required').notEmpty();
    req.checkBody('first_name', 'firstname must be alpahanumeric characters only').matches(namere);
    req.checkBody('lastname', 'lastname is required').notEmpty();
    req.checkBody('lastname', 'lastname must be alpahanumeric characters only').matches(namere);
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('email', 'email must contain an @ character').isEmail();
    req.checkBody('password', 'password is required').notEmpty();
    
    var errors = req.validationErrors();
    if (errors) {
        var response = { errors: [] };
        errors.forEach((err) => {
            response.errors.push(err.msg);
        });
        res.statusCode = 400;
        return res.json(response);
    }
    return next();
}

//register new user , put payload in cookie
router.post('/register', validateNewUser, (req, res) => {
    var post = {
       first_name: req.body.first_name,lastname:req.body.lastname, email: req.body.email, password: req.body.password
            }
    //prevent sql injection 
    conn.query(`INSERT INTO trainers SET ?`, post, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send({ success: false, msg: 'User was not created' });
        } else {
            res.cookie('tokenid', createToken({ username: req.body.username, createdAt: new Date() }), { maxAge: 86400 * 1000 });
            res.send({ success: true, redirectToUrl: '/index.html' });
        }
    });
})


//user login
router.post('/login', validateUser, (req, res) => {
    //prevent sql injection 
    var sql = "SELECT * FROM ?? WHERE ?? = ? and ?? =?  ";
    var email = req.body.email;
    var password = req.body.password;
    var inserts = ['trainers', 'email', email, 'password', password]
    sql = mysql.format(sql, inserts)
    conn.query(sql, (err, rows) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {
            console.log(rows);

            var isAuthenticated = rows.length > 0;
            if (isAuthenticated) {
                const data = JSON.stringify(rows);
                   res.cookie('tokenid', createToken({ email: rows[0].email }), { maxAge: 86400 * 1000 })
                    console.log(createToken({ email: rows[0].email }), { maxAge: 86400 * 1000 });
                    res.status(200).send({ success: true, role: rows[0].role, toUrl: '/index.html' });
                }
                 else {
                return res.status(401).send({ success: false, msg: 'User not found, please register first !' })

            }
        }

    });

})

//router middleware to verify and create token 
router.use((req, res, next) => {
    let email = '';
    userToken.email = '';
    if (req.cookies.tokenid) {
        decodeToken(req.cookies.tokenid, (err, decoded) => {
            if (err) {
                console.log(err)
            } else {
                userToken.email = decoded.email;
                userToken.createdAt = decoded.createdAt;
                userMail = userToken.email;
                res.cookie('tokenid', req.cookies.tokenid, { maxAge: 86400 * 1000 })
            }
        });
    }
    next();
});


router.use(['/trainers'], (req, res, next) => {
    if (!userToken.email) {
        res.redirect('/login');
        return;
    }
    next();
});

router.use((req, res, next) => {
    userMail = userToken.email;
    next();
});

//get user details
router.get('/trainer', (req, res) => {
    var sql = 'SELECT * FROM trainers WHERE email =' + conn.escape(userMail);
    conn.query(sql, (err, rows) => {
        if (err || !rows[0].email) {
            console.log(err);
            res.status(500).send(err);
        }
        else {
            let user = rows[0];
            delete user.password;
            user.isNew = userToken.createdAt ? true : false;
            console.log(user);
            res.send(user);

        }
    })
});


//get name and  details of user
router.get('/trainer/:username', (req, res) => {

    conn.query(`SELECT * FROM trainers where username = '${userName}'`, (err, userdetails) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        }
        else {
            console.log(userdetails);
            res.send(userdetails)
        }
    })
})

router.get('/', function(req, res) {
    var code = (req.query.code) ? req.query.code : '';
    if(!youtube.isTokenExists()){
      if(!_.isEmpty(code)){
        tokens = youtube.getToken(code);   
        res.redirect('/index.html');     
      }else{
        var authURL = youtube.getAuthUrl();
        res.render('index', { title: 'Express', 'authURL':authURL});
      }	  
    }else{
      res.status(200).redirect('/index.html');  
    }  
  });
//user logout
router.get('/logout', (req, res, next) => {
    res.cookie('token', '', { expires: new Date(1), path: '/' });
    console.log('logging out')
    res.send('logged out');
});

