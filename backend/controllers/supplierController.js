const Supplier = require('../models/Supplier');

exports.getAllSuppliers = async (req, res) => {
  try {
    const { search = '' } = req.query;
    const suppliers = await Supplier.findAll({ search });
    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suppliers', message: err.message });
  }
};

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch supplier', message: err.message });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }
    const supplier = await Supplier.create(req.body);
    res.status(201).json(supplier);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create supplier', message: err.message });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.update(req.params.id, req.body);
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update supplier', message: err.message });
  }
};

exports.deleteSupplier = async (req, res) => {
  try {
    const success = await Supplier.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete supplier', message: err.message });
  }
};
