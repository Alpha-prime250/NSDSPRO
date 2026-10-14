-- Single Vendor Grocery POS Database Backup
-- Generated: 2026-09-11T07:42:27.892Z

SET FOREIGN_KEY_CHECKS=0;

-- Table structure for audit_logs
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `user_name` varchar(100) DEFAULT 'System',
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `entity_id` varchar(100) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_entity` (`entity_type`,`entity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for cash_shifts
DROP TABLE IF EXISTS `cash_shifts`;
CREATE TABLE `cash_shifts` (
  `id` varchar(36) NOT NULL,
  `user_name` varchar(120) NOT NULL,
  `opening_cash` decimal(12,2) NOT NULL DEFAULT 0.00,
  `closing_cash` decimal(12,2) DEFAULT NULL,
  `expected_cash` decimal(12,2) DEFAULT NULL,
  `difference` decimal(12,2) DEFAULT NULL,
  `status` enum('Open','Closed') DEFAULT 'Open',
  `opened_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `closed_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for cash_shifts (1 rows)
INSERT INTO `cash_shifts` (`id`, `user_name`, `opening_cash`, `closing_cash`, `expected_cash`, `difference`, `status`, `opened_at`, `closed_at`) VALUES ('b062fe38-c05c-4adb-a218-90edd5d97061', 'Store Admin', '1000.00', '1000.00', '1000.00', '0.00', 'Closed', '2026-09-10 19:57:49', '2026-09-10 19:58:35');

-- Table structure for customer_ledger
DROP TABLE IF EXISTS `customer_ledger`;
CREATE TABLE `customer_ledger` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) NOT NULL,
  `transaction_type` enum('SALE_DEBIT','PAYMENT_CREDIT','RETURN_CREDIT') NOT NULL,
  `reference_id` varchar(36) DEFAULT NULL,
  `reference_number` varchar(50) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `balance_after` decimal(12,2) NOT NULL,
  `payment_mode` varchar(50) DEFAULT 'Cash',
  `notes` varchar(255) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT 'Admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for customers
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` char(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(30) NOT NULL DEFAULT '',
  `email` varchar(160) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `outstanding_dues` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_customers_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for customers (4 rows)
INSERT INTO `customers` (`id`, `name`, `phone`, `email`, `address`, `outstanding_dues`, `created_at`) VALUES ('9d17bd09-e512-43cd-ada3-5790797a05c0', 'Sunita Verma', '9823456789', NULL, NULL, '250.00', '2026-09-10 19:26:18');
INSERT INTO `customers` (`id`, `name`, `phone`, `email`, `address`, `outstanding_dues`, `created_at`) VALUES ('ae1e5551-ca31-4bb1-9567-a788215c4df6', 'Ramesh Sharma', '9876543210', NULL, NULL, '0.00', '2026-09-10 19:26:18');
INSERT INTO `customers` (`id`, `name`, `phone`, `email`, `address`, `outstanding_dues`, `created_at`) VALUES ('b9244a3f-d542-46a9-abb6-1056759618e1', 'Anil Gupta', '9811223344', NULL, NULL, '0.00', '2026-09-10 19:26:18');
INSERT INTO `customers` (`id`, `name`, `phone`, `email`, `address`, `outstanding_dues`, `created_at`) VALUES ('d59f35d3-e9c4-49f0-8056-7c3eaf40b08c', 'AssaultBaaz Gaming', '08340450922', '', 'ULAO WARD NO 03, NORTH OF SUDHANSHU COLD STORAGE ROAD NO 02', '1000.00', '2026-09-10 20:38:42');

-- Table structure for expenses
DROP TABLE IF EXISTS `expenses`;
CREATE TABLE `expenses` (
  `id` char(36) NOT NULL,
  `title` varchar(180) NOT NULL,
  `category` varchar(80) NOT NULL DEFAULT 'Miscellaneous',
  `amount` decimal(12,2) NOT NULL,
  `expense_date` date NOT NULL,
  `payment_mode` varchar(30) NOT NULL DEFAULT 'Cash',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for online_orders
DROP TABLE IF EXISTS `online_orders`;
CREATE TABLE `online_orders` (
  `id` varchar(36) NOT NULL,
  `order_number` varchar(50) NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `customer_phone` varchar(30) NOT NULL,
  `customer_address` text NOT NULL,
  `items_json` text NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(40) DEFAULT 'Cash on Delivery',
  `status` enum('Pending','Accepted','Delivered','Cancelled') DEFAULT 'Pending',
  `assigned_rider` varchar(100) DEFAULT NULL,
  `packed_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `sale_id` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for online_orders (2 rows)
