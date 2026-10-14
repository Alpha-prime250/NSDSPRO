const pool = require('../db');
const crypto = require('crypto');

class AuditLog {
  static async log({
    userId = null,
    userName = 'System',
    action,
    entityType,
    entityId = null,
    details = null,
    ipAddress = null
  }) {
    try {
      const id = crypto.randomUUID();
      await pool.query(
        `INSERT INTO audit_logs (id, user_id, user_name, action, entity_type, entity_id, details, ip_address) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, userName, action, entityType, entityId, JSON.stringify(details), ipAddress]
      );
    } catch (err) {
      console.error('[AuditLog] Failed to record audit log:', err.message);
    }
  }

  static async getRecent(limit = 100) {
    const [rows] = await pool.query(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?',
      [parseInt(limit, 10)]
    );
    return rows;
  }
}

module.exports = AuditLog;
