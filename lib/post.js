const redis = require('redis');
const redisClient = redis.createClient();

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