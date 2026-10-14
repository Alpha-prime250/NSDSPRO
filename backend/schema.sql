-- ================================================================
-- Single Vendor Retail & Grocery POS Database Schema
-- Database: single_vendor_pos
-- ================================================================

CREATE DATABASE IF NOT EXISTS `single_vendor_pos`
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `single_vendor_pos`;

-- 1. Shop Settings
CREATE TABLE IF NOT EXISTS `settings` (
  `id` TINYINT NOT NULL DEFAULT 1 PRIMARY KEY,
  `shop_name` VARCHAR(150) NOT NULL DEFAULT 'Super Grocery Store',
  `owner_name` VARCHAR(120) DEFAULT 'Store Manager',
  `phone` VARCHAR(30) DEFAULT '+91 98765 43210',
  `address` TEXT,
  `gst_number` VARCHAR(50) DEFAULT '',
  `currency_symbol` VARCHAR(8) DEFAULT '₹',
  `default_tax_percent` DECIMAL(5,2) DEFAULT 0.00,
  `low_stock_threshold` INT DEFAULT 10,
  `upi_id` VARCHAR(120) DEFAULT '',

  -- Thermal Printer Settings
  `thermal_printer_size` VARCHAR(10) DEFAULT '80mm',
  `auto_print_receipt` TINYINT(1) DEFAULT 1,
  `receipt_header_note` VARCHAR(255) DEFAULT 'TAX INVOICE / CASH MEMO',
  `receipt_footer_note` TEXT,
  `show_upi_qr_on_receipt` TINYINT(1) DEFAULT 1,
  `show_barcode_on_receipt` TINYINT(1) DEFAULT 1,

  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default settings row if not exists
INSERT INTO `settings` (
  `id`,
  `shop_name`,
  `owner_name`,
  `phone`,
  `address`,
  `currency_symbol`,
  `default_tax_percent`,
  `low_stock_threshold`
)
SELECT
  1,
  'Super Grocery Store',
  'Store Manager',
  '+91 98765 43210',
  'Main Market Road, City Center',
  '₹',
  0.00,
  10
WHERE NOT EXISTS (
  SELECT 1 FROM `settings` WHERE `id` = 1
);

-- 2. Suppliers
CREATE TABLE IF NOT EXISTS `suppliers` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `company_name` VARCHAR(150) DEFAULT '',
  `phone` VARCHAR(30) DEFAULT '',
  `email` VARCHAR(160) DEFAULT '',
  `address` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Customers
CREATE TABLE IF NOT EXISTS `customers` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(150) NOT NULL,
  `phone` VARCHAR(30) DEFAULT '',
  `email` VARCHAR(160) DEFAULT '',
  `address` TEXT,
  `outstanding_dues` DECIMAL(12,2) DEFAULT 0.00,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Products
CREATE TABLE IF NOT EXISTS `products` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `name` VARCHAR(180) NOT NULL,
  `category` VARCHAR(100) DEFAULT 'General',
  `barcode` VARCHAR(100) UNIQUE,
  `purchase_price` DECIMAL(12,2) DEFAULT 0.00,
  `selling_price` DECIMAL(12,2) NOT NULL,
  `quantity` DECIMAL(12,3) NOT NULL DEFAULT 0.000,
  `min_stock_level` DECIMAL(12,3) DEFAULT 5.000,
  `supplier_id` VARCHAR(36) NULL,
  `supplier_name` VARCHAR(150) DEFAULT '',
  `mfg_date` DATE NULL,
  `expiry_date` DATE NULL,
  `unit` VARCHAR(20) DEFAULT 'pcs',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_barcode` (`barcode`),
  INDEX `idx_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Sales Invoices
CREATE TABLE IF NOT EXISTS `sales` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `invoice_number` VARCHAR(50) NOT NULL UNIQUE,
  `customer_id` VARCHAR(36) NULL,
  `customer_name` VARCHAR(150) DEFAULT 'Walk-in Customer',
  `payment_mode` ENUM('Cash', 'UPI', 'Card', 'Credit') DEFAULT 'Cash',
  `subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `tax_percent` DECIMAL(5,2) DEFAULT 0.00,
  `tax_amount` DECIMAL(12,2) DEFAULT 0.00,
  `discount_amount` DECIMAL(12,2) DEFAULT 0.00,
  `total_amount` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `received_amount` DECIMAL(12,2) DEFAULT 0.00,
  `change_amount` DECIMAL(12,2) DEFAULT 0.00,
  `status` ENUM('Completed', 'Cancelled', 'Refunded') DEFAULT 'Completed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Sale Items (Line items for each sale)
CREATE TABLE IF NOT EXISTS `sale_items` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `sale_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(36) NOT NULL,
  `product_name` VARCHAR(180) NOT NULL,
  `barcode` VARCHAR(100) DEFAULT '',
  `unit_purchase_price` DECIMAL(12,2) DEFAULT 0.00,
  `unit_selling_price` DECIMAL(12,2) NOT NULL,
  `quantity` DECIMAL(12,3) NOT NULL,
  `total_price` DECIMAL(12,2) NOT NULL,
  INDEX `idx_sale_id` (`sale_id`),
  CONSTRAINT `fk_sale_items_sale`
    FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Expenses
CREATE TABLE IF NOT EXISTS `expenses` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `title` VARCHAR(180) NOT NULL,
  `category` VARCHAR(80) DEFAULT 'General',
  `amount` DECIMAL(12,2) NOT NULL,
  `expense_date` DATE NOT NULL,
  `payment_mode` VARCHAR(30) DEFAULT 'Cash',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_expense_date` (`expense_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Stock Movements (Audit Trail)
CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id` VARCHAR(36) NOT NULL PRIMARY KEY,
  `product_id` VARCHAR(36) NOT NULL,
  `product_name` VARCHAR(180) NOT NULL,
  `movement_type` ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
  `quantity` DECIMAL(12,3) NOT NULL,
  `reference` VARCHAR(100) DEFAULT '',
  `notes` TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
