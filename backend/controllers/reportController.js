const Report = require('../models/Report');

exports.getDashboard = async (req, res) => {
  try {
    const data = await Report.getDashboardKPIs();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch dashboard metrics', message: err.message });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const data = await Report.getAnalytics();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics', message: err.message });
  }
};
