const express = require('express');
const app = express();

const { expressjwt: exjwt } = require('express-jwt');
const jwt = require('jsonwebtoken'); 
const bodyParser = require('body-parser');
const path = require('path');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const PORT = 3000;

const secretKey = 'My super secret key';
const jwtMW = exjwt({
  secret: secretKey,
  algorithms: ['HS256'], 
});

let users = [
  {
    id: 1,
    username: 'skye',
    password: '123',
  },
  {
    id: 2,
    username: 'horrell',
    password: '456',
  }
];

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  for (let user of users) {
    if (user.username === username && user.password === password) {
      let token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '3m' });
      return res.json({
        success: true,
        err: null,
        token
      });
    }
  }
  
  res.status(401).json({
    success: false,
    token: null,
    err: 'Username or password is incorrect'
  });
});

app.get('/api/dashboard', jwtMW, (req, res) => {
  res.json({
    success: true,
    myContent: 'Secret content that only logged-in people can see!'
  });
});

app.get('/api/settings', jwtMW, (req, res) => {
  res.json({
    success: true,
    myContent: 'This is the settings'
  });
});

app.get('/api/prices', jwtMW, (req, res) => {
  res.json({
    success: true,
    myContent: 'This is the price $3.99'
  });
});

app.use(function(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({
      success: false,
      officialError: err,
      err: 'Username or password is incorrect 2'
    });
  } else {
    next(err);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});