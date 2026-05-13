const express = require('express');
require('dotenv').config();

const app = express();

app.use(express.json());


const weatherRoutes = require('./routes/weather.routes');
app.use('/weather', weatherRoutes);


module.exports = app;