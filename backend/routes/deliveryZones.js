const express = require('express');
const router = express.Router();

const DeliveryZone = require('../models/DeliveryZone');
const {
  authenticateToken,
  requireRole
} = require('../middleware/auth');

/*
  CUSTOMER
  Public delivery availability check
*/
router.get('/check/:value', async (req, res) => {
  try {
    let value = req.params.value || '';

    try {
      value = decodeURIComponent(value);
    } catch (decodeError) {
      value = String(value);
    }

    value = String(value).trim();

    if (!value) {
      return res.json({
        available: false,
        message: 'Please enter a valid PIN code or area.'
      });
    }

    const zone = await DeliveryZone.checkAvailability(value);

    if (!zone) {
      return res.json({
        available: false,
        message: 'Delivery is not available for this PIN code or area.'
      });
    }

    /*
      Return delivery zone information to customer.
      This also includes distance range, delivery fee
      and estimated delivery time.
    */
    return res.json({
      available: true,
      message: 'Delivery Available',
      zone: {
        ...zone,
        min_distance_km:
          Number(zone.min_distance_km ?? 0),

        max_distance_km:
          Number(zone.max_distance_km ?? 0),

        delivery_fee:
          Number(zone.delivery_fee ?? 0),

        min_order_amount:
          Number(zone.min_order_amount ?? 0),

        estimated_minutes:
          Number(zone.estimated_minutes ?? 60)
      }
    });

  } catch (err) {
    console.error(
      'Delivery availability check failed:',
      err.message
    );

    return res.status(500).json({
      available: false,
      error: 'Failed to check delivery availability',
      message: err.message
    });
  }
});


/*
  ADMIN
  Get all delivery zones
*/
router.get(
  '/',
  authenticateToken,
  requireRole('Admin'),
  async (req, res) => {
    try {
      const zones = await DeliveryZone.findAll();

      const formattedZones = Array.isArray(zones)
        ? zones.map((zone) => ({
            ...zone,

            min_distance_km:
              Number(zone.min_distance_km ?? 0),

            max_distance_km:
              Number(zone.max_distance_km ?? 0),

            delivery_fee:
              Number(zone.delivery_fee ?? 0),

            min_order_amount:
              Number(zone.min_order_amount ?? 0),

            estimated_minutes:
              Number(zone.estimated_minutes ?? 60)
          }))
        : [];

      return res.json(formattedZones);

    } catch (err) {
      console.error(
        'Failed to fetch delivery zones:',
        err.message
      );

      return res.status(500).json({
        error: 'Failed to fetch delivery zones',
        message: err.message
      });
    }
  }
);


/*
  ADMIN
  Create delivery zone
*/
router.post(
  '/',
  authenticateToken,
  requireRole('Admin'),
  async (req, res) => {
    try {
      const body = req.body || {};

      /*
        Prepare delivery zone data.
        Existing fields are preserved.
        New distance fields are also accepted.
      */
      const zoneData = {
        ...body,

        zone_name:
          body.zone_name?.toString().trim(),

        pincode:
          body.pincode?.toString().trim(),

        place:
          body.place?.toString().trim(),

        city:
          body.city?.toString().trim(),

        state:
          body.state?.toString().trim(),

        delivery_fee:
          Number(body.delivery_fee ?? 0),

        min_order_amount:
          Number(body.min_order_amount ?? 0),

        estimated_minutes:
          Number(body.estimated_minutes ?? 60),

        min_distance_km:
          Number(body.min_distance_km ?? 0),

        max_distance_km:
          Number(body.max_distance_km ?? 5),

        delivery_available:
          body.delivery_available === undefined
            ? true
            : Boolean(body.delivery_available)
      };

      /*
        Basic validation
      */
      if (!zoneData.zone_name) {
        return res.status(400).json({
          error: 'Zone name is required'
        });
      }

      if (!zoneData.pincode) {
        return res.status(400).json({
          error: 'PIN code is required'
        });
      }

      if (!zoneData.place) {
        return res.status(400).json({
          error: 'Place / area is required'
        });
      }

      if (
        Number.isNaN(zoneData.delivery_fee) ||
        zoneData.delivery_fee < 0
      ) {
        return res.status(400).json({
          error: 'Invalid delivery fee'
        });
      }

      if (
        Number.isNaN(zoneData.min_order_amount) ||
        zoneData.min_order_amount < 0
      ) {
        return res.status(400).json({
          error: 'Invalid minimum order amount'
        });
      }

      if (
        Number.isNaN(zoneData.estimated_minutes) ||
        zoneData.estimated_minutes <= 0
      ) {
        return res.status(400).json({
          error: 'Estimated delivery time must be greater than 0'
        });
      }

      if (
        Number.isNaN(zoneData.min_distance_km) ||
        zoneData.min_distance_km < 0
      ) {
        return res.status(400).json({
          error: 'Invalid minimum distance'
        });
      }

      if (
        Number.isNaN(zoneData.max_distance_km) ||
        zoneData.max_distance_km <= 0
      ) {
        return res.status(400).json({
          error: 'Invalid maximum distance'
        });
      }

      if (
        zoneData.max_distance_km <
        zoneData.min_distance_km
      ) {
        return res.status(400).json({
          error:
            'Maximum distance cannot be less than minimum distance'
        });
      }

      const zone =
        await DeliveryZone.create(zoneData);

      return res.status(201).json(zone);

    } catch (err) {
      console.error(
        'Failed to create delivery zone:',
        err.message
      );

      return res.status(400).json({
        error: 'Failed to create delivery zone',
        message: err.message
      });
    }
  }
);


