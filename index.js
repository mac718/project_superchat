const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const redis = require('redis');
const redisClient = redis.createClient();
const bodyParser = require('body-parser');
const expressLayouts = require('express-ejs-layouts');

app.set('view engine', 'ejs');

app.use(expressLayouts);

app.use('/socket.io', express.static(__dirname + 'node_modules/socket.io-client/dist'));

app.use(express.static(`${__dirname}/public`));  

app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.render('index');
})

server.listen(3000);
