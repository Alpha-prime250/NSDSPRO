const express = require('express');

const router = express.Router();

const customerController = require('../controllers/customerController');

const {
  authenticateToken
} = require('../middleware/auth');


// ======================================================
// PUBLIC CUSTOMER AUTHENTICATION
// ======================================================


// ======================================================
// CUSTOMER REGISTRATION
// POST /api/customers/register
// ======================================================
//
// Customer account create karega.
//
// No Admin JWT required.
// Password backend mein bcrypt se hash hoga.
//
// ======================================================

router.post(
  '/register',
  customerController.registerCustomer
);


// ======================================================
// CUSTOMER LOGIN
// POST /api/customers/login
// ======================================================
//
// Customer email ya mobile number + password se
// login karega.
//
// Login successful hone par customer JWT token
// generate hoga.
//
// ======================================================

router.post(
  '/login',
  customerController.loginCustomer
);


// ======================================================
// ADMIN / AUTHENTICATED CUSTOMER MANAGEMENT
// ======================================================


// ======================================================
// GET ALL CUSTOMERS
// GET /api/customers
// ======================================================

router.get(
  '/',
  authenticateToken,
  customerController.getAllCustomers
);


// ======================================================
// GET CUSTOMER BY ID
// GET /api/customers/:id
// ======================================================

router.get(
  '/:id',
  authenticateToken,
  customerController.getCustomerById
);


// ======================================================
// CREATE CUSTOMER FROM ADMIN/POS
// POST /api/customers
// ======================================================

router.post(
  '/',
  authenticateToken,
  customerController.createCustomer
);


// ======================================================
// UPDATE CUSTOMER
// PUT /api/customers/:id
// ======================================================

router.put(
  '/:id',
  authenticateToken,
  customerController.updateCustomer
);


// ======================================================
// DELETE CUSTOMER
// DELETE /api/customers/:id
// ======================================================

router.delete(
  '/:id',
  authenticateToken,
  customerController.deleteCustomer
);


// ======================================================
// CUSTOMER LEDGER
// ======================================================


// GET /api/customers/:id/ledger

router.get(
  '/:id/ledger',
  authenticateToken,
  customerController.getCustomerLedger
);


// ======================================================
// CUSTOMER PAYMENT
// ======================================================


// POST /api/customers/:id/payments

router.post(
  '/:id/payments',
  authenticateToken,
  customerController.recordPayment
);


// ======================================================
// ALTERNATIVE PAYMENT ROUTE
// POST /api/customers/:id/payment
// ======================================================

router.post(
  '/:id/payment',
  authenticateToken,
  customerController.recordPayment
);


// ======================================================
// EXPORT ROUTER
// ======================================================

module.exports = router;
