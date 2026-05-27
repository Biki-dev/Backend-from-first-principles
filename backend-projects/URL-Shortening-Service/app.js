import express from 'express';
import mongoose from 'mongoose';
import Urlroutes from './routes/url.route.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/urls', Urlroutes);

// Connect to MongoDB and start the server
const PORT = process.env.PORT;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

export default app;