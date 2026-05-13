const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weather.controller');

router.get('/:city', weatherController.getWeather);

module.exports = router;