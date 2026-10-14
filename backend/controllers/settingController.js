const Setting = require('../models/Setting');

exports.getSettings = async (req, res) => {
  try {
    const settings = await Setting.get();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch settings', message: err.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const updated = await Setting.update(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings', message: err.message });
  }
};
