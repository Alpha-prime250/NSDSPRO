const Purchase = require('../models/Purchase');

exports.createPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.createPurchase(req.body, req.user);
    res.status(201).json(purchase);
  } catch (err) {
    console.error('Failed to record purchase:', err.message);
    res.status(400).json({ error: 'Failed to record purchase', message: err.message });
  }
};

exports.getAllPurchases = async (req, res) => {
  try {
    const { search = '', limit = 50 } = req.query;
    const purchases = await Purchase.findAll({ search, limit });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchases', message: err.message });
  }
};

exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);
    if (!purchase) {
      return res.status(404).json({ error: 'Purchase record not found' });
    }
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch purchase details', message: err.message });
  }
};
