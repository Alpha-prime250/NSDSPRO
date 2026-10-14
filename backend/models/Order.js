const pool = require('../db');
const crypto = require('crypto');
const AuditLog = require('./AuditLog');
const Setting = require('./Setting');

// =====================================================
// GEOCODE CUSTOMER ADDRESS USING OPENSTREETMAP
// =====================================================

async function geocodeSingleAddress(address) {
  if (!address || typeof fetch !== 'function') {
    return null;
  }

  const userAgent =
    process.env.NOMINATIM_USER_AGENT ||
    'SingleVendorPOS-OrderTracking/1.0';

  const url =
    'https://nominatim.openstreetmap.org/search?' +
    new URLSearchParams({
      q: address,
      format: 'jsonv2',
      limit: '1',
      countrycodes: 'in',
      addressdetails: '1'
    }).toString();

  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 8000);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': userAgent
      },
      signal: controller.signal
    });

    if (!response.ok) {
      return null;
    }

    const results = await response.json();

    if (!Array.isArray(results) || !results[0]) {
      return null;
    }

    const lat = Number(results[0].lat);
    const lng = Number(results[0].lon);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng)
    ) {
      return null;
    }

    return {
      lat,
      lng,
      display_name: results[0].display_name || address
    };

  } catch (error) {

    console.warn(
      '[Tracking] Geocoding attempt failed:',
      address,
      error.message
    );

    return null;

  } finally {

    clearTimeout(timeout);
  }
}


// =====================================================
// SMART ADDRESS GEOCODING
// =====================================================

async function geocodeAddress(address) {

  if (!address || typeof address !== 'string') {
    return null;
  }

  const cleanAddress =
    address
      .replace(/\s+/g, ' ')
      .trim();

  if (!cleanAddress) {
    return null;
  }

  // Remove duplicate India/Maharashtra words before building queries
  const baseAddress =
    cleanAddress
      .replace(/,\s*India\s*$/i, '')
      .replace(/,\s*Maharashtra\s*$/i, '')
      .trim();

  // ===================================================
  // MULTIPLE SEARCH QUERIES
  // ===================================================

  const queries = [];

  // 1. Original address
  queries.push(
    `${baseAddress}, Maharashtra, India`
  );

  // 2. Niphad specific
  if (
    /niphad/i.test(baseAddress)
  ) {
    queries.push(
      `${baseAddress}, Niphad, Nashik, Maharashtra, India`
    );
  } else {
    queries.push(
      `${baseAddress}, Maharashtra, India`
    );
  }

  // 3. Nashik fallback
  queries.push(
    `${baseAddress}, Nashik, Maharashtra, India`
  );

  // 4. India fallback
  queries.push(
    `${baseAddress}, India`
  );

  // Remove duplicate queries
  const uniqueQueries =
    [...new Set(queries)];

  for (
    const query of uniqueQueries
  ) {

    const result =
      await geocodeSingleAddress(
        query
      );

    if (result) {

      console.log(
        '[Tracking] Address geocoded:',
        {
          searched: query,
          latitude: result.lat,
          longitude: result.lng,
          display_name: result.display_name
        }
      );

      return {
        lat: result.lat,
        lng: result.lng
      };
    }
  }

  console.warn(
    '[Tracking] Unable to geocode address:',
    cleanAddress
  );

  return null;
}


// =====================================================
// ORDER MODEL
// =====================================================

class Order {

  // =====================================================
  // GET ALL ORDERS
  // =====================================================

  static async findAll({ status = '' } = {}) {

    let query =
      'SELECT * FROM online_orders';

    const params = [];

    if (
      status &&
      status !== 'All'
    ) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query +=
      ' ORDER BY created_at DESC';

    const [rows] =
      await pool.query(
        query,
        params
      );

    return rows.map(r => ({

      ...r,

      items:
        typeof r.items_json === 'string'
          ? JSON.parse(r.items_json)
          : r.items_json

    }));
  }


  // =====================================================
  // GET ORDER BY ID / ORDER NUMBER
  // =====================================================

  static async findById(
    id,
    conn = pool
  ) {

    const [rows] =
      await conn.query(
        `SELECT *
         FROM online_orders
         WHERE id = ?
            OR order_number = ?
         LIMIT 1`,
        [id, id]
      );

    if (
      rows.length === 0
    ) {
      return null;
    }

    const order =
      rows[0];

    order.items =
      typeof order.items_json === 'string'
        ? JSON.parse(order.items_json)
        : order.items_json;

    return order;
  }


