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
    console.log('butt' + newMessages)
    
    redisClient.lrange('rooms', 0, -1, (err, rooms) => {
    
      roomList = rooms ? rooms : [];
      console.log(roomList)
  
      roomList.forEach((room, i) => {
        
        let messageList;
        let timeFilteredMessages;
        room = room.toUpperCase()
        
        redisClient.lrange(`${room}`, 0, -1, (err, messages) => {
          

          messageList = messages ? messages : [];
          console.log(messageList)
          //let leaveTime = `${user}last${room}LeaveTime`
          
          if(req.cookies[`${user}Last${room}LeaveTime`]){
            timeFilteredMessages = messageList.filter(message => {
             return JSON.parse(message).time > req.cookies[`${user}Last${room}LeaveTime`]
            }) 
          } else {
            timeFilteredMessages = messageList
          }
          console.log(req.cookies[`${user}Last${room}LeaveTime`])
          newMessages.push(timeFilteredMessages.length);
          
          if (i === roomList.length - 1) {
            res.render('index', {roomList, user, room, newMessages});
          } 
        })  
      })
    })
  } else {
    let user = '';
    let room = '';
    res.render('login', {user, room});
  }
  //determine number of users in each room
  // let numberOfUsers = [];
  //   posts.forEach(post => {
  //     if(!numberOfUsers.includes(Object.keys(JSON.parse(post))[0])) {
  //       numberOfUsers.push(Object.keys(JSON.parse(post))[0])
  //     }
  //   })
})

router.get('/chatrooms/:room', (req, res) => {
  let user = req.cookies.user;
  let room = req.params.room.toUpperCase();
  let lastJoin = `${user}Last${room}JoinTime`
  let time = Date.now()
  res.cookie(lastJoin, time)
  let rooms;
  console.log(req.cookies)

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
          if(req.cookies[`${user}Last${room}LeaveTime`]){
            console.log('hello')
            timeFilteredMessages = messageList.filter(message => {
              console.log(JSON.parse(message).time)
              console.log(req.cookies[`${user}Last${room}LeaveTime`])
              return JSON.parse(message).time > req.cookies[`${user}Last${room}LeaveTime`]
            }) 
          } else {
            timeFilteredMessages = []
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
  console.log(room);
  redisClient.rpush('rooms', room);
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
  console.log(req.cookies[lastLeave])
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