INSERT INTO `online_orders` (`id`, `order_number`, `customer_name`, `customer_phone`, `customer_address`, `items_json`, `total_amount`, `payment_method`, `status`, `assigned_rider`, `packed_at`, `delivered_at`, `sale_id`, `notes`, `created_at`) VALUES ('43f796ea-eba7-41de-bfd8-f54dde7261a9', 'WEB-433633', 'AssaultBaaz Gaming', '08340450922', 'ULAO WARD NO 03, NORTH OF SUDHANSHU COLD STORAGE ROAD NO 02', '[{"product_id":"1a7991ff-2b04-4e3e-abfe-271c296a73a1","name":"Aashirvaad Shudh Chakki Atta 5kg","category":"Atta & Flours","selling_price":265,"unit":"bag","quantity":1,"barcode":"8901030383182"},{"product_id":"c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e","name":"Amul Butter Pasteurised 500g","category":"Dairy & Eggs","selling_price":275,"unit":"pcs","quantity":1,"barcode":"8901262020015"}]', '540.00', 'UPI on Delivery', 'Delivered', NULL, NULL, NULL, NULL, 'Slot: Express 2-Hour Delivery', '2026-09-10 20:22:42');
INSERT INTO `online_orders` (`id`, `order_number`, `customer_name`, `customer_phone`, `customer_address`, `items_json`, `total_amount`, `payment_method`, `status`, `assigned_rider`, `packed_at`, `delivered_at`, `sale_id`, `notes`, `created_at`) VALUES ('66d09a75-6059-4391-8705-0116a733168b', 'WEB-248415', 'Rahul Sharma', '9876543210', 'Flat 402, Green Avenue, City', '[{"product_id":"prod-001","name":"Aashirvaad Shudh Chakki Atta 5kg","selling_price":245,"quantity":1,"unit":"kg"}]', '245.00', 'Cash on Delivery', 'Delivered', NULL, NULL, NULL, NULL, 'Call before delivery', '2026-09-10 19:57:28');

-- Table structure for products
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products` (
  `id` char(36) NOT NULL,
  `name` varchar(180) NOT NULL,
  `category` varchar(100) NOT NULL DEFAULT 'General',
  `barcode` varchar(100) NOT NULL,
  `purchase_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `selling_price` decimal(12,2) NOT NULL DEFAULT 0.00,
  `quantity` decimal(12,3) NOT NULL DEFAULT 0.000,
  `min_stock_level` decimal(12,3) NOT NULL DEFAULT 10.000,
  `supplier_id` char(36) DEFAULT NULL,
  `supplier_name` varchar(150) NOT NULL DEFAULT '',
  `expiry_date` date DEFAULT NULL,
  `unit` varchar(20) NOT NULL DEFAULT 'pcs',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_products_barcode` (`barcode`),
  KEY `fk_products_supplier` (`supplier_id`),
  CONSTRAINT `fk_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for products (10 rows)
