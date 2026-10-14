const express = require('express');
const crypto = require('crypto');
const pool = require('../db');

const router = express.Router();

/* =========================================================
   STAFF SELECT
   Password hash API response में नहीं भेजेंगे
   ========================================================= */

const STAFF_SELECT = `
  SELECT
    id,
    employee_id,
    name,
    first_name,
    last_name,
    gender,
    date_of_birth,
    marital_status,
    father_name,
    mother_name,
    phone,
    emergency_contact,
    email,
    user_id,
    role,
    department,
    designation,
    salary,
    joining_date,
    qualification,
    work_experience,
    contract_type,
    epf_number,
    pay_scale,
    shift,
    current_address,
    permanent_address,
    location,
    state,
    profile_photo,
    resume,
    joining_letter,
    resignation_letter,
    other_document_name,
    other_document,
    status,
    created_at
  FROM staff
`;


/* =========================================================
   STAFF
   ========================================================= */


/* ---------------------------------------------------------
   GET ALL STAFF
   GET /api/staff
   --------------------------------------------------------- */

router.get('/', async (req, res) => {
  try {

    const [rows] = await pool.query(`
      ${STAFF_SELECT}
      ORDER BY created_at DESC
    `);

    res.json(rows);

  } catch (error) {

    console.error('GET STAFF ERROR:', error);

    res.status(500).json({
      message: 'Failed to fetch staff',
      error: error.message
    });

  }
});


/* =========================================================
   ATTENDANCE
   IMPORTANT:
   Specific attendance routes पहले रखे गए हैं।
   ========================================================= */


/* ---------------------------------------------------------
   GET ALL ATTENDANCE
   GET /api/staff/attendance/all
   --------------------------------------------------------- */

router.get('/attendance/all', async (req, res) => {
  try {

    const [rows] = await pool.query(`
      SELECT
        a.*,
        s.name AS staff_name
      FROM attendance a
      LEFT JOIN staff s
        ON s.id = a.staff_id
      ORDER BY
        a.attendance_date DESC,
        a.created_at DESC
    `);

    res.json(rows);

  } catch (error) {

    console.error('GET ATTENDANCE ERROR:', error);

    res.status(500).json({
      message: 'Failed to fetch attendance',
      error: error.message
    });

  }
});


/* ---------------------------------------------------------
   ADD / UPDATE ATTENDANCE
   POST /api/staff/attendance
   --------------------------------------------------------- */

