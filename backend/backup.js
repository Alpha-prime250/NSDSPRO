/**
 * Automated Database Backup Utility for Single Vendor POS
 * Dumps MySQL schema and data into timestamped SQL backups
 */

const fs = require('fs');
const path = require('path');
const pool = require('./db');

async function backupDatabase() {
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(backupDir, `single_vendor_pos_backup_${timestamp}.sql`);

  console.log(`Starting database backup to: ${backupFile}`);

  const connection = await pool.getConnection();
  const writeStream = fs.createWriteStream(backupFile, { encoding: 'utf8' });

  try {
    writeStream.write(`-- Single Vendor Grocery POS Database Backup\n`);
    writeStream.write(`-- Generated: ${new Date().toISOString()}\n\n`);
    writeStream.write(`SET FOREIGN_KEY_CHECKS=0;\n\n`);

    const [tables] = await connection.query('SHOW TABLES');
    const tableNames = tables.map(r => Object.values(r)[0]);

    for (const tableName of tableNames) {
      // 1. Create table statement
      const [createResult] = await connection.query(`SHOW CREATE TABLE \`${tableName}\``);
      const createSql = createResult[0]['Create Table'];
      writeStream.write(`-- Table structure for ${tableName}\n`);
      writeStream.write(`DROP TABLE IF EXISTS \`${tableName}\`;\n`);
      writeStream.write(`${createSql};\n\n`);

      // 2. Dump data
      const [rows] = await connection.query(`SELECT * FROM \`${tableName}\``);
      if (rows.length > 0) {
        writeStream.write(`-- Data for ${tableName} (${rows.length} rows)\n`);
        for (const row of rows) {
          const keys = Object.keys(row).map(k => `\`${k}\``).join(', ');
          const values = Object.values(row).map(v => {
            if (v === null) return 'NULL';
            if (typeof v === 'number') return v;
            if (v instanceof Date) return `'${v.toISOString().slice(0, 19).replace('T', ' ')}'`;
            return `'${String(v).replace(/'/g, "\\'")}'`;
          }).join(', ');
          writeStream.write(`INSERT INTO \`${tableName}\` (${keys}) VALUES (${values});\n`);
        }
        writeStream.write(`\n`);
      }
    }

    writeStream.write(`SET FOREIGN_KEY_CHECKS=1;\n`);
    writeStream.end();

    console.log(`✓ Backup saved successfully: ${backupFile}`);
    return backupFile;
  } catch (err) {
    console.error('❌ Backup failed:', err);
    throw err;
  } finally {
    connection.release();
  }
}

if (require.main === module) {
  backupDatabase().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = backupDatabase;
