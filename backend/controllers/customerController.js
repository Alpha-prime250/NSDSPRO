const Customer = require('../models/Customer');
const CustomerLedger = require('../models/CustomerLedger');
const DeliveryZone = require('../models/DeliveryZone');

const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');

// ======================================================
// GET ALL CUSTOMERS
// ======================================================

exports.getAllCustomers = async (req, res) => {
  try {
    const { search = '' } = req.query;

    const customers = await Customer.findAll({ search });

    res.json(customers);
  } catch (err) {
    console.error('Failed to fetch customers:', err);

    res.status(500).json({
      error: 'Failed to fetch customers',
      message: err.message
    });
  }
};

// ======================================================
// GET CUSTOMER BY ID
// ======================================================

exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    res.json(customer);
  } catch (err) {
    console.error('Failed to fetch customer:', err);

    res.status(500).json({
      error: 'Failed to fetch customer',
      message: err.message
    });
  }
};

// ======================================================
// CUSTOMER ACCOUNT REGISTRATION
// ======================================================
// POST /api/customers/register
//
// Customer:
// Name + Phone + Email + Password + Pincode + Address
//
// Registration ke time delivery zone check hota hai.
// Agar PIN code delivery zone me available nahi hai,
// account create nahi hoga.
// ======================================================

exports.registerCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      password,
      pincode,
      address
    } = req.body;

    // ----------------------------------------------
    // REQUIRED FIELD VALIDATION
    // ----------------------------------------------

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        error: 'Customer name is required'
      });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({
        error: 'Customer mobile number is required'
      });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        error: 'Customer email is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        error: 'Password is required'
      });
    }

    if (!pincode || !String(pincode).trim()) {
      return res.status(400).json({
        error: 'Pincode is required'
      });
    }

    if (!address || !String(address).trim()) {
      return res.status(400).json({
        error: 'Customer address is required'
      });
    }

    // ----------------------------------------------
    // CLEAN DATA
    // ----------------------------------------------

    const cleanName = String(name).trim();
    const cleanPhone = String(phone).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPincode = String(pincode).trim();
    const cleanAddress = String(address).trim();

    // ----------------------------------------------
    // PHONE VALIDATION
    // ----------------------------------------------

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        error: 'Please enter a valid 10-digit mobile number'
      });
    }

    // ----------------------------------------------
    // PINCODE VALIDATION
    // ----------------------------------------------

    if (!/^[0-9]{6}$/.test(cleanPincode)) {
      return res.status(400).json({
        error: 'Please enter a valid 6-digit PIN code'
      });
    }

    // ----------------------------------------------
    // EMAIL VALIDATION
    // ----------------------------------------------

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        error: 'Please enter a valid email address'
      });
    }

    // ----------------------------------------------
    // PASSWORD VALIDATION
    // ----------------------------------------------

    if (String(password).length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters'
      });
    }

    // ==================================================
    // DELIVERY ZONE CHECK
    // ==================================================
    // Pincode delivery ON hai tabhi account create hoga.
    // Delivery OFF / unknown PIN = registration blocked.
    // ==================================================

    const deliveryZone =
      await DeliveryZone.checkAvailability(cleanPincode);

    if (!deliveryZone) {
      return res.status(400).json({
        error: 'Delivery is not available at this PIN code or area.'
      });
    }

    // ----------------------------------------------
    // CHECK EXISTING EMAIL / PHONE
    // ----------------------------------------------

    const existingEmail =
      await Customer.findByLogin(cleanEmail);

    if (existingEmail) {
      return res.status(409).json({
        error:
          'An account with this email or mobile number already exists. Please login instead.'
      });
    }

    const existingPhone =
      await Customer.findByLogin(cleanPhone);

    if (existingPhone) {
      return res.status(409).json({
        error:
          'An account with this mobile number already exists. Please login instead.'
      });
    }

    // ----------------------------------------------
    // HASH PASSWORD
    // ----------------------------------------------

    const passwordHash = await bcrypt.hash(
      String(password),
      12
    );

    // ----------------------------------------------
    // CREATE CUSTOMER ACCOUNT
    // ----------------------------------------------

    const customer =
      await Customer.createAccount({
        name: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        password_hash: passwordHash,
        pincode: cleanPincode,
        address: cleanAddress
      });

    // ----------------------------------------------
    // AUTOMATIC LOGIN AFTER REGISTRATION
    // ----------------------------------------------

    const tokenPayload = {
      id: customer.id,
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      role: 'Customer',
      type: 'customer'
    };

    const token = generateToken(tokenPayload);

    // ----------------------------------------------
    // UPDATE LAST LOGIN
    // ----------------------------------------------

    await Customer.updateLastLogin(customer.id);

    // ----------------------------------------------
    // SUCCESS RESPONSE
    // ----------------------------------------------

    res.status(201).json({
      success: true,
      message: 'Customer account created successfully',

      token,

      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        pincode: customer.pincode,
        address: customer.address,
        delivery_fee: deliveryZone.delivery_fee,
        estimated_minutes: deliveryZone.estimated_minutes,
        role: 'Customer'
      }
    });

  } catch (err) {
    console.error(
      'Failed to register customer:',
      err
    );

    // Duplicate database error
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error:
          'An account with this email or mobile number already exists. Please login instead.'
      });
    }

    res.status(500).json({
      error: 'Failed to create customer account',
      message: err.message
    });
  }
};

