const Sale = require('../models/Sale');

exports.createSale = async (req, res) => {
  try {
    const sale = await Sale.createAtomicSale(req.body, req.user);
    res.status(201).json({ success: true, ...sale, sale });
  } catch (err) {
    console.error('Error processing sale:', err.message);
    res.status(400).json({ error: 'Failed to process sale', message: err.message });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const { search = '', startDate = '', endDate = '', page = 1, limit = 50 } = req.query;
    const sales = await Sale.findAll({ search, startDate, endDate, page, limit });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales', message: err.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sale details', message: err.message });
  }
};
