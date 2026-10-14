-- Live Order Tracking migration
-- OpenStreetMap/Nominatim + delivery-person browser GPS

ALTER TABLE online_orders
  MODIFY COLUMN status ENUM('Pending','Accepted','Packed','Out for Delivery','Delivered','Cancelled') DEFAULT 'Pending';

ALTER TABLE online_orders ADD COLUMN IF NOT EXISTS customer_lat DECIMAL(10,7) NULL AFTER customer_address;
ALTER TABLE online_orders ADD COLUMN IF NOT EXISTS customer_lng DECIMAL(10,7) NULL AFTER customer_lat;
ALTER TABLE online_orders ADD COLUMN IF NOT EXISTS customer_location_updated_at DATETIME NULL AFTER customer_lng;
ALTER TABLE online_orders ADD COLUMN IF NOT EXISTS rider_lat DECIMAL(10,7) NULL AFTER assigned_rider;
ALTER TABLE online_orders ADD COLUMN IF NOT EXISTS rider_lng DECIMAL(10,7) NULL AFTER rider_lat;
ALTER TABLE online_orders ADD COLUMN IF NOT EXISTS rider_accuracy DECIMAL(10,2) NULL AFTER rider_lng;
ALTER TABLE online_orders ADD COLUMN IF NOT EXISTS rider_location_updated_at DATETIME NULL AFTER rider_accuracy;
