const redisClient = require('../config/redis');

async function testRedis() {
  try {
    await redisClient.set('testKey', 'Hello, Redis!');
    const value = await redisClient.get('testKey');
    console.log('Value from Redis:', value);
  } catch (err) {
    console.error('Error testing Redis:', err);
  } finally {
    await redisClient.quit();
  }
}

testRedis();