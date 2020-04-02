const express = require('express');
const mysql = require('mysql');
const { check, validationResult } = require("express-validator");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');
const router = express.Router();
const fs = require('fs');
const upload = require('./upload');

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
//router.use(expressValidator());
router.use(upload);

//check if url exists in db
router.post('/videos/url', (req, res, next) => {
    //prevent sql injection 
    var sql = 'SELECT url FROM videos where url =' + conn.escape(req.body.url);
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

//register new video , put payload in cookie
router.post('/videoupload', (req, res) => {
    var post = {
        id: req.body.id,
        title: req.body.title,
        equipment: req.body.equipment,
        type: req.body.type,
        duration: req.body.duration,
        url: req.body.url,
        img: req.body.img
    }
           //prevent sql injection 
    conn.query(`INSERT INTO videos SET ?`, post, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send({ success: false, msg: 'video was not created' });
        } else {
            console.log(data);
            res.cookie('tokenid', createToken({ id: req.body.id, createdAt: new Date() }), { maxAge: 86400 * 1000 });
            res.send({ success: true, redirectToUrl: '/index.html' });
        }
    });
})


//register new user , put payload in cookie
router.post('/user', (req, res) => {
    var post = {
        id: req.body.id,
        username: req.body.username,
        type:req.body.type,
        url:req.body.url,
        rating: req.body.rating,
        tag_workout_type: req.body.tag_workout_type
           }
           //prevent sql injection 
    conn.query(`INSERT INTO users SET ?`, post, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send({ success: false, msg: 'user was not created' });
        } else {
            res.cookie('tokenid', createToken({ id: req.body.id, createdAt: new Date() }), { maxAge: 86400 * 1000 });
            res.send({ success: true, redirectToUrl: '/index.html' });
        }
    });
})

//user login
router.post('/login', (req, res) => {
    //prevent sql injection 
    var sql = "SELECT * FROM ?? WHERE ?? = ? and ?? =?  ";
    var username = req.body.username;
    var type = req.body.type;
    var inserts = ['users', 'username', username, 'type',type]
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
                res.cookie('tokenid', createToken({ username: rows[0].username }), { maxAge: 86400 * 1000 })
                console.log(createToken({ username: rows[0].username }), { maxAge: 86400 * 1000 });
                res.status(200).send({ success: true,toUrl: '/index.html' });
            }
            else {
                return res.status(401).send({ success: false, msg: 'User not found, please register first !' })

            }
        }

    });

})
//get video by filter
router.post('/filtervideo',(req,res)=>{
    //prevent sql injection 
    var sql = "SELECT * FROM ?? WHERE ?? = ? , ??=? and ?? =?  ";
    var equipment= req.body.equipment;
    var type= req.body.type;
    var duration =req.body.duration;
    var inserts = ['videos', 'equipment', equipment, 'type',type, 'duration', duration]
    sql = mysql.format(sql, inserts)
    conn.query(sql, (err, rows) => {
        if (err) {
            console.log(err);
            res.send(err);
        } else {}
            console.log(rows);
            res.send(JSON.stringify(rows));

})
})

//router middleware to verify and create token 
router.use((req, res, next) => {
    let username = '';
    userToken.username = '';
    if (req.cookies.tokenid) {
        decodeToken(req.cookies.tokenid, (err, decoded) => {
            if (err) {
                console.log(err)
            } else {
                userToken.username = decoded.username;
                userToken.createdAt = decoded.createdAt;
                userMail = userToken.username;
                res.cookie('tokenid', req.cookies.tokenid, { maxAge: 86400 * 1000 })
            }
        });
    }
    next();
});


router.use(['/users'], (req, res, next) => {
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
    var sql = 'SELECT * FROM users WHERE username =' + conn.escape(userName);
    conn.query(sql, (err, rows) => {
        if (err || !rows[0].username) {
            console.log(err);
            res.status(500).send(err);
        }
        else {
            let user = rows[0];
           // delete user.password;
            user.isNew = userToken.createdAt ? true : false;
            console.log(user);
            res.send(user);

        }
    })
});


//get name and  type videos of user
router.get('/users/:type', (req, res) => {

    conn.query(`SELECT * FROM users where type = '${type}'`, (err, userdetails) => {
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

//get videos uploaded by type
router.get('/videos/:type', (req, res) => {

    conn.query(`SELECT * FROM videos where type ='${type}'`, (err, videodetails) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
        }
        else {
            console.log(videodetails);
            res.send(videodetails)
        }
    })
})
// get all videos 
router.get('/allVideos', (req, res) => {

    conn.query(`SELECT * FROM videos`, (err, rows) => {
        if (err) {
            res.status(500).send(err);
           
        } else {
            res.send(JSON.stringify(rows));
        }

    })
});

//get product by search text bar 
router.get('/videos/search/:text', (req, res) => {
    const text = req.params.text;
    conn.query(`SELECT DISTINCT title, equipment, videos.type,duration FROM videos WHERE videos.type LIKE '%${text}%' OR videos.equipment LIKE '%${text}%'`,
     (err, videosearch) => {
            if (err) {
                res.status(500).send({ message: "Video doesn't exist" });
            } else {
                res.send(videosearch);
            }
        })
});
//user logout
router.get('/logout', (req, res, next) => {
    res.cookie('token', '', { expires: new Date(1), path: '/' });
    console.log('logging out')
    res.send('logged out');
});
