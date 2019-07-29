var _ = require("lodash");
var express = require("express");
var bodyParser = require("body-parser");
var jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
var passport = require("passport");
var passportJWT = require("passport-jwt");
var session = require('express-session');
var jwt_decode = require('jwt-decode');
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;
var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
jwtOptions.secretOrKey = 'tasmanianDevil';
const uuidv4 = require('uuid/v4');
uuidv4(); 
var users;
var jwtOptions = {}
jwtOptions.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('JWT');
jwtOptions.secretOrKey = 'tasmanianDevil';

var strategy = new JwtStrategy(jwtOptions, function(jwt_payload, next) {
  console.log('payload received', jwt_payload);
  pool.query('SELECT * FROM users', (error, results) => {
    //console.log("results.rows", results.rows)
        users = results.rows;
        var user = users[_.findIndex(users, {id: jwt_payload.id})];
        if (user) {
          next(null, user);
        } else {
          next(null, false);
        }
    })

});

passport.use(strategy);

var app = express();
app.use(passport.initialize());

app.use(bodyParser.urlencoded({
  extended: true
}));

// parse application/json
app.use(bodyParser.json())
app.use(cookieParser());
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: 600000
  }
}))
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'api',
  password: 'Cel@123',
  port: 5432,
})

const createUser = (request, response) => {
  var email = request.body.email;
  var users;
  pool.query('SELECT * FROM users', (error, results) => {
      users = results.rows;
      var user = users[_.findIndex(users, {email: email})];
      if(user){
        response.status(401).json({message:"User already registered with same email id"});
      }else{
        const { name, email, password, address, token } = request.body
        pool.query('INSERT INTO users (name, email, password, address) VALUES ($1, $2, $3, $4)', [name, email, password, address], (error, results) => {
          if (error) {
            throw error
          }
          response.json({message: "User registered succesfully"});
        })
      }
      return response;
    });
}

const updateUser = (request, response) => {
  const id = parseInt(request.params.id)
  const { name, email, password, address } = request.body
  const browser = request.body.browserName;
  console.log("request came from browser", browser);
  pool.query(
    'UPDATE users SET name = $1, email = $2, password = $3, address = $4 WHERE id = $5',
    [name, email, password, address, id],
    (error, results) => {
      if (error) {
        throw error
      }
      response.json({message: "User updated successfully"});
    }
  )
}

app.get("/", function(req, res) {
  res.json({message: "Express is up!"});
});

app.post("/login", function(req, res) {
  var email = req.body.email;
  var users;
  pool.query('SELECT * FROM users', (error, results) => {
      users = results.rows;
      var user = users[_.findIndex(users, {email: email})];
      if( ! user ){
        res.status(401).json({message:"no such user found"});
      }
    
      if(user.password === req.body.password) {
        var payload = {id: user.id};
        var token;
        if(user.token == null){
          token = [jwt.sign(payload, jwtOptions.secretOrKey)]
          pool.query('UPDATE users SET token = $1 WHERE id = $2', [token, user.id], (error, results) => {
            if (error) {
              throw error
            }
            res.json({message: "Successfully logged in", token: token});
          })
        } else if(user.token && user.token.length == 5){
            return res.json({message: "Maximum login limit per user is reached"});
        } else {
          var newToken = jwt.sign(payload, jwtOptions.secretOrKey);
          user.token.push(newToken);
          pool.query('UPDATE users SET token = $1 WHERE id = $2', [user.token, user.id], (error, results) => {
            if (error) {
              throw error
            }
            res.json({message: "Successfully logged in", token: newToken});
          })
        }        
      } else {
        res.status(401).json({message:"passwords did not match"});
      }
  })
});

app.post('/register', createUser)
app.post('/updateUser/:id', updateUser)

app.post('/logout', function(req, res){
  var decoded = jwt_decode(req.body.token);
  pool.query('SELECT token FROM users WHERE id = $1', [decoded.id], (error, results) => {
    results.rows[0].token.splice( results.rows[0].token.indexOf(req.body.token), 1 );
    pool.query('UPDATE users SET token = $1 WHERE id = $2', [results.rows[0].token, decoded.id], (error, results) => {
      if (error) {
        throw error
      }
      res.json({message: "Successfully logged out"});
    })
  })
});

app.listen(3005, function() {
  console.log("Express running");
});

module.exports = {
  createUser,
}