router.post('/attendance', async (req, res) => {
  try {

    const {
      staff_id,
      attendance_date,
      status
    } = req.body;


    /* -----------------------------------------------------
       VALIDATION
       ----------------------------------------------------- */

    if (!staff_id || !attendance_date || !status) {

      return res.status(400).json({
        message:
          'Staff, attendance date and status are required'
      });

    }


    /* -----------------------------------------------------
       CHECK STAFF EXISTS
       ----------------------------------------------------- */

    const [staff] = await pool.query(
      `SELECT id FROM staff WHERE id = ?`,
      [staff_id]
    );


    if (staff.length === 0) {

      return res.status(404).json({
        message: 'Staff member not found'
      });

    }


    /* -----------------------------------------------------
       CHECK EXISTING ATTENDANCE
       Same staff + same date = update
       ----------------------------------------------------- */

    const [existing] = await pool.query(
      `
      SELECT id
      FROM attendance
      WHERE staff_id = ?
      AND attendance_date = ?
      LIMIT 1
      `,
      [
        staff_id,
        attendance_date
      ]
    );


    /* -----------------------------------------------------
       UPDATE EXISTING ATTENDANCE
       ----------------------------------------------------- */

    if (existing.length > 0) {

      await pool.query(
        `
        UPDATE attendance
        SET status = ?
        WHERE id = ?
        `,
        [
          status,
          existing[0].id
        ]
      );


      const [updated] = await pool.query(
        `
        SELECT
          a.*,
          s.name AS staff_name
        FROM attendance a
        LEFT JOIN staff s
          ON s.id = a.staff_id
        WHERE a.id = ?
        `,
        [existing[0].id]
      );


      return res.json({
        message: 'Attendance updated successfully',
        attendance: updated[0]
      });

    }


    /* -----------------------------------------------------
       NEW ATTENDANCE
       ----------------------------------------------------- */

    const id = crypto.randomUUID();


    await pool.query(
      `
      INSERT INTO attendance
      (
        id,
        staff_id,
        attendance_date,
        status
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        id,
        staff_id,
        attendance_date,
        status
      ]
    );


    const [rows] = await pool.query(
      `
      SELECT
        a.*,
        s.name AS staff_name
      FROM attendance a
      LEFT JOIN staff s
        ON s.id = a.staff_id
      WHERE a.id = ?
      `,
      [id]
    );


    res.status(201).json({
      message: 'Attendance saved successfully',
      attendance: rows[0]
    });


  } catch (error) {

    console.error('ADD ATTENDANCE ERROR:', error);

    res.status(500).json({
      message: 'Failed to save attendance',
      error: error.message
    });

  }
});


/* =========================================================
   PAYROLL
   ========================================================= */


/* ---------------------------------------------------------
   GET ALL PAYROLL
   GET /api/staff/payroll/all
   --------------------------------------------------------- */

router.get('/payroll/all', async (req, res) => {
  try {

    const [rows] = await pool.query(`
      SELECT
        p.*,
        s.name AS staff_name
      FROM payroll p
      LEFT JOIN staff s
        ON s.id = p.staff_id
      ORDER BY
        p.payment_date DESC,
        p.created_at DESC
    `);

    res.json(rows);

  } catch (error) {

    console.error('GET PAYROLL ERROR:', error);

    res.status(500).json({
      message: 'Failed to fetch payroll',
      error: error.message
    });

  }
});


/* ---------------------------------------------------------
   ADD PAYROLL
   POST /api/staff/payroll
   --------------------------------------------------------- */

router.post('/payroll', async (req, res) => {
  try {

    const {
      staff_id,
      salary_amount,
      payment_date,
      month,
      payment_status
    } = req.body;


    /* -----------------------------------------------------
       VALIDATION
       ----------------------------------------------------- */

    if (
      !staff_id ||
      salary_amount === undefined ||
      salary_amount === null ||
      !payment_date ||
      !month ||
      !payment_status
    ) {

      return res.status(400).json({
        message: 'All payroll fields are required'
      });

    }


    /* -----------------------------------------------------
       CHECK STAFF
       ----------------------------------------------------- */

    const [staff] = await pool.query(
      `SELECT id FROM staff WHERE id = ?`,
      [staff_id]
    );


    if (staff.length === 0) {

      return res.status(404).json({
        message: 'Staff member not found'
      });

    }


    /* -----------------------------------------------------
       GENERATE UNIQUE PAYROLL ID
       ----------------------------------------------------- */

    const id = crypto.randomUUID();


    /* -----------------------------------------------------
       INSERT PAYROLL
       ----------------------------------------------------- */

    await pool.query(
      `
      INSERT INTO payroll
      (
        id,
        staff_id,
        salary_amount,
        payment_date,
        month,
        payment_status
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        staff_id,
        Number(salary_amount),
        payment_date,
        month,
        payment_status
      ]
    );


    /* -----------------------------------------------------
       GET INSERTED PAYROLL
       ----------------------------------------------------- */

    const [rows] = await pool.query(
      `
      SELECT
        p.*,
        s.name AS staff_name
      FROM payroll p
      LEFT JOIN staff s
        ON s.id = p.staff_id
      WHERE p.id = ?
      `,
      [id]
    );


    res.status(201).json({
      message: 'Payroll saved successfully',
      payroll: rows[0]
    });


  } catch (error) {

    console.error('ADD PAYROLL ERROR:', error);

    res.status(500).json({
      message: 'Failed to save payroll',
      error: error.message
    });

  }
});


