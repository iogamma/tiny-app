/* express_server.js */

//====== Constant Variables

// Resolve libraries and modules in the Node search path
const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const toolbox = require('./lib/toolbox')

const TinyApp= express();
const generateRandStr = toolbox.generateRandStr;
const urlDatabase = {
  zxcvbn: {
    longURL: 'http://www.google.ca',
    uid: 'abcdef'
  },
  uidfke: {
    longURL: 'http://www.askjeeves.com',
    uid: 'qwerty'
  },
  hfkell: {
    longURL: 'http://www.monster.ca',
    uid: 'abcdef'
  }
};
const users = {
  abcdef: {
    id: generateRandStr(),
    email: 'hal.wh.tang@gmail.com',
    password: 'happy'
  },
  qwerty: {
    id: generateRandStr(),
    email: 'sandy.h@gmail.com',
    password: 'joyful'
  }
};
const PORT = 8080;

//====== Setup

// Set up middleware
TinyApp.set('view engine', 'ejs');
TinyApp.use(bodyParser.urlencoded({extended: true}));
TinyApp.use(cookieParser());

//====== Helper Functions
function urlsForUser(id) {
  let listOfURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[`${shortURL}`].uid === id) {
      listOfURLs[`${shortURL}`] = urlDatabase[`${shortURL}`].longURL;
    }
  }
  return listOfURLs;
}

//====== Get Method Routes

TinyApp.get('/', (req, res) => {
  const templateVars = {
    user : users[`${req.cookies.uid}`]
  };
    res.render('index', templateVars);
});

TinyApp.get('/urls', (req, res) => {
  const templateVars = {
    listOfURLs: urlsForUser(req.cookies.uid),
    user : users[`${req.cookies.uid}`]
  };
  if (users[`${req.cookies.uid}`]) {
    res.render('urls_index', templateVars);
  } else {
    res.redirect('/login');
  }
});

TinyApp.get('/urls/new', (req, res) => {
  const templateVars = {
    user : users[`${req.cookies.uid}`]
  };
  if (req.cookies.uid) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

TinyApp.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    user : users[`${req.cookies.uid}`]
  };
  res.render('urls_show', templateVars);
});

TinyApp.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[`${req.params.shortURL}`].longURL;
  if (longURL) {
    res.redirect(`${longURL}`);
  } else {
    console.log("The short URL does not exist in the database.");
  }
});

TinyApp.get('/login', (req, res) => {
  const templateVars = {
    user : users[`${req.cookies.uid}`]
  };
  res.render('login', templateVars);
});

TinyApp.get('/register', (req, res) => {
  const templateVars = {
    user : users[`${req.cookies.uid}`]
  };
  res.render('register.ejs', templateVars);
});

//====== Post Method Routes

TinyApp.post('/urls/:id/delete', (req, res) => {
  if (urlDatabase[req.params.id]) {
    delete urlDatabase[req.params.id];
  }
  res.redirect('/urls');
});

TinyApp.post('/urls/new', (req, res) => {
    urlDatabase[req.params.id] = {};
    urlDatabase[req.params.id].longURL = `http://${req.body.newlongURL}`;
    urlDatabase[req.params.id].uid = `req.cookies.uid`;
  res.redirect('/urls');
});

TinyApp.post('/urls/:id', (req, res) => {
    urlDatabase[req.params.id].longURL = `http://${req.body.newlongURL}`;
    res.redirect('/urls');
});

TinyApp.post('/login', (req, res) => {
  for (let user in users) {
    if (users[`${user}`].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, users[`${user}`].password)) {
        res.cookie('uid', user);
        res.redirect('/urls');
        break;
      } else {
        break;
      }
    }
  }
  res.redirect(401, '/');
});

TinyApp.post('/logout', (req, res) => {
  res.clearCookie('uid');
  res.redirect('/');
});

TinyApp.post('/register', (req, res) => {
  let newUserID;

  if (!req.body.email || !req.body.password) {
    res.redirect(400, '/');
    return ;
  } else {
    // make sure the generated ID isn't in use
    do {
      newUserID = generateRandStr();
    } while(users.newUserID)

    // initiate new object for a new user
    users[`${newUserID}`] = {};
    users[`${newUserID}`].id = newUserID;
    users[`${newUserID}`].email = req.body.email;
    const hashed_password = bcrypt.hashSync(req.body.password, 10);
    users[`${newUserID}`].password = hashed_password;

    res.cookie('uid', newUserID);
    res.redirect('/urls')
  }
});

//====== Listener

TinyApp.listen(PORT);
console.log(`TinyApp server running using port: ${PORT}`);
