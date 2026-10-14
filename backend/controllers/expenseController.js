const Expense = require('../models/Expense');

exports.getAllExpenses = async (req, res) => {
  try {
    const { category, startDate, endDate } = req.query;
    const expenses = await Expense.findAll({ category, startDate, endDate });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expenses', message: err.message });
  }
};

exports.createExpense = async (req, res) => {
  try {
    const { title, amount } = req.body;
    if (!title || amount === undefined) {
      return res.status(400).json({ error: 'Title and amount are required' });
    }
    const expense = await Expense.create(req.body);
    res.status(201).json(expense);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create expense', message: err.message });
  }
};

exports.deleteExpense = async (req, res) => {
  try {
    const success = await Expense.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete expense', message: err.message });
  }
};
