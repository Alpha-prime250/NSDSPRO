const Order = require('../models/Order');

// =====================================================
// HELPER: GET LOGGED-IN CUSTOMER ID
// =====================================================
const getCustomerId = (req) => {
  return (
    req.user?.customerId ||
    (req.user?.type === 'customer' ? req.user.id : null) ||
    null
  );
};

// =====================================================
// ADMIN / STAFF - GET ALL ORDERS
// =====================================================
exports.getAllOrders = async (req, res) => {
  try {
    const { status } = req.query;

    const orders = await Order.findAll({ status });

    return res.status(200).json(orders);
  } catch (err) {
    console.error('Get All Orders Error:', err);

    return res.status(500).json({
      error: 'Failed to fetch orders',
      message: err.message,
    });
  }
};

// =====================================================
// ADMIN / STAFF - GET ORDER BY ID
// =====================================================
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    return res.status(200).json(order);
  } catch (err) {
    console.error('Get Order By ID Error:', err);

    return res.status(500).json({
      error: 'Failed to fetch order',
      message: err.message,
    });
  }
};

// =====================================================
// CUSTOMER - TRACK ORDER BY MOBILE / ORDER NUMBER
// =====================================================
// This endpoint is designed for the public Track Order page.
// It can work with:
//   WEB-248415
//   9876543210
//   Order UUID
// =====================================================
exports.trackOrder = async (req, res) => {
  try {
    const query = String(req.params.query || '').trim();

    if (!query) {
      return res.status(400).json({
        error: 'Order tracking query is required',
      });
    }

    console.log('Tracking order query:', query);

    const orders = await Order.findByCustomer(query);

    const list = Array.isArray(orders)
      ? orders
      : orders
        ? [orders]
        : [];

    console.log('Tracking results:', list.length);

    if (list.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(list);
  } catch (err) {
    console.error('Track Order Error:', err);

    return res.status(500).json({
      error: 'Failed to track order',
      message: err.message,
    });
  }
};

// =====================================================
// CUSTOMER - CREATE ONLINE ORDER
// =====================================================
exports.createOrder = async (req, res) => {
  try {
    const {
      customer_name,
      customer_phone,
      customer_address,
      items,
      total_amount,
    } = req.body;

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------
    if (
      !customer_name ||
      !customer_phone ||
      !customer_address ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        error: 'Customer contact details and items are required',
      });
    }

    if (
      total_amount === undefined ||
      total_amount === null ||
      Number(total_amount) < 0 ||
      !Number.isFinite(Number(total_amount))
    ) {
      return res.status(400).json({
        error: 'Valid total amount is required',
      });
    }

    // -------------------------------------------------
    // GET LOGGED-IN CUSTOMER ID
    // -------------------------------------------------
    const customerId = getCustomerId(req);

    // -------------------------------------------------
    // PREPARE ORDER DATA
    // -------------------------------------------------
    const orderData = {
      ...req.body,

      // Prefer authenticated customer ID.
      // Model also handles phone-based customer lookup.
      customer_id:
        customerId ||
        req.body.customer_id ||
        null,

      customer_name: String(customer_name).trim(),
      customer_phone: String(customer_phone).trim(),
      customer_address: String(customer_address).trim(),

      items,

      total_amount: Number(total_amount),
    };

    console.log('Creating online order:', {
      customer_id: orderData.customer_id,
      customer_name: orderData.customer_name,
      customer_phone: orderData.customer_phone,
      customer_address: orderData.customer_address,
    });

    // -------------------------------------------------
    // CREATE ORDER
    // -------------------------------------------------
    const order = await Order.create(orderData);

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order,
    });
  } catch (err) {
    console.error('Create Order Error:', err);

    return res.status(500).json({
      error: 'Failed to place order',
      message: err.message,
    });
  }
};

// =====================================================
// CUSTOMER - MY ORDERS
// =====================================================
exports.getMyOrders = async (req, res) => {
  try {
    const customerId = getCustomerId(req);

    if (!customerId) {
      return res.status(403).json({
        error: 'Customer authentication required',
      });
    }

    const orders = await Order.findByCustomerId(customerId);

    return res.status(200).json({
      success: true,
      orders: Array.isArray(orders) ? orders : [],
    });
  } catch (err) {
    console.error('Get My Orders Error:', err);

    return res.status(500).json({
      error: 'Failed to fetch your orders',
      message: err.message,
    });
  }
};