  // =====================================================
  // FIND ORDER BY PHONE / ORDER NUMBER
  // =====================================================

  static async findByCustomer(
    query
  ) {

    const cleanQuery =
      String(query || '').trim();

    const [rows] =
      await pool.query(
        `SELECT *
         FROM online_orders
         WHERE customer_phone = ?
            OR order_number = ?
         ORDER BY created_at DESC`,
        [
          cleanQuery,
          cleanQuery
        ]
      );

    return rows.map(r => ({

      ...r,

      items:
        typeof r.items_json === 'string'
          ? JSON.parse(r.items_json)
          : r.items_json

    }));
  }


  // =====================================================
  // GET LOGGED-IN CUSTOMER'S ORDERS
  // =====================================================

  static async findByCustomerId(
    customerId
  ) {

    const [rows] =
      await pool.query(
        `SELECT *
         FROM online_orders
         WHERE customer_id = ?
         ORDER BY created_at DESC`,
        [customerId]
      );

    return rows.map(r => ({

      ...r,

      items:
        typeof r.items_json === 'string'
          ? JSON.parse(r.items_json)
          : r.items_json

    }));
  }


  // =====================================================
  // CREATE ONLINE ORDER
  // =====================================================

  static async create(
    orderData
  ) {

    const {

      customer_id = null,

      customer_name,

      customer_phone,

      customer_address,

      items = [],

      payment_method =
        'Cash on Delivery',

      notes = ''

    } = orderData;


    // ===================================================
    // BASIC CUSTOMER VALIDATION
    // ===================================================

    if (
      !customer_name ||
      !customer_phone ||
      !customer_address
    ) {

      throw new Error(
        'Customer name, phone, and address are required'
      );
    }


    // ===================================================
    // CUSTOMER ID FIX
    // ===================================================

    let finalCustomerId =
      customer_id || null;


    if (!finalCustomerId) {

      try {

        const [customerRows] =
          await pool.query(
            `SELECT id
             FROM customers
             WHERE phone = ?
             LIMIT 1`,
            [customer_phone]
          );

        if (
          customerRows.length > 0
        ) {

          finalCustomerId =
            customerRows[0].id;

        }

      } catch (customerLookupError) {

        console.warn(
          '[Order] Customer ID lookup skipped:',
          customerLookupError.message
        );

      }
    }


    // ===================================================
    // LOG CUSTOMER LINK
    // ===================================================

    console.log(
      '[Order] Customer link:',
      {
        phone: customer_phone,
        customer_id: finalCustomerId
      }
    );


    // ===================================================
    // VALIDATE ITEMS
    // ===================================================

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {

      throw new Error(
        'Order must contain at least one item'
      );
    }


    // ===================================================
    // VALIDATE PRODUCT IDs
    // ===================================================

    const productIds =
      items
        .map(
          it => it.product_id
        )
        .filter(Boolean);


    if (
      productIds.length === 0
    ) {

      throw new Error(
        'Order items do not contain valid product IDs'
      );
    }


    const placeholders =
      productIds
        .map(() => '?')
        .join(',');


    // ===================================================
    // GET PRODUCTS FROM DATABASE
    // ===================================================

    const [dbProducts] =
      await pool.query(
        `SELECT
          id,
          name,
          category,
          barcode,
          selling_price,
          quantity,
          unit
         FROM products
         WHERE id IN (${placeholders})`,
        productIds
      );


    const productMap =
      new Map(
        dbProducts.map(
          p => [p.id, p]
        )
      );


    // ===================================================
    // VERIFY ITEMS / PRICE / QUANTITY
    // ===================================================

    let calculatedSubtotal = 0;

    const verifiedItems = [];


    for (
      const item of items
    ) {

      const dbProd =
        productMap.get(
          item.product_id
        );


      if (!dbProd) {

        throw new Error(
          `Item ${
            item.name ||
            item.product_id
          } is no longer available in store`
        );
      }


      const qty =
        Number(
          item.quantity
        );


      if (
        !qty ||
        qty <= 0
      ) {

        throw new Error(
          `Invalid quantity for item ${dbProd.name}`
        );
      }


      const unitPrice =
        Number(
          dbProd.selling_price
        );


      const lineTotal =
        Number(
          (
            qty *
            unitPrice
          ).toFixed(2)
        );


      calculatedSubtotal +=
        lineTotal;


      verifiedItems.push({

        product_id:
          dbProd.id,

        name:
          dbProd.name,

        category:
          dbProd.category,

        barcode:
          dbProd.barcode,

        selling_price:
          unitPrice,

        unit:
          dbProd.unit ||
          'pcs',

        quantity:
          qty,

        line_total:
          lineTotal

      });
    }


    // ===================================================
    // DELIVERY FEE
    // ===================================================

    const deliveryFee =
      calculatedSubtotal >= 499 ||
      calculatedSubtotal === 0
        ? 0
        : 40;


    const grandTotal =
      Number(
        (
          calculatedSubtotal +
          deliveryFee
        ).toFixed(2)
      );


    // ===================================================
    // CREATE ORDER ID
    // ===================================================

    const id =
      crypto.randomUUID();


    const order_number =
      `WEB-${Math.floor(
        100000 +
        Math.random() *
        900000
      )}`;


    // ===================================================
    // INSERT ONLINE ORDER
    // ===================================================

    await pool.query(

      `INSERT INTO online_orders
       (
         id,
         customer_id,
         order_number,
         customer_name,
         customer_phone,
         customer_address,
         items_json,
         total_amount,
         payment_method,
         status,
         notes
       )
       VALUES
       (
         ?,
         ?,
         ?,
         ?,
         ?,
         ?,
         ?,
         ?,
         ?,
         'Pending',
         ?
       )`,

      [

        id,

        finalCustomerId,

        order_number,

        customer_name,

        customer_phone,

        customer_address,

        JSON.stringify(
          verifiedItems
        ),

        grandTotal,

        payment_method,

        notes

      ]
    );


    // ===================================================
    // GEOCODE CUSTOMER ADDRESS
    // ===================================================

    const customerLocation =
      await geocodeAddress(
        customer_address
      );


    if (
      customerLocation
    ) {

      await pool.query(

        `UPDATE online_orders
         SET
           customer_lat = ?,
           customer_lng = ?,
           customer_location_updated_at =
             CURRENT_TIMESTAMP
         WHERE id = ?`,

        [
          customerLocation.lat,
          customerLocation.lng,
          id
        ]
      );

      console.log(
        '[Tracking] Customer location saved:',
        {
          order_number,
          lat: customerLocation.lat,
          lng: customerLocation.lng
        }
      );

    } else {

      console.warn(
        '[Tracking] Customer location could not be saved for:',
        order_number
      );

    }


    // ===================================================
    // RETURN CREATED ORDER
    // ===================================================

    return this.findById(
      id
    );
  }


