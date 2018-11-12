const redis = require('redis');
const redisClient = redis.createClient();

var post = {
  newPost: (post) => {
    redisClient.lpush('posts', post);
  }
}

module.exports = post;