/*
  ADMIN
  Update delivery zone
*/
router.put(
  '/:id',
  authenticateToken,
  requireRole('Admin'),
  async (req, res) => {
    try {
      const body = req.body || {};

      /*
        Prepare updated zone data.
      */
      const zoneData = {
        ...body,

        zone_name:
          body.zone_name !== undefined
            ? body.zone_name.toString().trim()
            : undefined,

        pincode:
          body.pincode !== undefined
            ? body.pincode.toString().trim()
            : undefined,

        place:
          body.place !== undefined
            ? body.place.toString().trim()
            : undefined,

        city:
          body.city !== undefined
            ? body.city.toString().trim()
            : undefined,

        state:
          body.state !== undefined
            ? body.state.toString().trim()
            : undefined,

        delivery_fee:
          body.delivery_fee !== undefined
            ? Number(body.delivery_fee)
            : undefined,

        min_order_amount:
          body.min_order_amount !== undefined
            ? Number(body.min_order_amount)
            : undefined,

        estimated_minutes:
          body.estimated_minutes !== undefined
            ? Number(body.estimated_minutes)
            : undefined,

        min_distance_km:
          body.min_distance_km !== undefined
            ? Number(body.min_distance_km)
            : undefined,

        max_distance_km:
          body.max_distance_km !== undefined
            ? Number(body.max_distance_km)
            : undefined
      };

      /*
        Validate only values which are supplied.
      */
      if (
        zoneData.delivery_fee !== undefined &&
        (
          Number.isNaN(zoneData.delivery_fee) ||
          zoneData.delivery_fee < 0
        )
      ) {
        return res.status(400).json({
          error: 'Invalid delivery fee'
        });
      }

      if (
        zoneData.min_order_amount !== undefined &&
        (
          Number.isNaN(zoneData.min_order_amount) ||
          zoneData.min_order_amount < 0
        )
      ) {
        return res.status(400).json({
          error: 'Invalid minimum order amount'
        });
      }

      if (
        zoneData.estimated_minutes !== undefined &&
        (
          Number.isNaN(zoneData.estimated_minutes) ||
          zoneData.estimated_minutes <= 0
        )
      ) {
        return res.status(400).json({
          error:
            'Estimated delivery time must be greater than 0'
        });
      }

      if (
        zoneData.min_distance_km !== undefined &&
        (
          Number.isNaN(zoneData.min_distance_km) ||
          zoneData.min_distance_km < 0
        )
      ) {
        return res.status(400).json({
          error: 'Invalid minimum distance'
        });
      }

      if (
        zoneData.max_distance_km !== undefined &&
        (
          Number.isNaN(zoneData.max_distance_km) ||
          zoneData.max_distance_km <= 0
        )
      ) {
        return res.status(400).json({
          error: 'Invalid maximum distance'
        });
      }

      if (
        zoneData.min_distance_km !== undefined &&
        zoneData.max_distance_km !== undefined &&
        zoneData.max_distance_km <
          zoneData.min_distance_km
      ) {
        return res.status(400).json({
          error:
            'Maximum distance cannot be less than minimum distance'
        });
      }

      const zone =
        await DeliveryZone.update(
          req.params.id,
          zoneData
        );

      if (!zone) {
        return res.status(404).json({
          error: 'Delivery zone not found'
        });
      }

      return res.json(zone);

    } catch (err) {
      console.error(
        'Failed to update delivery zone:',
        err.message
      );

      return res.status(400).json({
        error: 'Failed to update delivery zone',
        message: err.message
      });
    }
  }
);


/*
  ADMIN
  Delete delivery zone
*/
router.delete(
  '/:id',
  authenticateToken,
  requireRole('Admin'),
  async (req, res) => {
    try {
      const zone =
        await DeliveryZone.delete(
          req.params.id
        );

      if (!zone) {
        return res.status(404).json({
          error: 'Delivery zone not found'
        });
      }

      return res.json({
        success: true,
        message:
          'Delivery zone deleted successfully',
        data: zone
      });

    } catch (err) {
      console.error(
        'Failed to delete delivery zone:',
        err.message
      );

      return res.status(400).json({
        success: false,
        error:
          'Failed to delete delivery zone',
        message: err.message
      });
    }
  }
);


module.exports = router;