// ======================================================
// CUSTOMER LOGIN
// ======================================================
// POST /api/customers/login
//
// Login with:
// Email OR Phone + Password
// ======================================================

exports.loginCustomer = async (req, res) => {
  try {
    const {
      login,
      password
    } = req.body;

    // ----------------------------------------------
    // REQUIRED FIELD VALIDATION
    // ----------------------------------------------

    if (!login || !String(login).trim()) {
      return res.status(400).json({
        error: 'Email or mobile number is required'
      });
    }

    if (!password) {
      return res.status(400).json({
        error: 'Password is required'
      });
    }

    const cleanLogin = String(login).trim();

    // ----------------------------------------------
    // FIND CUSTOMER
    // ----------------------------------------------

    const customer =
      await Customer.findByLogin(cleanLogin);

    if (!customer) {
      return res.status(401).json({
        error: 'Invalid email/mobile number or password'
      });
    }

    // ----------------------------------------------
    // CHECK ACCOUNT STATUS
    // ----------------------------------------------

    if (Number(customer.is_active) !== 1) {
      return res.status(403).json({
        error: 'Your customer account is inactive'
      });
    }

    // ----------------------------------------------
    // CHECK PASSWORD EXISTS
    // ----------------------------------------------

    if (!customer.password_hash) {
      return res.status(401).json({
        error:
          'This customer account does not have a password. Please create a new account.'
      });
    }

    // ----------------------------------------------
    // COMPARE PASSWORD
    // ----------------------------------------------

    const passwordMatch =
      await bcrypt.compare(
        String(password),
        customer.password_hash
      );

    if (!passwordMatch) {
      return res.status(401).json({
        error: 'Invalid email/mobile number or password'
      });
    }

    // ----------------------------------------------
    // UPDATE LAST LOGIN
    // ----------------------------------------------

    await Customer.updateLastLogin(
      customer.id
    );

    // ----------------------------------------------
    // CREATE CUSTOMER TOKEN
    // ----------------------------------------------

    const tokenPayload = {
      id: customer.id,
      customerId: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      role: 'Customer',
      type: 'customer'
    };

    const token =
      generateToken(tokenPayload);

    // ----------------------------------------------
    // SUCCESS RESPONSE
    // ----------------------------------------------

    res.status(200).json({
      success: true,
      message: 'Customer login successful',

      token,

      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        pincode: customer.pincode,
        address: customer.address,
        outstanding_dues:
          customer.outstanding_dues,
        role: 'Customer'
      }
    });

  } catch (err) {
    console.error(
      'Customer login error:',
      err
    );

    res.status(500).json({
      error: 'Server error during customer login',
      message: err.message
    });
  }
};

