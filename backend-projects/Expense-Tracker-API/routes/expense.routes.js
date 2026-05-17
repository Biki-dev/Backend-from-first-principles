import express from 'express';
const router = express.Router();
import authMiddleware from '../middleware/auth.js';
import expenseController from '../controllers/expense.controller.js';

router.use(authMiddleware);

router.post('/', expenseController.createExpense);
router.get('/', expenseController.getExpenses);
router.get('/:id', expenseController.getExpenseById);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);

export default router;