const redisClient = require('../config/redis');
const { getWeather } = require('../services/weather.services');

module.exports.getWeather = async (req, res) => {
  const city = req.params.city;
  console.log(`Received request for weather in city: ${city}`);

  const cachekey = `weather:${city.toLowerCase()}`;

  try {
    // Check Redis cache first
    const cachedData = await redisClient.get(cachekey);
    if (cachedData) {
      console.log('Cache hit for city:', city);
      return res.json(JSON.parse(cachedData));
    }

    console.log('Cache miss for city:', city);
    // Fetch weather data from external API
    const weatherData = await getWeather(city);
    const location = weatherData.location.name;
    const temperature = weatherData.current.temp_c;
    const condition = weatherData.current.condition.text;

    const responseData = {
      location,
      temperature,
      condition
    };

    // Store in Redis cache with an expiration time of 1 hour
    await redisClient.set(
      cachekey,
      JSON.stringify(responseData),
      {
        EX: process.env.CACHE_TTL_SECONDS
      }
    );
    return res.json(responseData);

  } catch (error) {
    console.error('Error fetching weather data:', error);
    return res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}