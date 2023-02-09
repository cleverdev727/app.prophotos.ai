const express = require("express");
const app = express();
const initRoutes = require("./routes/web");
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');


app.use(express.urlencoded({ extended: true }));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(express.static(__dirname + '/views'));
initRoutes(app);
mongoose.set('strictQuery', false);
mongoose.connect(`mongodb://localhost:27017/photos_db`);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'db connection error: '));
db.once('open', function() {
  console.log('db connected successfully');
});

const server = http.createServer(app);
const io = new Server(server);

app.set('io', io);

io.sockets.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
  socket.on('test', (content) => {
    console.log(content);
  });
});

let port = 3000;
server.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});