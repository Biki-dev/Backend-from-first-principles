const app = require('./app');

const PORT = process.env.PORT;

app.get('/', (req, res) => {
  res.send('Welcome to the Weather API Wrapper!');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});