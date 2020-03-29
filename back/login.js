const express = require('express');
const mysql = require('mysql');
const expressValidator = require("express-validator");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const creditCardRegex = require('credit-card-regex');
const router = express.Router();
const fs = require('fs');

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

//check if id exists in db
router.post('/user/id', (req, res, next) => {
    //prevent sql injection 
    var sql = 'SELECT id FROM user where id =' + conn.escape(req.body.id);
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

//check if username exists in db
router.post('/customer/name', (req, res, next) => {
    //prevent sql injection 
    var sql = 'SELECT username FROM user where username =' + conn.escape(req.body.username);
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
    var namere = "[a-zA-Z ]*";
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('username', 'username must be alpahanumeric characters only').matches(namere);
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
    req.checkBody('id', 'ID is required').notEmpty();
    req.checkBody('id', 'ID must be 1-9 digits only ').isLength({ min: 1, max: 9 });
    req.checkBody('username', 'username is required').notEmpty();
    req.checkBody('username', 'username must be alpahanumeric characters only').matches(namere);
    req.checkBody('email', 'email is required').notEmpty();
    req.checkBody('email', 'email must contain an @ character').isEmail();
    req.checkBody('password', 'password is required').notEmpty();
    req.checkBody('city', 'city is required').notEmpty();
    
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
        id: req.body.id, username: req.body.username, email: req.body.email, password: req.body.password,
        city: req.body.city, role: req.body.role
    }
    //prevent sql injection 
    conn.query(`INSERT INTO customer SET ?`, post, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send({ success: false, msg: 'Customer was not created' });
        } else {
            res.cookie('tokenid', createToken({ username: req.body.username, createdAt: new Date() }), { maxAge: 86400 * 1000 });
            res.send({ success: true, redirectToUrl: '/customer' });
        }
    });
})


//user login
router.post('/login', validateUser, (req, res) => {
    //prevent sql injection 
    var sql = "SELECT * FROM ?? WHERE ?? = ? and ?? =?  ";
    var username = req.body.username;
    var password = req.body.password;
    var inserts = ['user', 'username', username, 'password', password]
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
                if (rows[0].role === "user") {
                    res.cookie('tokenid', createToken({ username: rows[0].username }), { maxAge: 86400 * 1000 })
                    console.log(createToken({ username: rows[0].username }), { maxAge: 86400 * 1000 });
                    res.status(200).send({ success: true, role: rows[0].role, toUrl: '/user' });
                }
                else if (rows[0].role === "trainer") {
                    console.log(createToken({ username: rows[0].username }), { maxAge: 86400 * 1000 });

                    res.cookie('tokenid', createToken({ username: rows[0].username }), { maxAge: 86400 * 1000 })
                    res.status(200).send({ success: true, role: rows[0].role, toUrl: '/trainer' });
                }
            } else {
                return res.status(401).send({ success: false, msg: 'User not found, please register first !' })

            }
        }

    });

})

//router middleware to verify and create token 
router.use((req, res, next) => {
    let userName = '';
    userToken.username = '';
    if (req.cookies.tokenid) {
        decodeToken(req.cookies.tokenid, (err, decoded) => {
            if (err) {
                console.log(err)
            } else {
                userToken.username = decoded.username;
                userToken.createdAt = decoded.createdAt;
                userName = userToken.username;
                res.cookie('tokenid', req.cookies.tokenid, { maxAge: 86400 * 1000 })
            }
        });
    }
    next();
});


router.use(['/user', '/trainer'], (req, res, next) => {
    if (!userToken.username) {
        res.redirect('/login');
        return;
    }
    next();
});

router.use((req, res, next) => {
    userName = userToken.username;
    next();
});

//get user details
router.get('/user', (req, res) => {
    var sql = 'SELECT * FROM user WHERE username =' + conn.escape(userName);
    conn.query(sql, (err, rows) => {
        if (err || !rows[0].username) {
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


//get list of cities for address
router.get('/cities', (req, res) => {
    conn.query(`SELECT * FROM cities ORDER BY name`, (err, cities) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        }
        else {
            console.log(cities)
            res.send(cities);
        }
    });
});

//get city of user
//router.get('/city/:username', (req, res) => {
//      conn.query(`SELECT cities.name,cities.value FROM cities 
//INNER JOIN user ON user.city =cities.value WHERE username ='${userName}'`, (err, city) => {
//      if (err) {
//        console.log(err);
//      res.status(500).send(err);
//      }
//    else {
//      console.log(city);
//    res.send(city)
//  }
// })
//})


//get name and  address of user
router.get('/customer/:username', (req, res) => {

    conn.query(`SELECT * FROM user where username = '${userName}'`, (err, userdetails) => {
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

// validate address , dates and credit card
const validateDetails = (req, res, next) => {
    var pattern = /^\d{4}-\d{2}-\d{2}$/;
    req.checkBody('city', 'city is required').notEmpty();
    req.checkBody('creditcard', 'credit card is required').notEmpty();

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

const ValidateCreditCardNumber = (req, res, next) => {

    var ccNum = req.body.creditcard.value;
    var visaRegEx = /^(?:4[0-9]{12}(?:[0-9]{3})?)$/;
    var mastercardRegEx = /^(?:5[1-5][0-9]{14})$/;
    var amexpRegEx = /^(?:3[47][0-9]{13})$/;
    var discovRegEx = /^(?:6(?:011|5[0-9][0-9])[0-9]{12})$/;
    var isValid = false;

    if (visaRegEx.test(ccNum)) {
        isValid = true;
    } else if (mastercardRegEx.test(ccNum)) {
        isValid = true;
    } else if (amexpRegEx.test(ccNum)) {
        isValid = true;
    } else if (discovRegEx.test(ccNum)) {
        isValid = true;
    }

    if (isValid) {
        return res.send("Thank You!");
    }
    return next();
}

router.use((req, res, next) => {
    userName = userToken.username;
    next();
});


//user logout
router.get('/logout', (req, res, next) => {
    res.cookie('token', '', { expires: new Date(1), path: '/' });
    console.log('logging out')
    res.send('logged out');
});

