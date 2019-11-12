//require('dotenv').config()
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
//var redisClient = redis.createClient(process.env.REDISCLOUD_URL, {no_ready_check: true});
// var redis = require("redis")
// var url = require('url')
// var redisURL = url.parse(process.env['REDISCLOUD_URL']);
// var redisClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
// console.log(redisURL)
//redisClient.auth(redisURL.auth.split(":")[1]);
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

  client.on('new-post', (content, author, room, time) => {
    message.newPost(content, author, room, time)
    io.emit('append-post', content, author);
  })
})


server.listen(port);
