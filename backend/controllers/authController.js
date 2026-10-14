const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const { generateToken } = require('../middleware/auth');

exports.login = async (req, res) => {
  try {
    const { username, password, pin } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // 1. PIN Authentication
    if (pin) {
      const user = await User.findByPin(pin);
      if (!user) {
        await AuditLog.log({
          userName: 'Anonymous',
          action: 'LOGIN_FAILED_PIN',
          entityType: 'User',
          ipAddress
        });
        return res.status(401).json({ error: 'Invalid Cashier PIN.' });
      }

      const tokenPayload = {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      };
      const token = generateToken(tokenPayload);

      await AuditLog.log({
        userId: user.id,
        userName: user.name,
        action: 'LOGIN_SUCCESS_PIN',
        entityType: 'User',
        entityId: user.id,
        ipAddress
      });

      return res.json({
        success: true,
        token,
        user: tokenPayload
      });
    }

    // 2. Credentials Authentication
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password or PIN required' });
    }

    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const isMatch = await User.verifyPassword(user, password);
    if (!isMatch) {
      await AuditLog.log({
        userName: username,
        action: 'LOGIN_FAILED_PASSWORD',
        entityType: 'User',
        ipAddress
      });
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role
    };
    const token = generateToken(tokenPayload);

    await AuditLog.log({
      userId: user.id,
      userName: user.name,
      action: 'LOGIN_SUCCESS_PASSWORD',
      entityType: 'User',
      entityId: user.id,
      ipAddress
    });

    res.json({
      success: true,
      token,
      user: tokenPayload
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', message: err.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, role, name, pin, password } = req.body;
    if (!username || !name) {
      return res.status(400).json({ error: 'Username and name are required' });
    }
    const user = await User.create(req.body);

    await AuditLog.log({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'USER_CREATED',
      entityType: 'User',
      entityId: user.id,
      details: { username, role, name }
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create user', message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const success = await User.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'User not found' });
    }

    await AuditLog.log({
      userId: req.user?.id,
      userName: req.user?.name,
      action: 'USER_DELETED',
      entityType: 'User',
      entityId: req.params.id
    });

    res.json({ message: 'User deactivated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user', message: err.message });
  }
};
