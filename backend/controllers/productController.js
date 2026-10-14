const Product = require('../models/Product');

exports.getAllProducts = async (req, res) => {
  try {
    const { search = '', category = '', limit = 100 } = req.query;
    const products = await Product.findAll({ search, category, limit });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products', message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch product', message: err.message });
  }
};

exports.getProductByBarcode = async (req, res) => {
  try {
    const product = await Product.findByBarcode(req.params.barcode);
    if (!product) {
      return res.status(404).json({ error: 'Product not found with this barcode' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Failed to lookup barcode', message: err.message });
  }
};

exports.getLowStock = async (req, res) => {
  try {
    const products = await Product.findLowStock();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch low stock alerts', message: err.message });
  }
};

exports.getExpiringProducts = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const products = await Product.findExpiring({ days });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch expiring products', message: err.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Product.getCategories();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories', message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, selling_price } = req.body;
    if (!name || selling_price === undefined) {
      return res.status(400).json({ error: 'Product name and selling price are required' });
    }

    const created = await Product.create(req.body);
    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create product', message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Product not found to update' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update product', message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const success = await Product.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product archived successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete product', message: err.message });
  }
};
