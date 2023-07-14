/**
 * This is the server-side javascript for the Village Idiot app. It supports a connection to mongodb and sets up
 * three schemas: one for stats, one for users, and one for reviews of the website. Our server also supports sessions.
 * There are routes for account creation, logging in, retrieving and updating stats, submitting a review, and searching
 * for other user accounts.
 */

const express = require("express");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const crypto = require('crypto');

//Connect to mongodb database 
const connectionString = 'mongodb+srv://abc123:village@village.rt1js3a.mongodb.net/test';

mongoose.connect(connectionString, {useNewUrlParser:true});
mongoose.connection.on('error', ()=>{
  console.log("There was a problem connecting to mongoose");
  return;
});

//Schema for stats
var StatsSchema = new mongoose.Schema( {
  username: String,
  wins: Number,
  losses: Number,
  gamesPlayed: Number,
  winPercentage: Number,
});
var Stats = mongoose.model('Stats', StatsSchema);

//Schema for users
var UserSchema = new mongoose.Schema( {
  username: String,
  salt: Number,
  hash: String,
  //following: [String],
});
var User = mongoose.model('User', UserSchema);

//Schema for reviews
var ReviewSchema = new mongoose.Schema( {
  username: String,
  rating: Number,
  positives: String,
  improve: String
});
var Review = mongoose.model('Review', ReviewSchema);

//List of sessions for all the users currently logged in 
let sessions = [];

/**
 * This function adds a session to the session list for the user
 * @param {String} user - the username
 * @returns 
 */
function addOrUpdateSession(user) {
  let sessionId = Math.floor(Math.random() * 100000);
  let sessionStart = Date.now();
  if (user in sessions) {
    sessions[user].start = sessionStart;
    sessionId = sessions[user].sid;
  } else {
    sessions[user] = { 'sid': sessionId, 'start': sessionStart };
  }
  return sessionId;
}

/**
 * This function determines if the user has a session.
 * @param {String} user - username
 * @param {Number} sessionId - the session id
 * @returns 
 */
function doesUserHaveSession(user, sessionId){
    let entry = sessions[user];
    if (entry != undefined){
        return entry.sid == sessionId;
    }
    return false;
}

const SESSION_LENGTH = 60000*10;

/**
 * This function deletes sessions that are expired.
 */
function cleanupSessions () {
  let currentTime = Date.now();
  for (i in sessions) {
    let sess = sessions[i];
    if (sess.start + SESSION_LENGTH < currentTime){
      delete sessions[i];
    }
  }
}

setInterval(cleanupSessions, 2000);

/**
 * This function checks at every page load that the user has a valid session, and if not they 
 * are redirected to the login page.
 * @returns None
 */
function authenticate(req, res, next){
    let c = req.cookies;
    if (c && c.login){
        let result = doesUserHaveSession(c.login.username, c.login.sid);
        if (result) {
            addOrUpdateSession();
            next();
            return;
        }
    }
    res.redirect('/index.html');
}


const app = express();
app.use(cookieParser());

app.use(express.json());

app.use('/account.html', authenticate);
app.use('/home.html', authenticate); 
app.use('/play2people.html', authenticate);
app.use('/play3people.html', authenticate);



app.use(express.static('public_html'));
app.use(express.json());

app.get('/account/create/:username/:password', (req, res) => {
  let p1 = User.find({username: req.params.username}).exec();
  p1.then( (results) => { 
    if (results.length > 0) {
      res.end('FAIL');
    } else {

      let newSalt = Math.floor((Math.random() * 1000000));
      let toHash = req.params.password + newSalt;
      var hash = crypto.createHash('sha3-256');
      let data = hash.update(toHash, 'utf-8');
      let newHash = data.digest('hex');

      var newStats = new Stats({ 
        username: req.params.username,
        wins: 0,
        losses: 0,
        gamesPlayed: 0,
        winPercentage: 0,
      });

      var newUser = new User({ 
        username: req.params.username,
        salt: newSalt,
        hash: newHash
      });
      newUser.save().then( (doc) => { 
          newStats.save()
          res.end('SUCCESS');
        }).catch( (err) => { 
          res.end('FAIL');
        });
    }
  });
  p1.catch( (error) => {
    res.end('Failed to create new account.');
  });
});

//route for user login
app.get('/account/login/:username/:password', (req, res) => {
  let u = req.params.username;
  let p = req.params.password;
  let p1 = User.find({username:u}).exec();
  p1.then( (results) => { 
    if (results.length == 1) {

      let existingSalt = results[0].salt;
      let toHash = p + existingSalt;
      var hash = crypto.createHash('sha3-256');
      let data = hash.update(toHash, 'utf-8');
      let newHash = data.digest('hex');
      
      if (newHash == results[0].hash) {
        let id = addOrUpdateSession(u);
        res.cookie("login", {username: u, sid: id}, {maxAge: SESSION_LENGTH});
        res.end('SUCCESS');
    p1.catch( (error) => {
      res.end('FAIL');
    });
      } else {
        res.end('FAIL');
      }
    } else {
      res.end('login failed');
    }
  });
  p1.catch( (error) => {
    res.end('login failed');
  });
});

