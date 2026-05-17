import ExpenseModel from "../models/Expense.model.js";

const getWeeklyExpenses = async (req, res) => {
  try {
    const now = new Date();
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    console.log('Start of week:', startOfWeek);
    const expenses = await ExpenseModel.find({
      user: req.user._id,
      createdAt: { $gte: startOfWeek }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const getMonthlyExpenses = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    console.log('Start of month:', startOfMonth);
    const expenses = await ExpenseModel.find({
      user: req.user._id,
      createdAt: { $gte: startOfMonth }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const getYearlyExpenses = async (req, res) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const expenses = await ExpenseModel.find({
      user: req.user._id,
      createdAt: { $gte: startOfYear }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const createExpense = async (req, res) => {
  try {
    const { title, amount, category, notes } = req.body;
    const expense = await ExpenseModel.create({
      user: req.user._id,
      title,
      amount,
      category,
      notes
    });
    res.status(201).json({ message: 'Expense created successfully', expense });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const getExpenses = async (req, res) => {
  try {
    const filter = req.query.filter;
    if (filter === 'week') {
      return getWeeklyExpenses(req, res);
    } else if (filter === 'month') {
      return getMonthlyExpenses(req, res);
    } else if (filter === 'year') {
      return getYearlyExpenses(req, res);
    }
    const expenses = await ExpenseModel.find({ user: req.user._id });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const expense = await ExpenseModel.findOne({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { title, amount, category, notes } = req.body;
    const expense = await ExpenseModel.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { title, amount, category, notes },
      { new: true }
    );
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense updated successfully', expense });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expense = await ExpenseModel.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error });
  }
};



const expenseController = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};

export default expenseController;