/* =========================================================
   GET SINGLE STAFF
   IMPORTANT:
   यह route Attendance/Payroll routes के बाद है।
   ========================================================= */


/* ---------------------------------------------------------
   GET SINGLE STAFF
   GET /api/staff/:id
   --------------------------------------------------------- */

router.get('/:id', async (req, res) => {
  try {

    const { id } = req.params;


    const [rows] = await pool.query(
      `
      ${STAFF_SELECT}
      WHERE id = ?
      `,
      [id]
    );


    if (rows.length === 0) {

      return res.status(404).json({
        message: 'Staff member not found'
      });

    }


    res.json(rows[0]);

  } catch (error) {

    console.error('GET SINGLE STAFF ERROR:', error);

    res.status(500).json({
      message: 'Failed to fetch staff',
      error: error.message
    });

  }
});


/* =========================================================
   ADD STAFF
   ========================================================= */


/* ---------------------------------------------------------
   ADD STAFF
   POST /api/staff
   --------------------------------------------------------- */

router.post('/', async (req, res) => {

  try {

    const {

      // Existing fields
      name,
      phone,
      email,
      role,
      salary,
      joining_date,
      status,

      // Personal Information
      employee_id,
      first_name,
      last_name,
      gender,
      date_of_birth,
      marital_status,
      father_name,
      mother_name,

      // Contact
      emergency_contact,

      // Account
      user_id,
      password,

      // Professional
      department,
      designation,
      qualification,
      work_experience,
      contract_type,
      epf_number,
      pay_scale,
      shift,

      // Address
      current_address,
      permanent_address,
      location,
      state,

      // Documents
      profile_photo,
      resume,
      joining_letter,
      resignation_letter,
      other_document_name,
      other_document

    } = req.body;


    /* =====================================================
       NAME
       New form first_name + last_name भेज सकता है।
       Old form name भेज सकता है।
       ===================================================== */

    const finalFirstName =
      first_name ||
      (
        name
          ? String(name).trim().split(' ')[0]
          : null
      );


    const finalLastName =
      last_name ||
      (
        name
          ? String(name)
              .trim()
              .split(' ')
              .slice(1)
              .join(' ')
          : null
      );


    const finalName =
      name ||
      [first_name, last_name]
        .filter(Boolean)
        .join(' ')
        .trim();


    /* =====================================================
       ROLE
       ===================================================== */

    const finalRole =
      role ||
      designation ||
      'Staff';


    /* =====================================================
       VALIDATION
       ===================================================== */

    if (!finalName) {

      return res.status(400).json({
        message: 'Staff name is required'
      });

    }


    if (!finalRole) {

      return res.status(400).json({
        message: 'Staff role is required'
      });

    }


    /* =====================================================
       GENERATE STAFF ID
       ===================================================== */

    const id = crypto.randomUUID();


    /* =====================================================
       PASSWORD HASH
       ===================================================== */

    let password_hash = null;


    if (password) {

      const salt =
        crypto
          .randomBytes(16)
          .toString('hex');


      const hash =
        crypto
          .scryptSync(
            password,
            salt,
            64
          )
          .toString('hex');


      password_hash =
        `${salt}:${hash}`;

    }


    /* =====================================================
       INSERT STAFF
       
       IMPORTANT:
       37 columns = 37 placeholders = 37 values
       ===================================================== */

    await pool.query(
      `
      INSERT INTO staff
      (
        id,
        employee_id,
        name,
        first_name,
        last_name,
        gender,
        date_of_birth,
        marital_status,
        father_name,
        mother_name,
        phone,
        emergency_contact,
        email,
        user_id,
        password_hash,
        role,
        department,
        designation,
        salary,
        joining_date,
        qualification,
        work_experience,
        contract_type,
        epf_number,
        pay_scale,
        shift,
        current_address,
        permanent_address,
        location,
        state,
        profile_photo,
        resume,
        joining_letter,
        resignation_letter,
        other_document_name,
        other_document,
        status
      )
      VALUES
      (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?
      )
      `,
      [

        id,

        employee_id || null,

        finalName,

        finalFirstName || null,

        finalLastName || null,

        gender || null,

        date_of_birth || null,

        marital_status || null,

        father_name || null,

        mother_name || null,

        phone || null,

        emergency_contact || null,

        email || null,

        user_id || null,

        password_hash,

        finalRole,

        department || null,

        designation || null,

        salary !== undefined &&
        salary !== ''
          ? Number(salary)
          : 0,

        joining_date || null,

        qualification || null,

        work_experience || null,

        contract_type || null,

        epf_number || null,

        pay_scale || null,

        shift || null,

        current_address || null,

        permanent_address || null,

        location || null,

        state || null,

        profile_photo || null,

        resume || null,

        joining_letter || null,

        resignation_letter || null,

        other_document_name || null,

        other_document || null,

        status || 'Active'

      ]
    );


    /* =====================================================
       GET CREATED STAFF
       ===================================================== */

    const [rows] = await pool.query(
      `
      ${STAFF_SELECT}
      WHERE id = ?
      `,
      [id]
    );


    res.status(201).json({
      message: 'Staff added successfully',
      staff: rows[0]
    });


  } catch (error) {

    console.error('ADD STAFF ERROR:', error);

    res.status(500).json({
      message: 'Failed to add staff',
      error: error.message
    });

  }

});


