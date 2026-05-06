const express = require('express');
const app = express();
const articlesRouter = require('./routes/articles.routes');
const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://bikikalita426_db_user:mixZXwbGYloHdl4z@blog.0dltrxd.mongodb.net/?appName=blog')
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));


app.use(express.json());
app.use('/api', articlesRouter);

app.get('/', (req, res) => {
  res.send('Welcome to the Blog API!');
});

module.exports = app;