// ======================================================
// ADMIN CREATE CUSTOMER
// ======================================================

exports.createCustomer = async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      pincode,
      address
    } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({
        error: 'Customer name is required'
      });
    }

    if (!phone || !String(phone).trim()) {
      return res.status(400).json({
        error: 'Customer mobile number is required'
      });
    }

    if (!email || !String(email).trim()) {
      return res.status(400).json({
        error: 'Customer email is required'
      });
    }

    if (!pincode || !String(pincode).trim()) {
      return res.status(400).json({
        error: 'Pincode is required'
      });
    }

    if (!address || !String(address).trim()) {
      return res.status(400).json({
        error: 'Customer address is required'
      });
    }

    const cleanName = String(name).trim();
    const cleanPhone = String(phone).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPincode = String(pincode).trim();
    const cleanAddress = String(address).trim();

    if (!/^[0-9]{10}$/.test(cleanPhone)) {
      return res.status(400).json({
        error: 'Please enter a valid 10-digit mobile number'
      });
    }

    if (!/^[0-9]{6}$/.test(cleanPincode)) {
      return res.status(400).json({
        error: 'Please enter a valid 6-digit PIN code'
      });
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({
        error: 'Please enter a valid email address'
      });
    }

    const customerData = {
      name: cleanName,
      phone: cleanPhone,
      email: cleanEmail,
      pincode: cleanPincode,
      address: cleanAddress
    };

    const customer =
      await Customer.create(customerData);

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      customer
    });

  } catch (err) {
    console.error(
      'Failed to create customer:',
      err
    );

    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error:
          'Customer with this email or mobile number already exists'
      });
    }

    res.status(500).json({
      error: 'Failed to create customer',
      message: err.message
    });
  }
};

// ======================================================
// UPDATE CUSTOMER
// ======================================================

exports.updateCustomer = async (req, res) => {
  try {
    const customer =
      await Customer.update(
        req.params.id,
        req.body
      );

    if (!customer) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    res.json(customer);

  } catch (err) {
    console.error(
      'Failed to update customer:',
      err
    );

    res.status(500).json({
      error: 'Failed to update customer',
      message: err.message
    });
  }
};

// ======================================================
// DELETE CUSTOMER
// ======================================================

exports.deleteCustomer = async (req, res) => {
  try {
    const success =
      await Customer.delete(
        req.params.id
      );

    if (!success) {
      return res.status(404).json({
        error: 'Customer not found'
      });
    }

    res.json({
      message: 'Customer deleted successfully'
    });

  } catch (err) {
    console.error(
      'Failed to delete customer:',
      err
    );

    res.status(500).json({
      error: 'Failed to delete customer',
      message: err.message
    });
  }
};

// ======================================================
// CUSTOMER PAYMENT
// ======================================================

exports.recordPayment = async (req, res) => {
  try {
    const receipt =
      await CustomerLedger.recordPayment(
        {
          customer_id: req.params.id,
          ...req.body
        },
        req.user
      );

    res.status(200).json({
      success: true,
      ...receipt
    });

  } catch (err) {
    console.error(
      'Failed to record customer payment:',
      err.message
    );

    res.status(400).json({
      error: 'Failed to record payment',
      message: err.message
    });
  }
};

// ======================================================
// CUSTOMER LEDGER
// ======================================================

exports.getCustomerLedger = async (req, res) => {
  try {
    const ledger =
      await CustomerLedger.getLedger(
        req.params.id
      );

    res.json(ledger);

  } catch (err) {
    console.error(
      'Failed to fetch customer ledger:',
      err.message
    );

    res.status(500).json({
      error: 'Failed to fetch customer ledger',
      message: err.message
    });
  }
};
