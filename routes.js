const express = require('express');
const router = express.Router();
const redis = require('redis');
const redisClient = redis.createClient();
const bodyParser = require('body-parser');
const message = require('./lib/post');
//const cookieParser = require('cookie-parser');

router.get('/', (req, res) => {
  if(req.cookies && req.cookies.user != undefined) {
    let user = req.cookies.user;
    let room = ''
    redisClient.lrange('rooms', 0, -1, (err, rooms) => {
      res.render('index', {rooms, user, room});
    })
  } else {
    let user = ''
    res.render('login', {user});
  }
})

router.get('/chatrooms/:room', (req, res) => {
  let user = req.cookies.user;
  let room = req.params.room.toUpperCase();
  console.log(room);
  let rooms;
  redisClient.lrange('rooms', 0, -1, (err, roomList) => {
    rooms = roomList;
  })
  redisClient.hgetall(`${room}`, (err, posts) => {
    res.render('room', {posts, user, room, rooms});
  })
  // redisClient.lrange('posts', 0, -1, (err, posts) => {
  //   res.render('room', {posts, user, room});
  // })
})

router.post('/new-room', (req, res) => {
  let room = req.body.newRoom;
  console.log(room);
  redisClient.rpush('rooms', room);
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
  // let content = req.body.newPostContent;
  // message.newPost(content);
  // redisClient.lindex('posts', 0, (err, value) => {
  //   console.log(value);
  //   res.redirect('back');
  // })
  res.render('index')
})

module.exports = router;