INSERT INTO `products` (`id`, `name`, `category`, `barcode`, `purchase_price`, `selling_price`, `quantity`, `min_stock_level`, `supplier_id`, `supplier_name`, `expiry_date`, `unit`, `created_at`, `updated_at`) VALUES ('18d59632-e5c4-4278-bc40-e9549cc37052', 'Surf Excel Quick Wash Detergent 1kg', 'Household Care', '8901030701023', '155.00', '190.00', '45.000', '5.000', NULL, '', NULL, 'packet', '2026-09-10 19:26:17', '2026-09-10 19:26:17');
INSERT INTO `products` (`id`, `name`, `category`, `barcode`, `purchase_price`, `selling_price`, `quantity`, `min_stock_level`, `supplier_id`, `supplier_name`, `expiry_date`, `unit`, `created_at`, `updated_at`) VALUES ('1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', 'Atta & Flours', '8901030383182', '210.00', '265.00', '32.000', '5.000', NULL, '', NULL, 'bag', '2026-09-10 19:26:17', '2026-09-10 19:40:09');
INSERT INTO `products` (`id`, `name`, `category`, `barcode`, `purchase_price`, `selling_price`, `quantity`, `min_stock_level`, `supplier_id`, `supplier_name`, `expiry_date`, `unit`, `created_at`, `updated_at`) VALUES ('2b89f117-77e7-46b6-9a07-6c3012f01f34', 'Maggi 2-Minute Instant Noodles 280g', 'Snacks & Instant Food', '8901058841022', '45.00', '56.00', '60.000', '5.000', NULL, '', NULL, 'packet', '2026-09-10 19:26:17', '2026-09-10 19:26:17');
INSERT INTO `products` (`id`, `name`, `category`, `barcode`, `purchase_price`, `selling_price`, `quantity`, `min_stock_level`, `supplier_id`, `supplier_name`, `expiry_date`, `unit`, `created_at`, `updated_at`) VALUES ('46c44620-5504-4302-ad61-c81d22439746', 'Tata Tea Gold 500g', 'Beverages', '8901058860016', '280.00', '340.00', '30.000', '5.000', NULL, '', NULL, 'packet', '2026-09-10 19:26:17', '2026-09-10 19:26:17');
INSERT INTO `products` (`id`, `name`, `category`, `barcode`, `purchase_price`, `selling_price`, `quantity`, `min_stock_level`, `supplier_id`, `supplier_name`, `expiry_date`, `unit`, `created_at`, `updated_at`) VALUES ('64cf2639-db39-4063-bfa3-065fef3d58a0', 'Tata Salt Vaccum Evaporated 1kg', 'Spices & Seasoning', '8901058852332', '22.00', '28.00', '100.000', '5.000', NULL, '', NULL, 'packet', '2026-09-10 19:26:17', '2026-09-10 19:26:17');
INSERT INTO `products` (`id`, `name`, `category`, `barcode`, `purchase_price`, `selling_price`, `quantity`, `min_stock_level`, `supplier_id`, `supplier_name`, `expiry_date`, `unit`, `created_at`, `updated_at`) VALUES ('8a061b2f-da34-47a2-89dd-b203d3f11ddc', 'Dettol Original Soap 125g (Pack of 3)', 'Personal Care', '8901396312017', '110.00', '140.00', '3.000', '5.000', NULL, '', NULL, 'pack', '2026-09-10 19:26:17', '2026-09-10 19:38:41');
INSERT INTO `products` (`id`, `name`, `category`, `barcode`, `purchase_price`, `selling_price`, `quantity`, `min_stock_level`, `supplier_id`, `supplier_name`, `expiry_date`, `unit`, `created_at`, `updated_at`) VALUES ('b2ebb3be-b2aa-4fc9-b38b-8344f3a2ef1f', 'India Gate Basmati Rice Feast 1kg', 'Rice & Grains', '8901262010047', '95.00', '130.00', '40.000', '5.000', NULL, '', NULL, 'kg', '2026-09-10 19:26:17', '2026-09-10 19:26:17');
INSERT INTO `products` (`id`, `name`, `category`, `barcode`, `purchase_price`, `selling_price`, `quantity`, `min_stock_level`, `supplier_id`, `supplier_name`, `expiry_date`, `unit`, `created_at`, `updated_at`) VALUES ('c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', 'Dairy & Eggs', '8901262020015', '240.00', '275.00', '24.000', '5.000', NULL, '', NULL, 'pcs', '2026-09-10 19:26:17', '2026-09-10 19:38:41');
INSERT INTO `products` (`id`, `name`, `category`, `barcode`, `purchase_price`, `selling_price`, `quantity`, `min_stock_level`, `supplier_id`, `supplier_name`, `expiry_date`, `unit`, `created_at`, `updated_at`) VALUES ('c4e7742b-b837-4726-91f2-137715748309', 'Fortune Sunlite Sunflower Oil 1L', 'Oils & Ghee', '8906007281014', '115.00', '145.00', '49.000', '5.000', NULL, '', NULL, 'packet', '2026-09-10 19:26:17', '2026-09-10 19:38:41');
INSERT INTO `products` (`id`, `name`, `category`, `barcode`, `purchase_price`, `selling_price`, `quantity`, `min_stock_level`, `supplier_id`, `supplier_name`, `expiry_date`, `unit`, `created_at`, `updated_at`) VALUES ('cd47f421-8442-425c-91ed-e1a8aa5dbfb4', 'Parle-G Gold Biscuits 1kg', 'Biscuits & Cookies', '8901719101018', '90.00', '120.00', '3.000', '5.000', NULL, '', NULL, 'pack', '2026-09-10 19:26:18', '2026-09-10 19:26:18');

