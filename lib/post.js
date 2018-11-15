const redis = require('redis');
const redisClient = redis.createClient();

var post = {
  newPost: (post) => {
    redisClient.rpush('posts', post);
    let messageId;
    redisClient.llen('posts', (err, value) => {
      messageId = value;
      //console.log(messageId);
    });

    redisClient.lindex('posts', -1, (err, value) => {
      redisClient.hmset(`message:${messageId}`, 'content', value, 'author', '', 'room', '');
    });
    
    
    redisClient.hgetall(`message:1`, (err, value) =>{
      console.log(value);
    })
  }
}

module.exports = post;