//route for click of stats button
app.get('/stats/:username', (req, res) => {
  let u = req.params.username;
  let p1 = Stats.find({username: u}).exec();
  p1.then( (results) => { 
    console.log(results);
    res.end( JSON.stringify(results) );
    });
    p1.catch( (error) => {
      res.end('FAIL');
    });
  });

//Route for getting the leaderboard
app.get('/leaderboard', (req, res) => {
  let p2 = Stats.find().sort({winPercentage:-1}).limit(5).exec();
  p2.then( (docs) => {
    res.end(JSON.stringify(docs));
  });
  p2.catch( (error) => {
    console.log("ERROR with leaderboard")
    res.end('FAIL');
  });
})

//Search all the usernames for the keyword
app.get('/search/stats/:keyword', (req, res) => {
  let k = req.params.keyword;
  Stats.find({username: {"$regex": k}}).exec()
  .then( (results) => {
      res.end(JSON.stringify(results));
  })
})

/*
app.get('/search/users/:keyword', (req, res) => {
  let k = req.params.keyword;
  User.find({username: {"$regex": k}}).exec()
  .then( (results) => {
      res.end(JSON.stringify(results));
  })
})

app.get('/following/:user', (req, res) =>{
  console.log("AAAAAAAAAAAAAAAAAAAAAAAAA")
  let u = req.params.user;
  User.find({username: u}).exec()
  .then((results) =>{
    //console.log(results)
    if (results.length == 1){
      var data = [];
        //Find all items in listings then add all the items to an array
        Stats.find({_id: results[0].following}).exec()
          .then((items)=>{
            console.log(items)
            for (e in items){
              data.push(items[e]);
            }
          })
          .then(() => {
            console.log("Done - kinda")
            console.log(data)
            res.end( JSON.stringify(data));
          })
        }
  })
  .catch( (error) => {
    console.log("Error with followers");
    res.end("FAIL");
  })
})


app.get('/follow/:idNum/:user', (req, res) => {
  console.log("Following")
  u = req.params.user;
  i = req.params.idNum;
  console.log("A");
  console.log(i);
  User.findOneAndUpdate({username: u}, {$push:{following:i}})
    .then( (newUser) => {
      newUser.save();
    })
    .catch(() => {
      console.log("Error adding item");
    });
    res.end("SUCCESS");
})*/

//route for review submission
app.get('/review/:username/:rating/:positives/:improve', (req, res) => {
  let u = req.params.username;
  let r = req.params.rating;
  r = parseInt(r);
  let p = req.params.positives;
  let i = req.params.improve;
  var newReview = new Review({ 
    username: u,
    rating: r,
    positives: p,
    improve: i
  });
  newReview.save().then( (doc) => { 
      res.end('SUCCESS');
    }).catch( (err) => { 
      res.end('FAIL');
    });
})

app.get('/stats/update/:username/:won', (req, res) => {
  let u = req.params.username;
  let w = req.params.won;
  Stats.findOneAndUpdate( { username: u },{ $inc: { gamesPlayed: 1 }} ).exec()
  .then( (update) => {
    update.save();
  })
  if (w == "true") {
    Stats.findOneAndUpdate( { username: u },{ $inc: { wins: 1 }} ).exec()
    .then( (update) => {
      update.save().then(()=>{
        Stats.findOne( {username: u}).then((doc) => {
          let wins = doc.wins;
          let games = doc.gamesPlayed;
          let per = (wins / games);
          per = Number((per*100).toFixed(2));
          Stats.findOneAndUpdate( { username: u },{ $set: { winPercentage:  per}} ).exec()
          .then( (update) => {
            update.save();
          })
        }).then(() =>{
          res.end("Done");
        })
      })
    })
  }
  else {
    Stats.findOneAndUpdate( { username: u },{ $inc: { losses: 1 }} ).exec()
    .then( (update) => {
      update.save().then(()=>{
        Stats.findOne( {username: u}).then((doc) => {
          let wins = doc.wins;
          let games = doc.gamesPlayed;
          let per = (wins / games);
          per = Number((per*100).toFixed(2));
          Stats.findOneAndUpdate( { username: u },{ $set: { winPercentage:  per}} ).exec()
          .then( (update) => {
            update.save();
          })
        }).then(() =>{
          res.end("Done");
        })
      })
    })
  }
})

//server code
const port = 3000;
app.listen(port, () => {
    console.log('server has started');
});