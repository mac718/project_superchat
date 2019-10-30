const express = require('express');
const router = express.Router();
const redis = require("redis")
const url = require('url')
var redisClient;
if( process.env.REDISCLOUD_URL ) {
  var redisURL = url.parse(process.env.REDISCLOUD_URL);
  redisClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
  redisClient.auth(redisURL.auth.split(":")[1]);
} else {
  redisClient = redis.createClient();
}
const bodyParser = require('body-parser');
const message = require('./lib/post');

router.get('/', (req, res) => {
  if(req.cookies && req.cookies.user != undefined) {
    let user = req.cookies.user;
    let room = ''
    redisClient.lrange('rooms', 0, -1, (err, rooms) => {
      res.render('index', {rooms, user, room});
    })
  } else {
    let user = '';
    let room = '';
    res.render('login', {user, room});
  }
})

router.get('/chatrooms/:room', (req, res) => {
  let user = req.cookies.user;
  let room = req.params.room.toUpperCase();
  let rooms;
  redisClient.lrange('rooms', 0, -1, (err, roomList) => {
    rooms = roomList;
  })
  redisClient.lrange(`${room}`, 0, -1, (err, posts) => {
    res.render('room', {posts, user, room, rooms});
  })
})

router.post('/new-room', (req, res) => {
  let room = req.body.newRoom;
  console.log(room);
  redisClient.rpush('rooms', room);
  res.redirect('/');
})

router.get('/close-room', (req, res) => {
  res.redirect('/');
})

router.get('/login', (req, res) => {
  res.render('login');
})

router.get('/logout', (req, res) => {
  res.clearCookie('user');
  res.redirect('/');
})

router.post('/', (req, res) => {
  let username = req.body.username;
  res.cookie('user', username);
  let user = username;
  redisClient.rpush('users', user, (err) =>{
    res.redirect('/');
  });
})

router.post('/posts/new', (req, res) => {
  res.render('index')
})

module.exports = router;