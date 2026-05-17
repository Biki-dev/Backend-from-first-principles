import express from 'express';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import expenseRoutes from './routes/expense.routes.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
  });

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the Expense Tracker API!');
});

app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);
export default app;