/* =========================================================
   UPDATE STAFF
   ========================================================= */


/* ---------------------------------------------------------
   UPDATE STAFF
   PUT /api/staff/:id
   --------------------------------------------------------- */

router.put('/:id', async (req, res) => {

  try {

    const { id } = req.params;


    const {

      name,
      phone,
      email,
      role,
      salary,
      joining_date,
      status,

      employee_id,
      first_name,
      last_name,
      gender,
      date_of_birth,
      marital_status,
      father_name,
      mother_name,

      emergency_contact,

      user_id,
      password,

      department,
      designation,
      qualification,
      work_experience,
      contract_type,
      epf_number,
      pay_scale,
      shift,

      current_address,
      permanent_address,
      location,
      state,

      profile_photo,
      resume,
      joining_letter,
      resignation_letter,
      other_document_name,
      other_document

    } = req.body;


    /* =====================================================
       CHECK STAFF
       ===================================================== */

    const [existingStaff] =
      await pool.query(
        `
        SELECT
          id,
          password_hash
        FROM staff
        WHERE id = ?
        `,
        [id]
      );


    if (existingStaff.length === 0) {

      return res.status(404).json({
        message: 'Staff member not found'
      });

    }


    /* =====================================================
       NAME
       ===================================================== */

    const finalFirstName =
      first_name ||
      (
        name
          ? String(name)
              .trim()
              .split(' ')[0]
          : null
      );


    const finalLastName =
      last_name ||
      (
        name
          ? String(name)
              .trim()
              .split(' ')
              .slice(1)
              .join(' ')
          : null
      );


    const finalName =
      name ||
      [first_name, last_name]
        .filter(Boolean)
        .join(' ')
        .trim();


    /* =====================================================
       ROLE
       ===================================================== */

    const finalRole =
      role ||
      designation ||
      'Staff';


    /* =====================================================
       PASSWORD
       नया password नहीं दिया तो पुराना रहेगा
       ===================================================== */

    let password_hash =
      existingStaff[0].password_hash ||
      null;


    if (password) {

      const salt =
        crypto
          .randomBytes(16)
          .toString('hex');


      const hash =
        crypto
          .scryptSync(
            password,
            salt,
            64
          )
          .toString('hex');


      password_hash =
        `${salt}:${hash}`;

    }


    /* =====================================================
       UPDATE STAFF
       ===================================================== */

    await pool.query(
      `
      UPDATE staff
      SET

        employee_id = ?,

        name = ?,

        first_name = ?,

        last_name = ?,

        gender = ?,

        date_of_birth = ?,

        marital_status = ?,

        father_name = ?,

        mother_name = ?,

        phone = ?,

        emergency_contact = ?,

        email = ?,

        user_id = ?,

        password_hash = ?,

        role = ?,

        department = ?,

        designation = ?,

        salary = ?,

        joining_date = ?,

        qualification = ?,

        work_experience = ?,

        contract_type = ?,

        epf_number = ?,

        pay_scale = ?,

        shift = ?,

        current_address = ?,

        permanent_address = ?,

        location = ?,

        state = ?,

        profile_photo = ?,

        resume = ?,

        joining_letter = ?,

        resignation_letter = ?,

        other_document_name = ?,

        other_document = ?,

        status = ?

      WHERE id = ?
      `,
      [

        employee_id || null,

        finalName || null,

        finalFirstName || null,

        finalLastName || null,

        gender || null,

        date_of_birth || null,

        marital_status || null,

        father_name || null,

        mother_name || null,

        phone || null,

        emergency_contact || null,

        email || null,

        user_id || null,

        password_hash,

        finalRole,

        department || null,

        designation || null,

        salary !== undefined &&
        salary !== ''
          ? Number(salary)
          : 0,

        joining_date || null,

        qualification || null,

        work_experience || null,

        contract_type || null,

        epf_number || null,

        pay_scale || null,

        shift || null,

        current_address || null,

        permanent_address || null,

        location || null,

        state || null,

        profile_photo || null,

        resume || null,

        joining_letter || null,

        resignation_letter || null,

        other_document_name || null,

        other_document || null,

        status || 'Active',

        id

      ]
    );


    /* =====================================================
       GET UPDATED STAFF
       ===================================================== */

    const [rows] = await pool.query(
      `
      ${STAFF_SELECT}
      WHERE id = ?
      `,
      [id]
    );


    res.json({
      message: 'Staff updated successfully',
      staff: rows[0]
    });


  } catch (error) {

    console.error(
      'UPDATE STAFF ERROR:',
      error
    );

    res.status(500).json({
      message: 'Failed to update staff',
      error: error.message
    });

  }

});


