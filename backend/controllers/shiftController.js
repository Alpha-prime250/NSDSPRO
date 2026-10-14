const Shift = require('../models/Shift');

exports.getCurrentShift = async (req, res) => {
  try {
    const active = await Shift.findActiveShift();
    res.json(active);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active shift', message: err.message });
  }
};

exports.openShift = async (req, res) => {
  try {
    const shift = await Shift.open(req.body);
    res.status(201).json(shift);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.closeShift = async (req, res) => {
  try {
    const { id, closing_cash } = req.body;
    if (!id || closing_cash === undefined) {
      return res.status(400).json({ error: 'Shift ID and closing cash are required' });
    }
    const closed = await Shift.close({ id, closing_cash });
    res.json(closed);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllShifts = async (req, res) => {
  try {
    const shifts = await Shift.findAll(req.query.limit || 30);
    res.json(shifts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch shift history', message: err.message });
  }
};
