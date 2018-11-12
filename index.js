const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const redis = require('redis');
const redisClient = redis.createClient();
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');
const message = require('./lib/post');

app.set('view engine', 'ejs');

app.use('/socket.io', express.static(__dirname + 'node_modules/socket.io-client/dist'));

app.use(expressLayouts);

app.use(express.static(`${__dirname}/public`));  

app.use(bodyParser.urlencoded({ extended: true }));

io.on('connection', client => {
  console.log('hello'); 
})

app.get('/', (req, res) => {
  res.render('index');
})

app.post('/posts/new', (req, res) => {
  let content = req.body.newPostContent;
  message.newPost(content);
  redisClient.lindex('posts', 0, (err, value) => {
    console.log(value);
    res.redirect('back');
  })
})

server.listen(3000);
