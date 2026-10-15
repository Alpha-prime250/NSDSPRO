const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: '',
  database: 'single_vendor_pos_tracking_v2',

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

pool.getConnection()
  .then((conn) => {
    console.log('==========================================');
    console.log('✅ DATABASE CONNECTED');
    console.log('📦 DATABASE: single_vendor_pos_tracking_v2');
    console.log('==========================================');

    conn.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

module.exports = pool;