  // =====================================================
  // ORDER TRACKING
  // =====================================================

  static async getTracking(
    query
  ) {

    const cleanQuery =
      String(
        query || ''
      ).trim();


    if (!cleanQuery) {
      return null;
    }


    // ===================================================
    // FIND ORDER
    // ===================================================

    const [rows] =
      await pool.query(

        `SELECT
          id,
          customer_id,
          order_number,
          customer_name,
          customer_phone,
          customer_address,
          status,
          assigned_rider,

          customer_lat,
          customer_lng,
          customer_location_updated_at,

          rider_lat,
          rider_lng,
          rider_accuracy,
          rider_location_updated_at,

          created_at

         FROM online_orders

         WHERE
           id = ?
           OR order_number = ?
           OR customer_phone = ?

         ORDER BY created_at DESC

         LIMIT 1`,

        [
          cleanQuery,
          cleanQuery,
          cleanQuery
        ]
      );


    const order =
      rows[0] ||
      null;


    if (!order) {
      return null;
    }


    // ===================================================
    // GEOCODE CUSTOMER ADDRESS IF COORDINATES MISSING
    // ===================================================

    if (
      (
        order.customer_lat == null ||
        order.customer_lng == null
      ) &&
      order.customer_address
    ) {

      console.log(
        '[Tracking] Customer coordinates missing. Geocoding:',
        order.customer_address
      );


      const location =
        await geocodeAddress(
          order.customer_address
        );


      if (
        location
      ) {

        await pool.query(

          `UPDATE online_orders
           SET
             customer_lat = ?,
             customer_lng = ?,
             customer_location_updated_at =
               CURRENT_TIMESTAMP
           WHERE id = ?`,

          [
            location.lat,
            location.lng,
            order.id
          ]
        );


        order.customer_lat =
          location.lat;

        order.customer_lng =
          location.lng;

        order.customer_location_updated_at =
          new Date();


        console.log(
          '[Tracking] Coordinates updated successfully:',
          {
            order_number: order.order_number,
            lat: location.lat,
            lng: location.lng
          }
        );

      } else {

        console.warn(
          '[Tracking] Customer address could not be converted to coordinates:',
          order.customer_address
        );

      }
    }


    return order;
  }


