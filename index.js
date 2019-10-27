const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
//const redis = require('redis');
// if (process.env.REDISTOGO_URL){
//   alert('yes!')
// }
// var rtg
// var redisClient
// if (process.env.REDISTOGO_URL) {
//   var rtg   = require("url").parse(process.env.REDISTOGO_URL);
//   var redisClient = require("redis").createClient(rtg.port, rtg.hostname);

//   redis.auth(rtg.auth.split(":")[1]);
// } else {
//   var redisClient = require("redis").createClient();
// }
//const redisClient = redis.createClient(ENV['REDIS_URL']);
//var redis = require("redis")

//var redisClient = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const message = require('./lib/post');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
let port = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use('/socket.io', express.static(__dirname + 'node_modules/socket.io-client/dist'));

app.use(expressLayouts);

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());

app.use('/', routes);

app.use(express.static(`${__dirname}/public`));  

io.on('connection', client => {

  client.on('new-post', (content, author, room) => {
    message.newPost(content, author, room)
    io.emit('append-post', content, author);
  })
})


server.listen(port);