-- Table structure for purchase_items
DROP TABLE IF EXISTS `purchase_items`;
CREATE TABLE `purchase_items` (
  `id` varchar(36) NOT NULL,
  `purchase_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `total_cost` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_purchase_id` (`purchase_id`),
  KEY `idx_product_id` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for purchases
DROP TABLE IF EXISTS `purchases`;
CREATE TABLE `purchases` (
  `id` varchar(36) NOT NULL,
  `purchase_number` varchar(50) NOT NULL,
  `supplier_id` varchar(36) DEFAULT NULL,
  `supplier_name` varchar(255) NOT NULL,
  `supplier_invoice_number` varchar(100) DEFAULT NULL,
  `total_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `payment_status` enum('Paid','Partial','Pending') DEFAULT 'Paid',
  `payment_mode` varchar(50) DEFAULT 'Cash',
  `notes` text DEFAULT NULL,
  `created_by` varchar(100) DEFAULT 'Admin',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `purchase_number` (`purchase_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for return_items
DROP TABLE IF EXISTS `return_items`;
CREATE TABLE `return_items` (
  `id` varchar(36) NOT NULL,
  `return_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_refund` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_return_id` (`return_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for returns
DROP TABLE IF EXISTS `returns`;
CREATE TABLE `returns` (
  `id` varchar(36) NOT NULL,
  `return_number` varchar(50) NOT NULL,
  `sale_id` varchar(36) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT 'Walk-in Customer',
  `total_refund_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `refund_mode` varchar(50) DEFAULT 'Cash',
  `reason` varchar(255) DEFAULT 'Customer return',
  `processed_by` varchar(100) DEFAULT 'Cashier',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `return_number` (`return_number`),
  KEY `idx_sale_id` (`sale_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table structure for sale_items
DROP TABLE IF EXISTS `sale_items`;
CREATE TABLE `sale_items` (
  `id` char(36) NOT NULL,
  `sale_id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `product_name` varchar(180) NOT NULL,
  `barcode` varchar(100) NOT NULL,
  `unit_purchase_price` decimal(12,2) NOT NULL,
  `unit_selling_price` decimal(12,2) NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `total_price` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_sale_items_sale` (`sale_id`),
  KEY `fk_sale_items_product` (`product_id`),
  CONSTRAINT `fk_sale_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  CONSTRAINT `fk_sale_items_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for sale_items (5 rows)
INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `product_name`, `barcode`, `unit_purchase_price`, `unit_selling_price`, `quantity`, `total_price`) VALUES ('00dea0bb-d053-40db-881d-5ac0dc39c6aa', 'd658388c-f6ac-4c13-b778-3737911ba996', '8a061b2f-da34-47a2-89dd-b203d3f11ddc', 'Dettol Original Soap 125g (Pack of 3)', '8901396312017', '110.00', '140.00', '1.000', '140.00');
INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `product_name`, `barcode`, `unit_purchase_price`, `unit_selling_price`, `quantity`, `total_price`) VALUES ('44b126a7-b4e4-4346-b1dd-1360d1b99492', 'd658388c-f6ac-4c13-b778-3737911ba996', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', '240.00', '275.00', '1.000', '275.00');
INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `product_name`, `barcode`, `unit_purchase_price`, `unit_selling_price`, `quantity`, `total_price`) VALUES ('5e9ad88e-b021-40f2-b70e-e4f6daf43b94', 'b7f92b19-0bab-4b75-bbf1-2a4427bc90a4', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', '210.00', '265.00', '2.000', '530.00');
INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `product_name`, `barcode`, `unit_purchase_price`, `unit_selling_price`, `quantity`, `total_price`) VALUES ('7bcb9fb2-366c-41c2-8d97-03306eccd683', 'd658388c-f6ac-4c13-b778-3737911ba996', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', '210.00', '265.00', '1.000', '265.00');
INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `product_name`, `barcode`, `unit_purchase_price`, `unit_selling_price`, `quantity`, `total_price`) VALUES ('c7a0c1eb-2e38-4a27-8bfa-6b1fba439b8f', 'd658388c-f6ac-4c13-b778-3737911ba996', 'c4e7742b-b837-4726-91f2-137715748309', 'Fortune Sunlite Sunflower Oil 1L', '8906007281014', '115.00', '145.00', '1.000', '145.00');

-- Table structure for sales
DROP TABLE IF EXISTS `sales`;
CREATE TABLE `sales` (
  `id` char(36) NOT NULL,
  `invoice_number` varchar(50) NOT NULL,
  `customer_id` char(36) DEFAULT NULL,
  `customer_name` varchar(150) NOT NULL DEFAULT 'Walk-in Customer',
  `cashier_id` varchar(36) DEFAULT NULL,
  `cashier_name` varchar(100) DEFAULT 'Staff',
  `shift_id` varchar(36) DEFAULT NULL,
  `payment_mode` enum('Cash','UPI','Card','Credit') NOT NULL DEFAULT 'Cash',
  `subtotal` decimal(12,2) NOT NULL,
  `tax_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(12,2) NOT NULL,
  `received_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `change_amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `status` enum('Completed','Cancelled','Refunded') NOT NULL DEFAULT 'Completed',
  `return_status` enum('None','Partial','Full') DEFAULT 'None',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `invoice_number` (`invoice_number`),
  KEY `idx_sales_created_at` (`created_at`),
  KEY `fk_sales_customer` (`customer_id`),
  CONSTRAINT `fk_sales_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for sales (2 rows)
INSERT INTO `sales` (`id`, `invoice_number`, `customer_id`, `customer_name`, `cashier_id`, `cashier_name`, `shift_id`, `payment_mode`, `subtotal`, `tax_percent`, `tax_amount`, `discount_amount`, `total_amount`, `received_amount`, `change_amount`, `status`, `return_status`, `created_at`) VALUES ('b7f92b19-0bab-4b75-bbf1-2a4427bc90a4', 'INV-2026-0002', NULL, 'Walk-in Customer', NULL, 'Staff', NULL, 'Cash', '530.00', '0.00', '0.00', '0.00', '530.00', '530.00', '0.00', 'Completed', 'None', '2026-09-10 19:40:09');
INSERT INTO `sales` (`id`, `invoice_number`, `customer_id`, `customer_name`, `cashier_id`, `cashier_name`, `shift_id`, `payment_mode`, `subtotal`, `tax_percent`, `tax_amount`, `discount_amount`, `total_amount`, `received_amount`, `change_amount`, `status`, `return_status`, `created_at`) VALUES ('d658388c-f6ac-4c13-b778-3737911ba996', 'INV-2026-0001', 'ae1e5551-ca31-4bb1-9567-a788215c4df6', 'Ramesh Sharma', NULL, 'Staff', NULL, 'Cash', '825.00', '0.00', '0.00', '0.00', '825.00', '825.00', '0.00', 'Completed', 'None', '2026-09-10 19:38:41');

-- Table structure for settings
DROP TABLE IF EXISTS `settings`;
CREATE TABLE `settings` (
  `id` tinyint(4) NOT NULL,
  `shop_name` varchar(150) NOT NULL DEFAULT 'My Store',
  `owner_name` varchar(120) NOT NULL DEFAULT '',
  `phone` varchar(30) NOT NULL DEFAULT '',
  `address` text DEFAULT NULL,
  `gst_number` varchar(50) DEFAULT NULL,
  `currency_symbol` varchar(8) NOT NULL DEFAULT '???',
  `default_tax_percent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `low_stock_threshold` int(11) NOT NULL DEFAULT 10,
  `upi_id` varchar(120) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for settings (1 rows)
INSERT INTO `settings` (`id`, `shop_name`, `owner_name`, `phone`, `address`, `gst_number`, `currency_symbol`, `default_tax_percent`, `low_stock_threshold`, `upi_id`, `updated_at`) VALUES (1, 'Green Grocery & Retail Store', '', '', NULL, NULL, '₹', '0.00', 10, NULL, '2026-09-10 19:26:17');

-- Table structure for stock_movements
DROP TABLE IF EXISTS `stock_movements`;
CREATE TABLE `stock_movements` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `movement_type` enum('IN','SALE','ADJUSTMENT') NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `previous_quantity` decimal(12,3) NOT NULL,
  `new_quantity` decimal(12,3) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `fk_stock_movements_product` (`product_id`),
  CONSTRAINT `fk_stock_movements_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Data for stock_movements (5 rows)
INSERT INTO `stock_movements` (`id`, `product_id`, `movement_type`, `quantity`, `previous_quantity`, `new_quantity`, `note`, `created_at`) VALUES ('1632562c-8c62-4bc3-b2ee-31603f62532b', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', '2.000', '0.000', '0.000', 'Invoice INV-2026-0002', '2026-09-10 19:40:09');
INSERT INTO `stock_movements` (`id`, `product_id`, `movement_type`, `quantity`, `previous_quantity`, `new_quantity`, `note`, `created_at`) VALUES ('28170039-053b-49a4-8fdd-19cdd7aaa474', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', '1.000', '0.000', '0.000', 'Invoice INV-2026-0001', '2026-09-10 19:38:41');
INSERT INTO `stock_movements` (`id`, `product_id`, `movement_type`, `quantity`, `previous_quantity`, `new_quantity`, `note`, `created_at`) VALUES ('2a1d3311-9474-42e0-bb67-1a5051a42998', '8a061b2f-da34-47a2-89dd-b203d3f11ddc', 'SALE', '1.000', '0.000', '0.000', 'Invoice INV-2026-0001', '2026-09-10 19:38:41');
INSERT INTO `stock_movements` (`id`, `product_id`, `movement_type`, `quantity`, `previous_quantity`, `new_quantity`, `note`, `created_at`) VALUES ('2beaae84-250f-46c5-b3d0-c8f3c8153bfe', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', '1.000', '0.000', '0.000', 'Invoice INV-2026-0001', '2026-09-10 19:38:41');
INSERT INTO `stock_movements` (`id`, `product_id`, `movement_type`, `quantity`, `previous_quantity`, `new_quantity`, `note`, `created_at`) VALUES ('b01ad1ab-f043-4518-bbd6-296a5559d5ba', 'c4e7742b-b837-4726-91f2-137715748309', 'SALE', '1.000', '0.000', '0.000', 'Invoice INV-2026-0001', '2026-09-10 19:38:41');

-- Table structure for suppliers
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` char(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `company_name` varchar(150) NOT NULL DEFAULT '',
  `phone` varchar(30) NOT NULL DEFAULT '',
  `email` varchar(160) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for users
