# Live Order Tracking – OpenStreetMap

This project now supports live delivery-person GPS tracking without replacing the existing order flow.

## How it works

1. Customer places an order with the existing delivery address.
2. Backend attempts to geocode that address through OpenStreetMap Nominatim and stores latitude/longitude.
3. Admin/staff opens **Online Orders** and accepts the order.
4. On the delivery person's mobile browser, click **Start Delivery & Share GPS**.
5. Browser GPS is sent to the backend while the page remains open.
6. Customer's **Track Your Grocery Order** page refreshes the rider position every 5 seconds.
7. The map uses OpenStreetMap tiles and shows the delivery address and rider position.

## Database migration

The normal migration file is:

`backend/migrate.js`

Run from the backend folder:

```bash
node migrate.js
```

A standalone SQL migration is also included at:

`backend/migrations/order_tracking.sql`

## Important

- Browser location permission must be allowed on the rider device.
- For production, browser GPS generally requires HTTPS (localhost is allowed for local development).
- Live tracking stops when the rider closes the tracking page/browser or the browser suspends location updates.
- OpenStreetMap is the map provider. Nominatim is used only to convert the customer's text address to coordinates.
- The existing order status, stock, billing, customer login, and storefront flows were preserved.
