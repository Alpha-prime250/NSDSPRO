const Return = require('../models/Return');

exports.createReturn = async (req, res) => {
  try {
    const returnRecord = await Return.createReturn(req.body, req.user);
    res.status(201).json(returnRecord);
  } catch (err) {
    console.error('Failed to process return:', err.message);
    res.status(400).json({ error: 'Failed to process return', message: err.message });
  }
};

exports.getAllReturns = async (req, res) => {
  try {
    const { search = '', limit = 50 } = req.query;
    const returns = await Return.findAll({ search, limit });
    res.json(returns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch returns', message: err.message });
  }
};

exports.getReturnById = async (req, res) => {
  try {
    const ret = await Return.findById(req.params.id);
    if (!ret) {
      return res.status(404).json({ error: 'Return slip not found' });
    }
    res.json(ret);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch return details', message: err.message });
  }
};
