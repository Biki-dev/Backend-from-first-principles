import expeess from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import notesroutes from './routes/notes.routes.js';

dotenv.config();

const app = expeess();

// Middleware
app.use(expeess.json());

// Routes
app.use('/api/notes', notesroutes);

// Connect to MongoDB and start the server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });

export default app;