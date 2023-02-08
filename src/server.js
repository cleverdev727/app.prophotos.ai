const express = require("express");
const app = express();
const initRoutes = require("./routes/web");
const mongoose = require('mongoose');

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

let port = 3000;
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});