/* =========================================================
   DELETE STAFF
   Attendance + Payroll पहले delete होंगे
   ========================================================= */


/* ---------------------------------------------------------
   DELETE STAFF
   DELETE /api/staff/:id
   --------------------------------------------------------- */

router.delete('/:id', async (req, res) => {

  const connection =
    await pool.getConnection();

  try {

    const { id } = req.params;


    await connection.beginTransaction();


    /* -----------------------------------------------------
       Delete attendance records
       ----------------------------------------------------- */

    await connection.query(
      `
      DELETE FROM attendance
      WHERE staff_id = ?
      `,
      [id]
    );


    /* -----------------------------------------------------
       Delete payroll records
       ----------------------------------------------------- */

    await connection.query(
      `
      DELETE FROM payroll
      WHERE staff_id = ?
      `,
      [id]
    );


    /* -----------------------------------------------------
       Delete staff
       ----------------------------------------------------- */

    const [result] =
      await connection.query(
        `
        DELETE FROM staff
        WHERE id = ?
        `,
        [id]
      );


    if (result.affectedRows === 0) {

      await connection.rollback();

      return res.status(404).json({
        message: 'Staff member not found'
      });

    }


    await connection.commit();


    res.json({
      message: 'Staff deleted successfully'
    });


  } catch (error) {

    await connection.rollback();

    console.error(
      'DELETE STAFF ERROR:',
      error
    );

    res.status(500).json({
      message: 'Failed to delete staff',
      error: error.message
    });

  } finally {

    connection.release();

  }

});


/* =========================================================
   EXPORT ROUTER
   ========================================================= */

module.exports = router;
