/**
 * Single Vendor Retail & Grocery POS Backend Server
 * Express + MySQL2
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const pool = require('./db');

// ==========================================
// EXISTING ROUTES
// ==========================================

const settingsRoutes = require('./routes/settings');
const productsRoutes = require('./routes/products');
const salesRoutes = require('./routes/sales');
const customersRoutes = require('./routes/customers');
const suppliersRoutes = require('./routes/suppliers');
const expensesRoutes = require('./routes/expenses');
const reportsRoutes = require('./routes/reports');
const authRoutes = require('./routes/auth');
const ordersRoutes = require('./routes/orders');
const shiftsRoutes = require('./routes/shifts');
const purchasesRoutes = require('./routes/purchases');
const returnsRoutes = require('./routes/returns');
const auditRoutes = require('./routes/audit');

// ==========================================
// STAFF MANAGEMENT ROUTES
// Staff + Attendance + Payroll
// ==========================================

const staffRoutes = require('./routes/staff');

const app = express();

// Use .env PORT, otherwise 5050
const PORT = parseInt(process.env.PORT || '5050');

// ==========================================
// CORS
// ==========================================

app.use(cors({
  origin: true,
  credentials: true,
  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'OPTIONS'
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
}));

// ==========================================
// BODY PARSER
// ==========================================

app.use(express.json({ limit: '10mb' }));

app.use(express.urlencoded({
  extended: true
}));

// ==========================================
// HEALTH CHECK
// ==========================================

app.get(['/api/health', '/health'], async (req, res) => {

  try {

    await pool.query('SELECT 1');

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      service: 'Single Vendor POS API',
      version: '2.0.0',
      time: new Date().toISOString()
    });

  } catch (error) {

    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      message: error.message
    });

  }

});

// ==========================================
// REGISTER API ROUTES
// ==========================================

const registerApiRoute = (prefix, handler) => {

  app.use(`/api/${prefix}`, handler);

  // Optional direct route
  app.use(`/${prefix}`, handler);

};

// ==========================================
// EXISTING APIs
// ==========================================

registerApiRoute('settings', settingsRoutes);
registerApiRoute('products', productsRoutes);
registerApiRoute('sales', salesRoutes);
registerApiRoute('customers', customersRoutes);
registerApiRoute('suppliers', suppliersRoutes);
registerApiRoute('expenses', expensesRoutes);
registerApiRoute('reports', reportsRoutes);
registerApiRoute('auth', authRoutes);
registerApiRoute('orders', ordersRoutes);
registerApiRoute('shifts', shiftsRoutes);
registerApiRoute('purchases', purchasesRoutes);
registerApiRoute('returns', returnsRoutes);
registerApiRoute('audit', auditRoutes);

// ==========================================
// STAFF MANAGEMENT APIs
// ==========================================

// All Staff Management features are handled
// inside routes/staff.js

registerApiRoute('staff', staffRoutes);

// ==========================================
// STATIC FRONTEND
// ==========================================

const frontendDistPath = path.join(
  __dirname,
  '../frontend/dist'
);

app.use(express.static(frontendDistPath));

// ==========================================
// API 404 HANDLER
// ==========================================

app.use('/api', (req, res) => {

  res.status(404).json({
    error: 'API Endpoint Not Found',
    path: req.originalUrl
  });

});

// ==========================================
// REACT FRONTEND HANDLER
// ==========================================

app.get('*', (req, res) => {

  const indexPath = path.join(
    frontendDistPath,
    'index.html'
  );

  res.sendFile(indexPath, (error) => {

    if (error) {

      res.status(404).json({
        error: 'Frontend Not Found',
        message: 'Build the frontend using npm run build'
      });

    }

  });

});

// ==========================================
// ERROR HANDLER
// ==========================================

app.use((err, req, res, next) => {

  console.error('[Server Error]', err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message
  });

});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, '0.0.0.0', () => {

  console.log('');
  console.log('==========================================');
  console.log('🚀 Single Vendor POS Server Started');
  console.log('==========================================');

  console.log(`🌐 Server: http://localhost:${PORT}`);
  console.log(`❤️ Health: http://localhost:${PORT}/api/health`);

  console.log('');
  console.log('📦 Products:');
  console.log(`http://localhost:${PORT}/api/products`);

  console.log('');
  console.log('👥 Staff:');
  console.log(`http://localhost:${PORT}/api/staff`);

  console.log('');
  console.log('📅 Attendance:');
  console.log(`http://localhost:${PORT}/api/staff/attendance/all`);

  console.log('');
  console.log('💰 Payroll:');
  console.log(`http://localhost:${PORT}/api/staff/payroll/all`);

  console.log('==========================================');
  console.log('');

});