  // =====================================================
  // UPDATE RIDER GPS LOCATION
  // =====================================================

  static async updateRiderLocation(
    id,
    {
      lat,
      lng,
      accuracy,
      riderName
    }
  ) {

    const latitude =
      Number(lat);

    const longitude =
      Number(lng);

    const gpsAccuracy =
      accuracy == null
        ? null
        : Number(accuracy);


    // ===================================================
    // VALIDATE GPS VALUES
    // ===================================================

    if (
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {

      throw new Error(
        'Valid rider latitude and longitude are required'
      );
    }


    if (
      gpsAccuracy !== null &&
      (
        !Number.isFinite(gpsAccuracy) ||
        gpsAccuracy < 0
      )
    ) {

      throw new Error(
        'Invalid GPS accuracy'
      );
    }


    // ===================================================
    // UPDATE RIDER LOCATION
    // ===================================================

    const [result] =
      await pool.query(

        `UPDATE online_orders

         SET
           rider_lat = ?,
           rider_lng = ?,
           rider_accuracy = ?,
           rider_location_updated_at =
             CURRENT_TIMESTAMP,

           assigned_rider =
             COALESCE(
               ?,
               assigned_rider
             ),

           status =
             CASE

               WHEN status IN
                 ('Pending', 'Accepted', 'Packed')

               THEN
                 'Out for Delivery'

               ELSE
                 status

             END

         WHERE id = ?`,

        [
          latitude,
          longitude,
          gpsAccuracy,
          riderName || null,
          id
        ]
      );


    if (
      !result.affectedRows
    ) {

      return null;
    }


    console.log(
      '[Tracking] Rider GPS updated:',
      {
        order_id: id,
        lat: latitude,
        lng: longitude,
        accuracy: gpsAccuracy
      }
    );


    return this.findById(
      id
    );
  }


  // =====================================================
  // UPDATE ORDER STATUS
  // =====================================================

  static async updateStatus(
    id,
    newStatus,
    staffUser = null
  ) {

    const connection =
      await pool.getConnection();


    try {

      await connection.beginTransaction();


      // =================================================
      // GET ORDER
      // =================================================

      const [orderRows] =
        await connection.query(

          `SELECT *
           FROM online_orders
           WHERE id = ?
           FOR UPDATE`,

          [id]
        );


      if (
        orderRows.length === 0
      ) {

        throw new Error(
          'Order not found'
        );
      }


      const order =
        orderRows[0];


      const previousStatus =
        order.status;


      const items =
        typeof order.items_json === 'string'
          ? JSON.parse(
              order.items_json
            )
          : order.items_json;


      // =================================================
      // RULE A:
      // PENDING -> ACCEPTED / PACKED / OUT FOR DELIVERY
      // RESERVE STOCK
      // =================================================

      if (

        previousStatus ===
          'Pending' &&

        (
          newStatus ===
            'Accepted' ||

          newStatus ===
            'Packed' ||

          newStatus ===
            'Out for Delivery'
        )

      ) {

        for (
          const item of items
        ) {

          const [prodRows] =
            await connection.query(

              `SELECT quantity
               FROM products
               WHERE id = ?
               FOR UPDATE`,

              [
                item.product_id
              ]
            );


          if (
            prodRows.length > 0
          ) {

            const currentStock =
              prodRows[0]
                .quantity;


            const newStock =
              Math.max(
                0,
                currentStock -
                  item.quantity
              );


            await connection.query(

              `UPDATE products
               SET quantity = ?
               WHERE id = ?`,

              [
                newStock,
                item.product_id
              ]
            );


            await connection.query(

              `INSERT INTO stock_movements
               (
                 id,
                 product_id,
                 movement_type,
                 quantity,
                 previous_quantity,
                 new_quantity,
                 note
               )
               VALUES
               (?, ?, ?, ?, ?, ?, ?)`,

              [

                crypto.randomUUID(),

                item.product_id,

                'SALE',

                -item.quantity,

                currentStock,

                newStock,

                `Stock reserved for Web Order ${order.order_number}`

              ]
            );
          }
        }
      }


      // =================================================
      // RULE B:
      // CANCELLED -> RELEASE STOCK
      // =================================================

      if (

        (
          previousStatus ===
            'Accepted' ||

          previousStatus ===
            'Packed' ||

          previousStatus ===
            'Out for Delivery'
        ) &&

        newStatus ===
          'Cancelled'

      ) {

        for (
          const item of items
        ) {

          const [prodRows] =
            await connection.query(

              `SELECT quantity
               FROM products
               WHERE id = ?
               FOR UPDATE`,

              [
                item.product_id
              ]
            );


          if (
            prodRows.length > 0
          ) {

            const currentStock =
              prodRows[0]
                .quantity;


            const newStock =
              currentStock +
              item.quantity;


            await connection.query(

              `UPDATE products
               SET quantity = ?
               WHERE id = ?`,

              [
                newStock,
                item.product_id
              ]
            );


            await connection.query(

              `INSERT INTO stock_movements
               (
                 id,
                 product_id,
                 movement_type,
                 quantity,
                 previous_quantity,
                 new_quantity,
                 note
               )
               VALUES
               (?, ?, ?, ?, ?, ?, ?)`,

              [

                crypto.randomUUID(),

                item.product_id,

                'IN',

                item.quantity,

                currentStock,

                newStock,

                `Stock released from cancelled Web Order ${order.order_number}`

              ]
            );
          }
        }
      }


      // =================================================
      // RULE C:
      // DELIVERED -> CREATE SALE
      // =================================================

      let saleId =
        order.sale_id;


      if (

        newStatus ===
          'Delivered' &&

        !saleId

      ) {

        saleId =
          crypto.randomUUID();


        const datePart =
          new Date()
            .toISOString()
            .slice(
              0,
              10
            )
            .replace(
              /-/g,
              ''
            );


        const [countResult] =
          await connection.query(

            `SELECT COUNT(*) as cnt
             FROM sales
             WHERE DATE(created_at) =
                   CURRENT_DATE`
          );


        const invoiceSeq =
          String(
            countResult[0].cnt +
            1
          ).padStart(
            4,
            '0'
          );


        const invoice_number =
          `INV-${datePart}-${invoiceSeq}`;


        await connection.query(

          `INSERT INTO sales
           (
             id,
             invoice_number,
             customer_name,
             customer_phone,
             cashier_name,
             payment_mode,
             subtotal,
             tax_amount,
             total_amount,
             received_amount,
             change_amount,
             status
           )
           VALUES
           (
             ?,
             ?,
             ?,
             ?,
             'Online Storefront',
             ?,
             ?,
             0,
             ?,
             ?,
             0,
             'Completed'
           )`,

          [

            saleId,

            invoice_number,

            order.customer_name,

            order.customer_phone,

            order.payment_method,

            order.total_amount,

            order.total_amount,

            order.total_amount

          ]
        );


        for (
          const item of items
        ) {

          await connection.query(

            `INSERT INTO sale_items
             (
               id,
               sale_id,
               product_id,
               product_name,
               barcode,
               unit_purchase_price,
               unit_selling_price,
               quantity,
               total_price
             )
             VALUES
             (?, ?, ?, ?, ?, 0, ?, ?, ?)`,

            [

              crypto.randomUUID(),

              saleId,

              item.product_id,

              item.name,

              item.barcode || '',

              item.selling_price,

              item.quantity,

              item.line_total ||
                (
                  item.selling_price *
                  item.quantity
                )

            ]
          );
        }


        await connection.query(

          `UPDATE online_orders

           SET
             sale_id = ?,
             delivered_at =
               CURRENT_TIMESTAMP

           WHERE id = ?`,

          [
            saleId,
            id
          ]
        );
      }


      // =================================================
      // UPDATE STATUS
      // =================================================

      await connection.query(

        `UPDATE online_orders
         SET status = ?
         WHERE id = ?`,

        [
          newStatus,
          id
        ]
      );


      // =================================================
      // AUDIT LOG
      // =================================================

      await AuditLog.log({

        userId:
          staffUser?.id,

        userName:
          staffUser?.name ||
          'Staff',

        action:
          'ORDER_STATUS_UPDATED',

        entityType:
          'OnlineOrder',

        entityId:
          id,

        details: {

          order_number:
            order.order_number,

          from_status:
            previousStatus,

          to_status:
            newStatus

        }

      });


      await connection.commit();


      return await this.findById(
        id,
        connection
      );

    } catch (err) {

      await connection.rollback();

      throw err;

    } finally {

      connection.release();
    }
  }
}


module.exports = Order;