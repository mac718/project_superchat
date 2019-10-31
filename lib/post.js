// const redis = require('redis');
// const redisClient = redis.createClient();
// var rtg
// var redisClient
// if (process.env.REDISTOGO_URL) {
//   console.log('hello')
//   var rtg   = require("url").parse(process.env.REDISTOGO_URL);
//   var redisClient = require("redis").createClient(rtg.port, rtg.hostname);

//   redis.auth(rtg.auth.split(":")[1]);
// } else {
//   var redisClient = require("redis").createClient();
// }

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



//var redisClient = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});

var post = {
  newPost: (post, author, room) => {
    redisClient.rpush('posts', post);
    let messageId;
    redisClient.llen('posts', (err, value) => {
      messageId = value;
    });

    redisClient.lindex('posts', -1, (err, value) => {
      redisClient.hmset(`message:${messageId}`, 'content', value, 'author', author, 'room', room);
      redisClient.rpush(`${room}`, '{' + `"${author}"` + ':' + `"${value}"` + '}');
    }); 
  }
}

module.exports = post;