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
    let roomList;
    let newMessages = []
    
    redisClient.lrange('rooms', 0, -1, (err, rooms) => {
    
      roomList = rooms ? rooms : [];

      if(roomList.length > 0) {
        roomList.forEach((room, i) => {
          
          let messageList;
          let timeFilteredMessages;
          room = room.toUpperCase()
          
          redisClient.lrange(`${room}`, 0, -1, (err, messages) => {
            

            messageList = messages ? messages : [];
            
            if(req.cookies[`${user}Last${room}LeaveTime`]){
              timeFilteredMessages = messageList.filter(message => {
               return JSON.parse(message).time > req.cookies[`${user}Last${room}LeaveTime`]
              }) 
            } else {
              timeFilteredMessages = messageList
            }
            newMessages.push(timeFilteredMessages.length);
            
            if (i === roomList.length - 1 || i === 0) {
              res.render('index', {roomList, user, room, newMessages});
            } 
          })  
        })
      } else  {
         res.render('index', {roomList, user, room, newMessages});
      }
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
  let lastJoin = `${user}Last${room}JoinTime`
  let time = Date.now()
  res.cookie(lastJoin, time)
  let rooms;

  let roomList;
  let newMessages = []
    
    redisClient.lrange('rooms', 0, -1, (err, rooms) => {
      
      roomList = rooms;
  
      roomList.forEach(room => {
        
        let messageList;
        room = room.toUpperCase()
        
        redisClient.lrange(`${room}`, 0, -1, (err, messages) => {
          
          messageList = messages ? messages : [];
          let leaveTime = `${user}last${room}LeaveTime`
          let timeFilteredMessages
          if(req.cookies[`${user}Last${room}LeaveTime`] && room != req.params.room.toUpperCase()){
            console.log('hello')
            timeFilteredMessages = messageList.filter(message => {
              return JSON.parse(message).time > req.cookies[`${user}Last${room}LeaveTime`]
            }) 
          } else {
            timeFilteredMessages = [];
          }
          newMessages.push(timeFilteredMessages.length);
        })
      })
      redisClient.lrange(`${room}`, 0, -1, (err, posts) => {
        res.render('room', {posts, user, room, roomList, newMessages});
      })
    })
})

router.post('/new-room', (req, res) => {
  let room = req.body.newRoom;
  if (room != '') {
    redisClient.rpush('rooms', room);
  }
  res.redirect('/');
})

router.get('/close-room/:room', (req, res) => {
  let user = req.cookies.user;
  let room = req.params.room.toUpperCase();
  let lastLeave = `${user}Last${room}LeaveTime`
  let time = Date.now()
  res.cookie(lastLeave, time)

  res.redirect('/');
})

router.get('/login', (req, res) => {
  res.render('login');
})

router.get('/logout/:room', (req, res) => {
  let user = req.cookies.user;
  let room = req.params.room.toUpperCase();
  let lastLeave = `${user}Last${room}LeaveTime`
  let time = Date.now()
  res.cookie(lastLeave, time)
  res.clearCookie('user');
  res.redirect('/');
})

router.get('/logout/', (req, res) => {
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