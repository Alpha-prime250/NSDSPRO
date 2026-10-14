const pool = require('../db');
const crypto = require('crypto');

const DeliveryZone = {

  // ==========================================
  // GET ALL DELIVERY ZONES
  // ==========================================

  async findAll() {

    const [rows] = await pool.query(`
      SELECT
        id,
        zone_name,
        pincode,
        place,
        city,
        state,
        delivery_available,
        delivery_fee,
        min_order_amount,
        estimated_minutes,
        min_distance_km,
        max_distance_km,
        created_at,
        updated_at
      FROM delivery_zones
      ORDER BY created_at DESC
    `);

    return rows;
  },


  // ==========================================
  // GET DELIVERY ZONE BY ID
  // ==========================================

  async findById(id) {

    const [rows] = await pool.query(
      `
      SELECT
        id,
        zone_name,
        pincode,
        place,
        city,
        state,
        delivery_available,
        delivery_fee,
        min_order_amount,
        estimated_minutes,
        min_distance_km,
        max_distance_km,
        created_at,
        updated_at
      FROM delivery_zones
      WHERE id = ?
      LIMIT 1
      `,
      [id]
    );

    return rows[0] || null;
  },


  // ==========================================
  // CHECK DELIVERY AVAILABILITY
  // Customer can use this
  // ==========================================

  async checkAvailability(value) {

    const searchValue = String(value || '').trim();

    if (!searchValue) {
      return null;
    }

    const [rows] = await pool.query(
      `
      SELECT
        id,
        zone_name,
        pincode,
        place,
        city,
        state,
        delivery_available,
        delivery_fee,
        min_order_amount,
        estimated_minutes,
        min_distance_km,
        max_distance_km
      FROM delivery_zones
      WHERE delivery_available = 1
        AND (
          pincode = ?
          OR LOWER(place) = LOWER(?)
          OR LOWER(zone_name) = LOWER(?)
        )
      ORDER BY created_at DESC
      LIMIT 1
      `,
      [
        searchValue,
        searchValue,
        searchValue
      ]
    );

    return rows[0] || null;
  },


  // ==========================================
  // CREATE DELIVERY ZONE
  // Admin
  // ==========================================

  async create(data) {

    const id = crypto.randomUUID();

    const {
      zone_name = '',
      pincode = '',
      place,
      city = '',
      state = '',
      delivery_available = 1,
      delivery_fee = 0,
      min_order_amount = 0,
      estimated_minutes = 60,
      min_distance_km = 0,
      max_distance_km = 5
    } = data;

    if (!place) {
      throw new Error('Place is required');
    }

    const minDistance = Number(min_distance_km);
    const maxDistance = Number(max_distance_km);

    if (
      Number.isNaN(minDistance) ||
      minDistance < 0
    ) {
      throw new Error(
        'Minimum distance must be 0 or greater'
      );
    }

    if (
      Number.isNaN(maxDistance) ||
      maxDistance <= 0
    ) {
      throw new Error(
        'Maximum distance must be greater than 0'
      );
    }

    if (maxDistance < minDistance) {
      throw new Error(
        'Maximum distance cannot be less than minimum distance'
      );
    }

    await pool.query(
      `
      INSERT INTO delivery_zones
      (
        id,
        zone_name,
        pincode,
        place,
        city,
        state,
        delivery_available,
        delivery_fee,
        min_order_amount,
        estimated_minutes,
        min_distance_km,
        max_distance_km
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        zone_name,
        pincode,
        place,
        city,
        state,
        Number(delivery_available) ? 1 : 0,
        Number(delivery_fee) || 0,
        Number(min_order_amount) || 0,
        Number(estimated_minutes) || 60,
        minDistance,
        maxDistance
      ]
    );

    return this.findById(id);
  },


  // ==========================================
  // UPDATE DELIVERY ZONE
  // Admin
  // ==========================================

  async update(id, data) {

    const existing = await this.findById(id);

    if (!existing) {
      return null;
    }

    const {
      zone_name = existing.zone_name,
      pincode = existing.pincode,
      place = existing.place,
      city = existing.city,
      state = existing.state,
      delivery_available = existing.delivery_available,
      delivery_fee = existing.delivery_fee,
      min_order_amount = existing.min_order_amount,
      estimated_minutes = existing.estimated_minutes,
      min_distance_km = existing.min_distance_km ?? 0,
      max_distance_km = existing.max_distance_km ?? 5
    } = data;

    if (!place) {
      throw new Error('Place is required');
    }

    const minDistance = Number(min_distance_km);
    const maxDistance = Number(max_distance_km);

    if (
      Number.isNaN(minDistance) ||
      minDistance < 0
    ) {
      throw new Error(
        'Minimum distance must be 0 or greater'
      );
    }

    if (
      Number.isNaN(maxDistance) ||
      maxDistance <= 0
    ) {
      throw new Error(
        'Maximum distance must be greater than 0'
      );
    }

    if (maxDistance < minDistance) {
      throw new Error(
        'Maximum distance cannot be less than minimum distance'
      );
    }

    await pool.query(
      `
      UPDATE delivery_zones
      SET
        zone_name = ?,
        pincode = ?,
        place = ?,
        city = ?,
        state = ?,
        delivery_available = ?,
        delivery_fee = ?,
        min_order_amount = ?,
        estimated_minutes = ?,
        min_distance_km = ?,
        max_distance_km = ?
      WHERE id = ?
      `,
      [
        zone_name,
        pincode,
        place,
        city,
        state,
        Number(delivery_available) ? 1 : 0,
        Number(delivery_fee) || 0,
        Number(min_order_amount) || 0,
        Number(estimated_minutes) || 60,
        minDistance,
        maxDistance,
        id
      ]
    );

    return this.findById(id);
  },


  // ==========================================
  // DELETE DELIVERY ZONE
  // Admin
  // ==========================================

  async delete(id) {

    const existing = await this.findById(id);

    if (!existing) {
      return null;
    }

    await pool.query(
      `
      DELETE FROM delivery_zones
      WHERE id = ?
      `,
      [id]
    );

    return existing;
  }

};

module.exports = DeliveryZone;