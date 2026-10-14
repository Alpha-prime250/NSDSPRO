const express = require('express');

const router = express.Router();

const orderController = require('../controllers/orderController');

const { authenticateToken } = require('../middleware/auth');

// =====================================================
// CUSTOMER STOREFRONT
// =====================================================

// Create new customer order
router.post(
  '/',
  authenticateToken,
  orderController.createOrder
);


// =====================================================
// PUBLIC ORDER TRACKING
// =====================================================
// Customer can track using:
// 1. Order Number
// 2. Registered Mobile Number
//
// IMPORTANT:
// authenticateToken is intentionally NOT used here.
// The Track Order page is publicly accessible.
// =====================================================

router.get(
  '/track/:query',
  orderController.trackOrder
);


// Live GPS tracking
router.get(
  '/track/:query/live',
  orderController.getTracking
);


// =====================================================
// CUSTOMER - MY ORDERS
// =====================================================

// Get logged-in customer's orders
router.get(
  '/my-orders',
  authenticateToken,
  orderController.getMyOrders
);


// Get one order belonging to logged-in customer
router.get(
  '/my-orders/:id',
  authenticateToken,
  orderController.getMyOrderById
);


// =====================================================
// ADMIN / STAFF MANAGEMENT
// =====================================================

// Get all orders
router.get(
  '/',
  authenticateToken,
  orderController.getAllOrders
);


// Rider / staff GPS location update
router.post(
  '/:id/location',
  authenticateToken,
  orderController.updateRiderLocation
);


// Get any order by ID
router.get(
  '/:id',
  authenticateToken,
  orderController.getOrderById
);


// Update order status
router.put(
  '/:id/status',
  authenticateToken,
  orderController.updateOrderStatus
);


module.exports = router;