// =====================================================
// CUSTOMER - MY ORDER DETAILS
// =====================================================
exports.getMyOrderById = async (req, res) => {
  try {
    const customerId = getCustomerId(req);

    if (!customerId) {
      return res.status(403).json({
        error: 'Customer authentication required',
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    // -------------------------------------------------
    // VERIFY ORDER OWNERSHIP
    // -------------------------------------------------
    if (
      String(order.customer_id || '') !==
      String(customerId)
    ) {
      return res.status(403).json({
        error: 'You are not allowed to view this order',
      });
    }

    return res.status(200).json(order);
  } catch (err) {
    console.error('Get My Order Details Error:', err);

    return res.status(500).json({
      error: 'Failed to fetch order details',
      message: err.message,
    });
  }
};

// =====================================================
// CUSTOMER - LIVE TRACKING SNAPSHOT
// =====================================================
// Returns:
// customer_lat
// customer_lng
// rider_lat
// rider_lng
// rider_accuracy
// rider_location_updated_at
// status
// assigned_rider
// =====================================================
exports.getTracking = async (req, res) => {
  try {
    const query = String(req.params.query || '').trim();

    if (!query) {
      return res.status(400).json({
        error: 'Tracking query is required',
      });
    }

    console.log('Live tracking query:', query);

    const order = await Order.getTracking(query);

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    // -------------------------------------------------
    // OPTIONAL OWNERSHIP CHECK
    // -------------------------------------------------
    // If customer is logged in, verify ownership.
    // Public tracking is also allowed when req.user
    // is not present.
    const customerId = getCustomerId(req);

    if (
      customerId &&
      order.customer_id &&
      String(order.customer_id) !== String(customerId)
    ) {
      return res.status(403).json({
        error: 'You are not allowed to track this order',
      });
    }

    // -------------------------------------------------
    // RETURN LIVE TRACKING DATA
    // -------------------------------------------------
    return res.status(200).json({
      success: true,

      id: order.id,

      order_number: order.order_number,

      status: order.status,

      customer_name: order.customer_name,

      customer_phone: order.customer_phone,

      customer_address: order.customer_address,

      // CUSTOMER / DELIVERY LOCATION
      customer_lat:
        order.customer_lat !== null &&
        order.customer_lat !== undefined
          ? Number(order.customer_lat)
          : null,

      customer_lng:
        order.customer_lng !== null &&
        order.customer_lng !== undefined
          ? Number(order.customer_lng)
          : null,

      customer_location_updated_at:
        order.customer_location_updated_at || null,

      // RIDER GPS
      rider_lat:
        order.rider_lat !== null &&
        order.rider_lat !== undefined
          ? Number(order.rider_lat)
          : null,

      rider_lng:
        order.rider_lng !== null &&
        order.rider_lng !== undefined
          ? Number(order.rider_lng)
          : null,

      rider_accuracy:
        order.rider_accuracy !== null &&
        order.rider_accuracy !== undefined
          ? Number(order.rider_accuracy)
          : null,

      rider_location_updated_at:
        order.rider_location_updated_at || null,

      assigned_rider:
        order.assigned_rider || null,

      created_at:
        order.created_at || null,
    });
  } catch (err) {
    console.error('Get Tracking Error:', err);

    return res.status(500).json({
      error: 'Failed to fetch live tracking',
      message: err.message,
    });
  }
};

// =====================================================
// RIDER / STAFF - UPDATE LIVE GPS LOCATION
// =====================================================
// Called repeatedly from rider device using:
// navigator.geolocation.watchPosition()
// =====================================================
exports.updateRiderLocation = async (req, res) => {
  try {
    // -------------------------------------------------
    // CHECK USER ROLE
    // -------------------------------------------------
    const role = String(
      req.user?.role ||
      req.user?.type ||
      ''
    ).toLowerCase();

    if (role === 'customer') {
      return res.status(403).json({
        error:
          'Customer accounts cannot send rider GPS location',
      });
    }

    // -------------------------------------------------
    // GET GPS DATA
    // -------------------------------------------------
    const lat = Number(req.body?.lat);
    const lng = Number(req.body?.lng);

    const accuracy =
      req.body?.accuracy === undefined ||
      req.body?.accuracy === null ||
      req.body?.accuracy === ''
        ? null
        : Number(req.body.accuracy);

    // -------------------------------------------------
    // VALIDATE LATITUDE / LONGITUDE
    // -------------------------------------------------
    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return res.status(400).json({
        error:
          'Valid latitude and longitude are required',
      });
    }

    // -------------------------------------------------
    // VALIDATE GPS ACCURACY
    // -------------------------------------------------
    if (
      accuracy !== null &&
      (!Number.isFinite(accuracy) || accuracy < 0)
    ) {
      return res.status(400).json({
        error: 'Invalid GPS accuracy',
      });
    }

    console.log('Rider GPS received:', {
      orderId: req.params.id,
      lat,
      lng,
      accuracy,
    });

    // -------------------------------------------------
    // UPDATE DATABASE
    // -------------------------------------------------
    const order = await Order.updateRiderLocation(
      req.params.id,
      {
        lat,
        lng,
        accuracy,
        riderName:
          req.user?.name ||
          req.user?.username ||
          null,
      }
    );

    if (!order) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    // -------------------------------------------------
    // RETURN UPDATED GPS
    // -------------------------------------------------
    return res.status(200).json({
      success: true,

      message: 'Rider GPS location updated',

      order_number:
        order.order_number,

      status:
        order.status,

      rider_lat:
        order.rider_lat !== null &&
        order.rider_lat !== undefined
          ? Number(order.rider_lat)
          : null,

      rider_lng:
        order.rider_lng !== null &&
        order.rider_lng !== undefined
          ? Number(order.rider_lng)
          : null,

      rider_accuracy:
        order.rider_accuracy !== null &&
        order.rider_accuracy !== undefined
          ? Number(order.rider_accuracy)
          : null,

      rider_location_updated_at:
        order.rider_location_updated_at ||
        null,

      assigned_rider:
        order.assigned_rider ||
        null,
    });
  } catch (err) {
    console.error(
      'Update Rider Location Error:',
      err
    );

    return res.status(500).json({
      error:
        'Failed to update rider location',
      message: err.message,
    });
  }
};

// =====================================================
// ADMIN / STAFF - UPDATE ORDER STATUS
// =====================================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        error: 'Status is required',
      });
    }

    const allowedStatuses = [
      'Pending',
      'Accepted',
      'Out for Delivery',
      'Delivered',
      'Cancelled',
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid order status',
        allowedStatuses,
      });
    }

    const updated = await Order.updateStatus(
      req.params.id,
      status,
      req.user
    );

    if (!updated) {
      return res.status(404).json({
        error: 'Order not found',
      });
    }

    return res.status(200).json(updated);
  } catch (err) {
    console.error(
      'Update Order Status Error:',
      err
    );

    return res.status(500).json({
      error:
        'Failed to update order status',
      message: err.message,
    });
  }
};