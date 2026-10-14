-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Sep 29, 2026 at 11:44 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `single_vendor_pos_tracking`

CREATE DATABASE IF NOT EXISTS `single_vendor_pos_tracking`;
USE `single_vendor_pos_tracking`;
--

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` varchar(36) NOT NULL,
  `staff_id` varchar(36) NOT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('Present','Absent','Half Day') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `user_name` varchar(100) DEFAULT 'System',
  `action` varchar(100) NOT NULL,
  `entity_type` varchar(100) NOT NULL,
  `entity_id` varchar(100) DEFAULT NULL,
  `details` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`details`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `user_name`, `action`, `entity_type`, `entity_id`, `details`, `ip_address`, `created_at`) VALUES
('066cd907-cd9a-451e-88b2-3d4d5df1dfd5', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '911c3530-40b3-4a94-9373-67ff0df70e71', '{\"invoice_number\":\"INV-20260911-0004\",\"total_amount\":530,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-11 07:57:47'),
('0704696a-8ae9-4d1a-b47a-644c91e0b40d', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-17 11:52:03'),
('07443746-b0a6-452e-9402-5588fafefac9', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-11 08:02:41'),
('104cd594-d8a7-46d4-b556-89375d2bbfed', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '48340b13-5ea8-453a-8f56-fd947e7dd71a', '{\"invoice_number\":\"INV-20260912-0002\",\"total_amount\":275,\"items_count\":1,\"payment_mode\":\"UPI\"}', NULL, '2026-09-12 10:22:43'),
('10edc1f5-79fc-46d2-a252-711608cf44ec', NULL, 'Anonymous', 'LOGIN_FAILED_PIN', 'User', NULL, 'null', '127.0.0.1', '2026-09-16 09:47:02'),
('1128425f-7438-49ae-900e-2e469b7bb9a1', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'RETURN_PROCESSED', 'Return', '9deb5e65-6f10-4f81-bab0-b64e0fffc1cf', '{\"return_number\":\"RET-20260926-0003\",\"invoice_number\":\"INV-20260926-0008\",\"total_refund\":0,\"refund_mode\":\"Cash\"}', NULL, '2026-09-26 12:56:27'),
('12afcc46-fd65-4f9e-93a1-432bb8139dd1', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'bb3557af-97c1-40e9-a6fb-3bd665296ca1', '{\"invoice_number\":\"INV-20260911-0005\",\"total_amount\":530,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-11 08:02:41'),
('13b80537-0020-415b-bd97-43ab9942a241', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-14 09:26:55'),
('151c59ce-7a25-4e55-aacf-b62c6559b8fa', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'RETURN_PROCESSED', 'Return', '04e4cefd-77db-4539-b5e6-f031c0b6ecc3', '{\"return_number\":\"RET-20260926-0006\",\"invoice_number\":\"INV-20260926-0009\",\"total_refund\":0,\"refund_mode\":\"Cash\"}', NULL, '2026-09-26 13:11:35'),
('18a33663-1727-40aa-99dd-763b9a64b069', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'e78fd877-454e-4991-931c-0d8faa3ab04e', '{\"invoice_number\":\"INV-20260914-0003\",\"total_amount\":145,\"items_count\":1,\"payment_mode\":\"Card\"}', NULL, '2026-09-14 09:27:25'),
('19194029-adc2-49e0-8284-56e46d6b2d6d', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'RETURN_PROCESSED', 'Return', 'f4bbc40a-df1b-46a3-9dc1-ec474a3f1fa9', '{\"return_number\":\"RET-20260911-0002\",\"invoice_number\":\"INV-20260911-0006\",\"total_refund\":265,\"refund_mode\":\"Cash\"}', NULL, '2026-09-11 08:07:10'),
('191b19bf-209b-4b27-a0b0-047970961249', NULL, 'Anonymous', 'LOGIN_FAILED_PIN', 'User', NULL, 'null', '127.0.0.1', '2026-09-11 08:30:46'),
('1a9d9ebe-e229-4d5b-9a47-85d350b424d1', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'ORDER_STATUS_UPDATED', 'OnlineOrder', 'fe0d282e-0e2e-4616-b65f-1b180f5936dc', '{\"order_number\":\"WEB-263630\",\"from_status\":\"Pending\",\"to_status\":\"Cancelled\"}', NULL, '2026-09-22 14:31:08'),
('1abeedcb-32c0-45c3-ac52-2d4f3ccbc039', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'c22e54c4-0659-4079-a43b-b2a6fa3ba14c', '{\"invoice_number\":\"INV-20260918-0003\",\"total_amount\":34,\"items_count\":1,\"payment_mode\":\"Card\"}', NULL, '2026-09-18 09:36:29'),
('1af7400e-9410-4408-bd76-167d0b3070aa', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'RETURN_PROCESSED', 'Return', 'db95a4db-660f-4bd0-8d8b-1b4623a7d78e', '{\"return_number\":\"RET-20260926-0004\",\"invoice_number\":\"INV-20260926-0008\",\"total_refund\":0,\"refund_mode\":\"Cash\"}', NULL, '2026-09-26 13:04:53'),
('1bc998b2-c1e8-4054-b5c1-d6e56f54089b', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'd597ec5f-96c0-4ec4-b13c-9ff79c8e0afd', '{\"invoice_number\":\"INV-20260926-0009\",\"total_amount\":265,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-26 12:12:37'),
('1cc5128e-3401-4aad-a93c-f3a59fca7c3c', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-11 08:41:54'),
('1ebbdd4b-5449-4d77-8640-35a08bb1740f', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-17 09:22:23'),
('24e12def-48da-4f3a-8c0d-36609d212f56', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '8ad75379-57f5-43bc-ac4a-6b44cc74a808', '{\"invoice_number\":\"INV-20260915-0003\",\"total_amount\":56,\"items_count\":1,\"payment_mode\":\"Card\"}', NULL, '2026-09-15 03:46:07'),
('25ba3bf6-636f-4373-8bb8-3032a98bcd8c', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'RETURN_PROCESSED', 'Return', '7ce68635-072f-4d75-a438-dec9011ed890', '{\"return_number\":\"RET-20260911-0001\",\"invoice_number\":\"INV-20260911-0005\",\"total_refund\":265,\"refund_mode\":\"Cash\"}', NULL, '2026-09-11 08:02:41'),
('2ea61479-f059-47ee-a774-f6341e2d221d', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '5c95564c-940a-483e-988f-c0f5b10e81b8', '{\"invoice_number\":\"INV-20260914-0001\",\"total_amount\":265,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-14 09:27:08'),
('2f031ae9-3fc1-4827-b868-16fcd47b56fb', NULL, 'admin', 'LOGIN_FAILED_PASSWORD', 'User', NULL, 'null', '127.0.0.1', '2026-09-11 08:10:36'),
('3122cc39-7622-49f3-86f1-642f748c7762', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-11 07:47:48'),
('34cc96a5-5b5e-48ff-bcdd-8c5cdcb78b0b', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'RETURN_PROCESSED', 'Return', '26dba4a6-1713-474a-b7ef-3dcf352b2862', '{\"return_number\":\"RET-20260926-0005\",\"invoice_number\":\"INV-20260926-0010\",\"total_refund\":0,\"refund_mode\":\"Cash\"}', NULL, '2026-09-26 13:06:42'),
('384f673d-0b15-402b-89f2-d703d7d3d560', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '3f9335e8-1ff0-4316-9b40-5439b5489d29', '{\"invoice_number\":\"INV-20260918-0001\",\"total_amount\":265,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-18 09:36:17'),
('3b1f82fa-bf50-435e-9e45-b0846d897d50', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '866b643d-897c-4187-8ad5-97bc38825fb2', '{\"invoice_number\":\"INV-20260911-0012\",\"total_amount\":280,\"items_count\":1,\"payment_mode\":\"Card\"}', NULL, '2026-09-11 15:02:03'),
('3cebf16d-0839-4b79-8ac6-3301a17899c1', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '879cc8a4-ce7b-4692-b2fa-45beb29a1f4c', '{\"invoice_number\":\"INV-20260919-0002\",\"total_amount\":275,\"items_count\":1,\"payment_mode\":\"UPI\"}', NULL, '2026-09-19 09:02:46'),
('3d9851ad-23dc-446d-a7d8-a0e29ddc29bf', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-28 09:16:30'),
('3f0b49f1-e0c6-4057-8f0d-6275a6beb5c1', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'ORDER_STATUS_UPDATED', 'OnlineOrder', '78455e64-8bde-4ef4-a912-f102ccee4594', '{\"order_number\":\"WEB-312988\",\"from_status\":\"Pending\",\"to_status\":\"Cancelled\"}', NULL, '2026-09-24 13:05:26'),
('4700221a-a3dc-482a-af6b-3ca4076a6b63', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '292a7637-f7a5-49f8-984e-3ee22988954c', '{\"invoice_number\":\"INV-20260914-0002\",\"total_amount\":275,\"items_count\":1,\"payment_mode\":\"UPI\"}', NULL, '2026-09-14 09:27:15'),
('47c9fedc-5538-4db3-8e35-622e94ba2298', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '60eb4cbf-e3fb-466b-8146-ba8d92dbc1d8', '{\"invoice_number\":\"INV-20260926-0008\",\"total_amount\":275,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-26 12:08:01'),
('48f8ae41-84c2-4a8d-be35-5565d127efd1', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'ORDER_STATUS_UPDATED', 'OnlineOrder', '9fc6e852-88cf-43a8-bd31-cd9f57775e08', '{\"order_number\":\"WEB-197419\",\"from_status\":\"Pending\",\"to_status\":\"Cancelled\"}', NULL, '2026-09-22 14:36:54'),
('4ae13173-7bde-4d64-9eaa-d686a7970074', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '26c21aca-028d-4b3e-a1ff-5bee4ebc073b', '{\"invoice_number\":\"INV-20260926-0005\",\"total_amount\":275,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-26 11:45:01'),
('4c3d4d3f-3ece-4b62-ba85-04fd35596421', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-11 07:48:13'),
('4c6f4921-c2fb-45b7-aaae-080f2855828e', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'ORDER_STATUS_UPDATED', 'OnlineOrder', '45e8bb4f-38bb-4167-9dc0-7aa36e106910', '{\"order_number\":\"WEB-159082\",\"from_status\":\"Pending\",\"to_status\":\"Accepted\"}', NULL, '2026-09-22 13:22:56'),
('4c8d4812-9165-4093-96ad-9ee1c1c6c0e9', '2cee8974-f5df-4795-b8d9-aaa06244195c', 'Billing Cashier', 'LOGIN_SUCCESS_PASSWORD', 'User', '2cee8974-f5df-4795-b8d9-aaa06244195c', 'null', '127.0.0.1', '2026-09-11 11:25:21'),
('4f98a18f-64f3-457e-8be5-ddaaafde9749', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'c6b5ff4a-684b-4bd5-89fa-6811921596a0', '{\"invoice_number\":\"INV-20260911-0013\",\"total_amount\":265,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-11 16:03:11'),
('532a0e62-0501-4b0d-975a-84293273aadd', NULL, 'Anonymous', 'LOGIN_FAILED_PIN', 'User', NULL, 'null', '127.0.0.1', '2026-09-11 11:15:19'),
('5ba5debc-0eb6-4509-9280-9b53b84447ae', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'e90cfeae-38a4-4dac-aa6d-25b106aff23d', '{\"invoice_number\":\"INV-20260917-0002\",\"total_amount\":275,\"items_count\":1,\"payment_mode\":\"UPI\"}', NULL, '2026-09-17 09:10:16'),
('608c1d63-42ff-4218-8813-750f93bde090', NULL, 'Anonymous', 'LOGIN_FAILED_PIN', 'User', NULL, 'null', '127.0.0.1', '2026-09-16 09:47:19'),
('61d2356a-2a19-4c08-9d10-4ab04526e724', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'a2beb3bb-3361-4187-a3f8-fb97e69efc6d', '{\"invoice_number\":\"INV-20260916-0003\",\"total_amount\":145,\"items_count\":1,\"payment_mode\":\"Card\"}', NULL, '2026-09-16 08:46:53'),
('64282b7f-52ed-4051-8326-635930ec6a54', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '4658ccff-90f8-4623-a176-4d82da7153ab', '{\"invoice_number\":\"INV-20260917-0001\",\"total_amount\":530,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-17 09:09:58'),
('64ce0e82-a93f-4c42-a2da-354181cae8f5', NULL, 'Anonymous', 'LOGIN_FAILED_PIN', 'User', NULL, 'null', '127.0.0.1', '2026-09-11 08:30:42'),
('64fe4005-3ef3-4877-a88f-41e39d8a7ee9', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'GOODS_RECEIVED', 'Purchase', 'fa13e068-a8f5-4958-9ca7-c90402f533ca', '{\"purchase_number\":\"PO-20260911-0003\",\"supplier_name\":\"General Supplier\",\"total_amount\":400,\"items_count\":1}', NULL, '2026-09-11 08:02:41'),
('65294a65-e727-4d32-98b3-89db071ff0b7', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-21 09:49:55'),
('65c13d2d-aea5-47d5-9202-19329cb365e6', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-11 08:30:49'),
('661be703-d863-4466-a92f-3c9f9a226716', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-19 09:47:18'),
('6f920410-8941-427a-9567-59283a02496f', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-11 07:52:35'),
('72b448c9-f8ac-470d-82b4-b4b6e0b920a3', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'f2789923-62eb-404d-90ce-58dd986de1da', '{\"invoice_number\":\"INV-20260919-0001\",\"total_amount\":265,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-19 09:02:39'),
('7ab49772-8144-4e01-a1b1-feda16b6496f', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '7170ec83-bf99-4b1b-bf02-5433e738d0d5', '{\"invoice_number\":\"INV-20260916-0002\",\"total_amount\":275,\"items_count\":1,\"payment_mode\":\"UPI\"}', NULL, '2026-09-16 08:46:46'),
('7b949fff-f932-4a0b-b979-6c9d35b78788', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-18 10:10:23'),
('7d0dcfdb-3c3e-462a-a76c-7894bdcf22cc', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'RETURN_PROCESSED', 'Return', 'b9e44895-d737-4f4c-a6c2-d0babc6ccb3c', '{\"return_number\":\"RET-20260926-0001\",\"invoice_number\":\"INV-20260911-0007\",\"total_refund\":0,\"refund_mode\":\"Cash\"}', NULL, '2026-09-26 12:28:28'),
('801897f5-e8fb-4cf0-9349-32c2672320ae', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '245eb7d3-a28e-46a9-9cba-6a2435e26a1d', '{\"invoice_number\":\"INV-20260912-0003\",\"total_amount\":145,\"items_count\":1,\"payment_mode\":\"Card\"}', NULL, '2026-09-12 10:22:50'),
('803f69c6-a82f-4300-a804-a78f9f3755c1', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-15 09:56:18'),
('82a57c0d-28ae-44c4-985a-fd88f30dba81', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-24 05:40:11'),
('85252a4b-b90d-4783-9d2c-f8ba0a8b8064', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'RETURN_PROCESSED', 'Return', 'dd48fd7d-270e-451f-9e58-33f2943f58b9', '{\"return_number\":\"RET-20260926-0002\",\"invoice_number\":\"INV-20260926-0005\",\"total_refund\":0,\"refund_mode\":\"Cash\"}', NULL, '2026-09-26 12:42:19'),
('858f02ef-7530-4532-87d8-5830061d20e6', NULL, 'admin', 'LOGIN_FAILED_PASSWORD', 'User', NULL, 'null', '127.0.0.1', '2026-09-11 09:07:35'),
('86e49ee4-a9ca-4315-b18c-23e31d205031', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'f5cdf0e7-0344-4d4a-9c3b-e9684e3e9b59', '{\"invoice_number\":\"INV-20260917-0004\",\"total_amount\":540,\"items_count\":2,\"payment_mode\":\"Cash\"}', NULL, '2026-09-17 11:04:15'),
('8a7e1989-cc57-401e-bc24-d7882a5a8be3', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-11 08:11:44'),
('8c322978-12c6-41f5-a849-e01a4f28e140', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'c75066f7-ea09-4432-ac55-d54b8de1c896', '{\"invoice_number\":\"INV-20260916-0001\",\"total_amount\":265,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-16 08:46:39'),
('8f42ad6c-262c-42c3-808a-46ca0847440a', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '376377b7-5bf3-4d70-8a8f-ff16fe551a60', '{\"invoice_number\":\"INV-20260918-0002\",\"total_amount\":275,\"items_count\":1,\"payment_mode\":\"UPI\"}', NULL, '2026-09-18 09:36:23'),
('903cc3b9-9fe6-4918-adc6-5e3e70300589', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '2133783d-1d44-46fb-bcd0-8e7c974486f8', '{\"invoice_number\":\"INV-20260926-0002\",\"total_amount\":540,\"items_count\":2,\"payment_mode\":\"Cash\"}', NULL, '2026-09-26 10:27:34'),
('9089cd23-b902-495e-9953-cc2fe3a899b4', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '49c3fb2f-7a03-41b8-915e-ce4fca4990f5', '{\"invoice_number\":\"INV-20260921-0002\",\"total_amount\":550,\"items_count\":1,\"payment_mode\":\"UPI\"}', NULL, '2026-09-21 09:50:16'),
('922cbb2f-0177-40fa-976c-73f26836c7f7', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '7be37eaf-def0-432f-a0a0-40291243027c', '{\"invoice_number\":\"INV-20260921-0001\",\"total_amount\":265,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-21 09:50:06'),
('98e6a1bc-79f7-45ec-8bdb-4c33ad463cdb', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-16 09:49:38'),
('9d2c7305-f5d2-44d2-a606-b54729976a00', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'bdd68b57-1078-4273-92b5-6b32f47318c2', '{\"invoice_number\":\"INV-20260926-0001\",\"total_amount\":265,\"items_count\":1,\"payment_mode\":\"UPI\"}', NULL, '2026-09-26 10:14:39'),
('9d56c85e-1bc7-47cf-b2e6-47001cd853ec', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '8117f6a1-1807-4e27-b27a-2bab4b1eb57c', '{\"invoice_number\":\"INV-20260926-0007\",\"total_amount\":265,\"items_count\":1,\"payment_mode\":\"UPI\"}', NULL, '2026-09-26 12:04:46'),
('9f9a4bdd-cee9-42e8-a167-3cc480bbe764', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '6c9b1133-f7f0-4831-8df0-b055a33adab1', '{\"invoice_number\":\"INV-20260912-0001\",\"total_amount\":265,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-12 10:22:36'),
('a072823e-891a-43de-b868-174fc8b4cc8f', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'd118a840-7b42-489b-b45e-74fd63a1d79f', '{\"invoice_number\":\"INV-20260911-0009\",\"total_amount\":680,\"items_count\":3,\"payment_mode\":\"Cash\"}', NULL, '2026-09-11 14:19:57'),
('a8edd37c-9802-4a9d-bb24-7e8c3ae9b786', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '906e9209-579f-4306-99a1-d4db5c50e979', '{\"invoice_number\":\"INV-20260911-0003\",\"total_amount\":530,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-11 07:52:35'),
('aa9b48b2-2177-401a-95df-9fa44da8d327', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'ce99b877-dd70-4e1c-a045-1349b9380b09', '{\"invoice_number\":\"INV-20260911-0007\",\"total_amount\":265,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-11 08:37:58'),
('abc59e0c-02bc-4c7f-9a2a-ff855f059299', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'dd96d8e8-d1d4-40d0-a04c-431ed2321a1f', '{\"invoice_number\":\"INV-20260917-0003\",\"total_amount\":145,\"items_count\":1,\"payment_mode\":\"Card\"}', NULL, '2026-09-17 09:10:21'),
('ac8dceb6-c5b1-4526-bb1c-c7a84eb594a9', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-11 08:07:10'),
('af43e987-0593-4b5d-aa7a-a87fc87e8de1', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '74d52ea6-ce93-45ca-837d-d36663ff7aec', '{\"invoice_number\":\"INV-20260915-0001\",\"total_amount\":265,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-15 03:45:53'),
('af50aba0-60bc-4d31-9452-21b3514910af', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-22 11:24:15'),
('afb515f1-664c-4d45-8d5d-d30af1f1b9b0', NULL, 'Anonymous', 'LOGIN_FAILED_PIN', 'User', NULL, 'null', '127.0.0.1', '2026-09-17 09:24:47'),
('aff66997-4e73-4356-8c5f-d3777dddb997', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-26 10:00:28'),
('b050e192-6e0f-46a4-b65b-9c53c76ab32e', NULL, 'Anonymous', 'LOGIN_FAILED_PIN', 'User', NULL, 'null', '127.0.0.1', '2026-09-16 09:47:16'),
('b1114f2b-f1b9-45b1-aa76-0b618357118e', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-29 09:37:43'),
('b181b61f-a839-4c25-b9ff-a4bda89f107b', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'GOODS_RECEIVED', 'Purchase', 'c76164e4-62db-486d-8d0e-ad9f84af9f0a', '{\"purchase_number\":\"PO-20260911-0004\",\"supplier_name\":\"General Supplier\",\"total_amount\":400,\"items_count\":1}', NULL, '2026-09-11 08:07:10'),
('b19c6157-1067-4355-bff2-e10fc71686f1', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'cf0ebfdd-5c0c-4d31-a7ab-085985531dfa', '{\"invoice_number\":\"INV-20260926-0003\",\"total_amount\":275,\"items_count\":1,\"payment_mode\":\"UPI\"}', NULL, '2026-09-26 11:28:01'),
('b31d089f-5527-4387-8535-00d5953650da', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '9e157fd4-7cf2-43cc-a9fc-11584875c8b8', '{\"invoice_number\":\"INV-20260919-0003\",\"total_amount\":145,\"items_count\":1,\"payment_mode\":\"Card\"}', NULL, '2026-09-19 09:02:51'),
('b7a19e2d-3fab-4f6b-9f0a-817a24d57411', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'GOODS_RECEIVED', 'Purchase', '4ed03414-f4c4-4fb0-b97f-6be15597f2f5', '{\"purchase_number\":\"PO-20260911-0002\",\"supplier_name\":\"General Supplier\",\"total_amount\":400,\"items_count\":1}', NULL, '2026-09-11 07:57:47'),
('b816c897-661c-4ce7-8d68-9f11122abcc6', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'c86bccb1-2108-4f11-b57b-262c057b7590', '{\"invoice_number\":\"INV-20260926-0010\",\"total_amount\":275,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-26 13:05:30'),
('b8aac59f-a82f-4f4a-bb85-788706fc5840', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-14 09:50:19'),
('be832502-5691-4712-9118-2c44f8750c25', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-22 12:30:54'),
('bf53dca7-5c12-4d97-8043-8abb84f11f1a', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '13d686dc-c7b9-4c72-83f0-bd53278d8753', '{\"invoice_number\":\"INV-20260911-0006\",\"total_amount\":530,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-11 08:07:10'),
('c271dcc2-c3bf-4fdd-8605-e731bdf52631', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-11 11:20:57'),
('c3ec3ef7-f616-4e2a-95dd-0b3511352fdc', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '3ee64023-f591-41c0-8889-e7ffb31a2147', '{\"invoice_number\":\"INV-20260926-0004\",\"total_amount\":275,\"items_count\":1,\"payment_mode\":\"UPI\"}', NULL, '2026-09-26 11:28:09'),
('c998a0d9-30f4-449e-8c39-81c46a0cd603', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-17 09:31:03'),
('c9b835ba-2045-4ceb-b4ee-0357bc20885e', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-11 09:03:23'),
('ca710dd1-565a-4f71-8358-1ca1ff9d8f0a', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'GOODS_RECEIVED', 'Purchase', '5e803db8-3a07-40d4-a89d-2df2ebe0a573', '{\"purchase_number\":\"PO-20260911-0001\",\"supplier_name\":\"General Supplier\",\"total_amount\":400,\"items_count\":1}', NULL, '2026-09-11 07:52:35'),
('caa3595e-41ed-46c7-aa2d-9edf3bfb6b23', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-11 09:08:07'),
('cdd38499-1ae8-4289-996a-b9aaf33bbdb5', NULL, 'admin', 'LOGIN_FAILED_PASSWORD', 'User', NULL, 'null', '127.0.0.1', '2026-09-11 09:07:43'),
('d85544b3-6376-48be-baa9-c69ac45c59bc', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '46bd3f24-8de5-4168-9fdf-e169b2b0dfcb', '{\"invoice_number\":\"INV-20260911-0008\",\"total_amount\":265,\"items_count\":1,\"payment_mode\":\"Split (Cash: ₹100.00 | UPI: ₹100.00 | Due/Khata: ₹65.00)\",\"split_details\":\"Cash: ₹100.00 | UPI: ₹100.00 | Due/Khata: ₹65.00\"}', NULL, '2026-09-11 08:41:54'),
('dbff80eb-343a-466e-9330-2086379976ae', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-11 07:57:47'),
('dc8843d1-f76a-4d7f-b4fc-54413de33afc', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-11 11:26:48'),
('e7f3d628-628c-408b-93e2-095bf616f8b0', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-17 09:11:34'),
('e84c9eb1-8f20-480a-9c3e-b4b5f78ed405', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-18 09:37:43'),
('e8f20787-2e39-4bb6-9c6d-28bf7eba413e', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '939e7aa1-ecb9-4a04-8f0d-66cd62cfadc0', '{\"invoice_number\":\"INV-20260915-0002\",\"total_amount\":275,\"items_count\":1,\"payment_mode\":\"UPI\"}', NULL, '2026-09-15 03:45:59'),
('ea6f3e65-8e66-4499-ad85-c2ea62671651', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'GOODS_RECEIVED', 'Purchase', '0af0effc-ca77-4382-95d5-1eded42038f5', '{\"purchase_number\":\"PO-20260921-0001\",\"supplier_name\":\"General Supplier\",\"total_amount\":40,\"items_count\":1}', NULL, '2026-09-21 16:31:53'),
('ed3a8f17-cbb7-458b-90f9-f20cc3cdd7f2', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'c7d5197e-76ac-4a2c-917f-058069b07bbe', '{\"invoice_number\":\"INV-20260911-0010\",\"total_amount\":176,\"items_count\":2,\"payment_mode\":\"UPI\"}', NULL, '2026-09-11 15:01:40'),
('edc0dfd7-d898-4e12-9263-78b73425de33', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'LOGIN_SUCCESS_PASSWORD', 'User', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'null', '127.0.0.1', '2026-09-19 10:54:57'),
('ef2bcc94-d613-40c5-ac56-f5d5974ed959', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '3d45ae4d-b9cb-485c-9166-388a66dbd836', '{\"invoice_number\":\"INV-20260921-0003\",\"total_amount\":145,\"items_count\":1,\"payment_mode\":\"Card\"}', NULL, '2026-09-21 09:50:22'),
('f0b23592-cf14-4758-ac7e-336a2af89cb5', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'CUSTOMER_PAYMENT_RECEIVED', 'Customer', '04c6d377-20c8-41b9-ad4e-3427a56b50cb', '{\"customer_name\":\"Test Ledger Customer 0569\",\"amount_paid\":200,\"receipt_number\":\"RCP-20260911-0001\",\"new_dues\":300}', NULL, '2026-09-11 08:07:10'),
('f14a4a40-6297-4691-abed-f6bb0033456b', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', '7a9be4d4-4211-4e3c-b4ed-03c82e92122e', '{\"invoice_number\":\"INV-20260911-0011\",\"total_amount\":130,\"items_count\":1,\"payment_mode\":\"Cash\"}', NULL, '2026-09-11 15:01:50'),
('fb495f19-9232-4631-882d-09917ea8f0f1', NULL, 'admin', 'LOGIN_FAILED_PASSWORD', 'User', NULL, 'null', '127.0.0.1', '2026-09-11 11:14:58'),
('ff3dde52-eb6d-45a1-8f37-56f76b4c6efa', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'SALE_COMPLETED', 'Sale', 'f9baea6d-ac9c-4068-97d1-39dd7ae020fd', '{\"invoice_number\":\"INV-20260926-0006\",\"total_amount\":275,\"items_count\":1,\"payment_mode\":\"UPI\"}', NULL, '2026-09-26 11:57:32');

-- --------------------------------------------------------

--
-- Table structure for table `cash_shifts`
--

CREATE TABLE `cash_shifts` (
  `id` varchar(36) NOT NULL,
  `user_name` varchar(120) NOT NULL,
  `opening_cash` decimal(12,2) NOT NULL DEFAULT 0.00,
  `closing_cash` decimal(12,2) DEFAULT NULL,
  `expected_cash` decimal(12,2) DEFAULT NULL,
  `difference` decimal(12,2) DEFAULT NULL,
  `status` enum('Open','Closed') DEFAULT 'Open',
  `opened_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `closed_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cash_shifts`
--

INSERT INTO `cash_shifts` (`id`, `user_name`, `opening_cash`, `closing_cash`, `expected_cash`, `difference`, `status`, `opened_at`, `closed_at`) VALUES
('b062fe38-c05c-4adb-a218-90edd5d97061', 'Store Admin', 1000.00, 1000.00, 1000.00, 0.00, 'Closed', '2026-09-10 19:57:49', '2026-09-10 19:58:35');

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` char(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `phone` varchar(30) NOT NULL DEFAULT '',
  `email` varchar(160) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `address` text DEFAULT NULL,
  `outstanding_dues` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `phone`, `email`, `pincode`, `password_hash`, `is_active`, `last_login_at`, `address`, `outstanding_dues`, `created_at`) VALUES
('04c6d377-20c8-41b9-ad4e-3427a56b50cb', 'Test Ledger Customer 0569', '9876543210', '', NULL, NULL, 1, NULL, '', 300.00, '2026-09-11 08:07:10'),
('15990c88-3329-4f4e-9681-4324981376d1', 'nikita khairnar', '9209816962', 'admin@gmail.com', NULL, NULL, 1, NULL, 'at post nashik', 0.00, '2026-09-19 12:01:48'),
('213e61b9-3090-4076-952f-3aaeca905233', 'xyz', '9209816962', 'admin@gmail.com', NULL, NULL, 1, NULL, 'at post niphad', 0.00, '2026-09-22 12:04:01'),
('5f5c26e8-cca6-49e9-8ce2-667426574a2f', 'nikita khairnar', '9209816962', 'admin@gmail.com', NULL, NULL, 1, NULL, 'at post nashik', 0.00, '2026-09-21 10:45:39'),
('69ac5cb6-25fe-4972-a68a-1b4ea337f45f', 'Split Pay Customer 4274', '9988776655', '', NULL, NULL, 1, NULL, '', 65.00, '2026-09-11 08:41:54'),
('82110314-603b-4430-ab9d-14d11a077ff9', 'xyz', '9209816962', 'admin@gmail.com', NULL, NULL, 1, NULL, 'at post nashik', 0.00, '2026-09-19 12:22:38'),
('8a565908-6e51-436a-a694-f6f5142fc790', 'xyz', '9209816962', 'admin@gmail.com', NULL, NULL, 1, NULL, 'at post nashik', 0.00, '2026-09-22 10:03:34'),
('9d17bd09-e512-43cd-ada3-5790797a05c0', 'Sunita Verma', '9823456789', NULL, NULL, NULL, 1, NULL, NULL, 250.00, '2026-09-10 19:26:18'),
('a94b08f6-d1d1-4e8e-bef9-7e1b17fc9b4e', 'nikita khairnar', '9923144302', 'nikitakhairnar607@gmail.com', NULL, '$2b$12$uBF1LJUY1UKQmta/gXvFPO3TLX2.YHsF/0UXwXPFjjbIlW/zk9P.6', 1, '2026-09-26 08:50:40', 'at post pune', 0.00, '2026-09-22 13:32:54'),
('ad94ffc4-1d89-48c3-a097-e11260977e6d', 'Test Ledger Customer 1994', '9876543210', '', NULL, NULL, 1, NULL, '', 500.00, '2026-09-11 08:02:41'),
('ae1e5551-ca31-4bb1-9567-a788215c4df6', 'Ramesh Sharma', '9876543210', NULL, NULL, NULL, 1, NULL, NULL, 0.00, '2026-09-10 19:26:18'),
('b9244a3f-d542-46a9-abb6-1056759618e1', 'Anil Gupta', '9811223344', NULL, NULL, NULL, 1, NULL, NULL, 0.00, '2026-09-10 19:26:18'),
('d59f35d3-e9c4-49f0-8056-7c3eaf40b08c', 'AssaultBaaz Gaming', '08340450922', '', NULL, NULL, 1, NULL, 'ULAO WARD NO 03, NORTH OF SUDHANSHU COLD STORAGE ROAD NO 02', 1000.00, '2026-09-10 20:38:42'),
('e1eb8f8e-3ec4-42b4-97f7-d44210dc2337', 'Manih', '8340450922', 'karandemadhuri41@gmail.com', NULL, '$2b$12$hah5W.qpj9aYazMS3so00ecUS8R31F/1deY6GFIm85rnQi8y/WeJy', 1, '2026-09-22 13:21:14', 'at post nashik', 0.00, '2026-09-22 13:21:14'),
('fc52e92f-922f-4f87-a064-8a3993faea5a', 'xyz', '9209816962', 'admin@gmail.com', NULL, NULL, 1, NULL, 'at post nashik', 0.00, '2026-09-22 12:56:04'),
('fdb55778-117f-42ba-9ae7-9afb05ff55a6', 'xyz', '9209816962', 'admin@gmail.com', NULL, NULL, 1, NULL, 'at post nashik', 0.00, '2026-09-19 12:36:28');

-- --------------------------------------------------------

--
-- Table structure for table `customer_ledger`
--

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customer_ledger`
--

INSERT INTO `customer_ledger` (`id`, `customer_id`, `transaction_type`, `reference_id`, `reference_number`, `amount`, `balance_after`, `payment_mode`, `notes`, `created_by`, `created_at`) VALUES
('140a9892-00cc-4ab4-be4d-9c4782d411ae', '69ac5cb6-25fe-4972-a68a-1b4ea337f45f', 'SALE_DEBIT', '46bd3f24-8de5-4168-9fdf-e169b2b0dfcb', 'INV-20260911-0008', 65.00, 65.00, 'Split Credit', 'Credit sale on invoice INV-20260911-0008 (Cash: ₹100.00 | UPI: ₹100.00 | Due/Khata: ₹65.00)', 'Store Admin', '2026-09-11 08:41:54'),
('2a2be506-2b47-4c75-b1c4-7e335ee76bf1', '04c6d377-20c8-41b9-ad4e-3427a56b50cb', 'PAYMENT_CREDIT', '2a2be506-2b47-4c75-b1c4-7e335ee76bf1', 'RCP-20260911-0001', 200.00, 300.00, 'UPI', 'Partial payment of dues', 'Store Admin', '2026-09-11 08:07:10');

-- --------------------------------------------------------

--
-- Table structure for table `delivery_zones`
--

CREATE TABLE `delivery_zones` (
  `id` char(36) NOT NULL,
  `zone_name` varchar(150) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `place` varchar(150) NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `delivery_available` tinyint(1) NOT NULL DEFAULT 1,
  `delivery_fee` decimal(10,2) NOT NULL DEFAULT 0.00,
  `min_order_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estimated_minutes` int(11) NOT NULL DEFAULT 60,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `delivery_zones`
--

INSERT INTO `delivery_zones` (`id`, `zone_name`, `pincode`, `place`, `city`, `state`, `delivery_available`, `delivery_fee`, `min_order_amount`, `estimated_minutes`, `created_at`, `updated_at`) VALUES
('f467c736-b675-11f1-b7fc-e4a8dfb7418f', 'Niphad', '422303', 'Niphad', 'Niphad', 'Maharashtra', 1, 20.00, 200.00, 30, '2026-09-22 11:08:35', '2026-09-22 11:43:15'),
('f467d6a1-b675-11f1-b7fc-e4a8dfb7418f', 'Lasalgaon', '422305', 'Lasalgaon', 'Niphad', 'Maharashtra', 1, 30.00, 200.00, 45, '2026-09-22 11:08:35', '2026-09-22 11:42:41'),
('f467d77d-b675-11f1-b7fc-e4a8dfb7418f', 'Yeola', '422304', 'Yeola', 'Nashik', 'Maharashtra', 0, 30.00, 200.00, 45, '2026-09-22 11:08:35', '2026-09-22 11:42:38');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` char(36) NOT NULL,
  `title` varchar(180) NOT NULL,
  `category` varchar(80) NOT NULL DEFAULT 'Miscellaneous',
  `amount` decimal(12,2) NOT NULL,
  `expense_date` date NOT NULL,
  `payment_mode` varchar(30) NOT NULL DEFAULT 'Cash',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `title`, `category`, `amount`, `expense_date`, `payment_mode`, `notes`, `created_at`) VALUES
('31536274-c352-4a02-9d26-ce37b102cc29', 'maggi', 'Maintenance', 100.00, '2026-09-28', 'Cash', '', '2026-09-28 11:49:17');

-- --------------------------------------------------------

--
-- Table structure for table `expense_categories`
--

CREATE TABLE `expense_categories` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expense_categories`
--

INSERT INTO `expense_categories` (`id`, `name`, `description`, `is_active`, `created_at`) VALUES
('e997be0d-b1c3-11f1-a596-e4a8dfb7418f', 'Rent & Utilities', 'Shop rent, electricity, water and utility expenses', 1, '2026-09-16 11:44:02'),
('e999f314-b1c3-11f1-a596-e4a8dfb7418f', 'Staff Salary', 'Staff salary and employee related expenses', 1, '2026-09-16 11:44:02'),
('e999f4ea-b1c3-11f1-a596-e4a8dfb7418f', 'Transportation', 'Transport and delivery expenses', 1, '2026-09-16 11:44:02'),
('e999f597-b1c3-11f1-a596-e4a8dfb7418f', 'Packaging & Bags', 'Bags, boxes and packaging material', 1, '2026-09-16 11:44:02'),
('e999f611-b1c3-11f1-a596-e4a8dfb7418f', 'Maintenance', 'Shop and equipment maintenance', 1, '2026-09-16 11:44:02'),
('e999f67f-b1c3-11f1-a596-e4a8dfb7418f', 'Tea & Refreshments', 'Tea, coffee and refreshments', 1, '2026-09-16 11:44:02'),
('e999f740-b1c3-11f1-a596-e4a8dfb7418f', 'General Miscellaneous', 'Other general expenses', 1, '2026-09-16 11:44:02');

-- --------------------------------------------------------

--
-- Table structure for table `online_orders`
--

CREATE TABLE `online_orders` (
  `id` varchar(36) NOT NULL,
  `customer_id` char(36) DEFAULT NULL,
  `order_number` varchar(50) NOT NULL,
  `customer_name` varchar(150) NOT NULL,
  `customer_phone` varchar(30) NOT NULL,
  `customer_address` text NOT NULL,
  `items_json` text NOT NULL,
  `total_amount` decimal(12,2) NOT NULL,
  `payment_method` varchar(40) DEFAULT 'Cash on Delivery',
  `status` enum('Pending','Accepted','Packed','Out for Delivery','Delivered','Cancelled') DEFAULT 'Pending',
  `assigned_rider` varchar(100) DEFAULT NULL,
  `customer_lat` decimal(10,7) DEFAULT NULL,
  `customer_lng` decimal(10,7) DEFAULT NULL,
  `customer_location_updated_at` datetime DEFAULT NULL,
  `rider_lat` decimal(10,7) DEFAULT NULL,
  `rider_lng` decimal(10,7) DEFAULT NULL,
  `rider_accuracy` decimal(10,2) DEFAULT NULL,
  `rider_location_updated_at` datetime DEFAULT NULL,
  `packed_at` datetime DEFAULT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `sale_id` varchar(36) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `online_orders`
--

INSERT INTO `online_orders` (`id`, `customer_id`, `order_number`, `customer_name`, `customer_phone`, `customer_address`, `items_json`, `total_amount`, `payment_method`, `status`, `assigned_rider`, `packed_at`, `delivered_at`, `sale_id`, `notes`, `created_at`) VALUES
('43f796ea-eba7-41de-bfd8-f54dde7261a9', 'd59f35d3-e9c4-49f0-8056-7c3eaf40b08c', 'WEB-433633', 'AssaultBaaz Gaming', '08340450922', 'ULAO WARD NO 03, NORTH OF SUDHANSHU COLD STORAGE ROAD NO 02', '[{\"product_id\":\"1a7991ff-2b04-4e3e-abfe-271c296a73a1\",\"name\":\"Aashirvaad Shudh Chakki Atta 5kg\",\"category\":\"Atta & Flours\",\"selling_price\":265,\"unit\":\"bag\",\"quantity\":1,\"barcode\":\"8901030383182\"},{\"product_id\":\"c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e\",\"name\":\"Amul Butter Pasteurised 500g\",\"category\":\"Dairy & Eggs\",\"selling_price\":275,\"unit\":\"pcs\",\"quantity\":1,\"barcode\":\"8901262020015\"}]', 540.00, 'UPI on Delivery', 'Delivered', NULL, NULL, NULL, NULL, 'Slot: Express 2-Hour Delivery', '2026-09-10 20:22:42'),
('45e8bb4f-38bb-4167-9dc0-7aa36e106910', NULL, 'WEB-159082', 'manish', '000000000', 'at post nashik (Landmark: SBI bank)', '[{\"product_id\":\"c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e\",\"name\":\"Amul Butter Pasteurised 500g\",\"category\":\"Dairy & Eggs\",\"barcode\":\"8901262020015\",\"selling_price\":275,\"unit\":\"pcs\",\"quantity\":1,\"line_total\":275},{\"product_id\":\"64cf2639-db39-4063-bfa3-065fef3d58a0\",\"name\":\"Tata Salt Vaccum Evaporated 1kg\",\"category\":\"Spices & Seasoning\",\"barcode\":\"8901058852332\",\"selling_price\":28,\"unit\":\"packet\",\"quantity\":1,\"line_total\":28}]', 343.00, 'Cash on Delivery', 'Accepted', NULL, NULL, NULL, NULL, 'Slot: Express 2-Hour Delivery', '2026-09-22 13:22:22'),
('55568b54-a05a-425c-b34c-d99356f3bde8', NULL, 'WEB-138042', 'xyz', '9209816962', 'at post niphad', '[{\"product_id\":\"1a7991ff-2b04-4e3e-abfe-271c296a73a1\",\"name\":\"Aashirvaad Shudh Chakki Atta 5kg\",\"category\":\"Atta & Flours\",\"barcode\":\"8901030383182\",\"selling_price\":265,\"unit\":\"bag\",\"quantity\":1,\"line_total\":265}]', 305.00, 'Cash on Delivery', 'Pending', NULL, NULL, NULL, NULL, 'Slot: Express 2-Hour Delivery', '2026-09-26 10:23:02'),
('66d09a75-6059-4391-8705-0116a733168b', NULL, 'WEB-248415', 'Rahul Sharma', '9876543210', 'Flat 402, Green Avenue, City', '[{\"product_id\":\"prod-001\",\"name\":\"Aashirvaad Shudh Chakki Atta 5kg\",\"selling_price\":245,\"quantity\":1,\"unit\":\"kg\"}]', 245.00, 'Cash on Delivery', 'Delivered', NULL, NULL, NULL, NULL, 'Call before delivery', '2026-09-10 19:57:28'),
('78455e64-8bde-4ef4-a912-f102ccee4594', 'a94b08f6-d1d1-4e8e-bef9-7e1b17fc9b4e', 'WEB-312988', 'nikita', '9923144302', 'at post niphad (Landmark: .)', '[{\"product_id\":\"1a7991ff-2b04-4e3e-abfe-271c296a73a1\",\"name\":\"Aashirvaad Shudh Chakki Atta 5kg\",\"category\":\"Atta & Flours\",\"barcode\":\"8901030383182\",\"selling_price\":265,\"unit\":\"bag\",\"quantity\":1,\"line_total\":265},{\"product_id\":\"c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e\",\"name\":\"Amul Butter Pasteurised 500g\",\"category\":\"Dairy & Eggs\",\"barcode\":\"8901262020015\",\"selling_price\":275,\"unit\":\"pcs\",\"quantity\":1,\"line_total\":275}]', 540.00, 'Cash on Delivery', 'Cancelled', NULL, NULL, NULL, NULL, 'Slot: Express 2-Hour Delivery', '2026-09-24 11:22:42'),
('fe0d282e-0e2e-4616-b65f-1b180f5936dc', 'a94b08f6-d1d1-4e8e-bef9-7e1b17fc9b4e', 'WEB-263630', 'nikita khairnar', '9923144302', 'at post pune', '[{\"product_id\":\"c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e\",\"name\":\"Amul Butter Pasteurised 500g\",\"category\":\"Dairy & Eggs\",\"barcode\":\"8901262020015\",\"selling_price\":275,\"unit\":\"pcs\",\"quantity\":1,\"line_total\":275}]', 315.00, 'Cash on Delivery', 'Cancelled', NULL, NULL, NULL, NULL, 'Slot: Express 2-Hour Delivery', '2026-09-22 14:19:12');

-- --------------------------------------------------------

--
-- Table structure for table `payroll`
--

CREATE TABLE `payroll` (
  `id` varchar(36) NOT NULL,
  `staff_id` varchar(36) NOT NULL,
  `salary_amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `payment_date` date NOT NULL,
  `month` varchar(20) NOT NULL,
  `payment_status` enum('Paid','Pending') DEFAULT 'Pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

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
  `mfg_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `unit` varchar(20) NOT NULL DEFAULT 'pcs',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `barcode`, `purchase_price`, `selling_price`, `quantity`, `min_stock_level`, `supplier_id`, `supplier_name`, `mfg_date`, `expiry_date`, `unit`, `created_at`, `updated_at`) VALUES
('18d59632-e5c4-4278-bc40-e9549cc37052', 'Surf Excel Quick Wash Detergent 1kg', 'Household Care', '8901030701023', 155.00, 190.00, 45.000, 5.000, NULL, '', NULL, NULL, 'packet', '2026-09-10 19:26:17', '2026-09-10 19:26:17'),
('1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', 'Atta & Flours', '8901030383182', 40.00, 265.00, 6.000, 5.000, NULL, '', NULL, NULL, 'bag', '2026-09-10 19:26:17', '2026-09-26 12:12:37'),
('2b89f117-77e7-46b6-9a07-6c3012f01f34', 'Maggi 2-Minute Instant Noodles 280g', 'Snacks & Instant Food', '8901058841022', 45.00, 56.00, 58.000, 5.000, NULL, '', NULL, NULL, 'packet', '2026-09-10 19:26:17', '2026-09-15 03:46:07'),
('46c44620-5504-4302-ad61-c81d22439746', 'Tata Tea Gold 500g', 'Beverages', '8901058860016', 280.00, 340.00, 30.000, 5.000, NULL, '', NULL, NULL, 'packet', '2026-09-10 19:26:17', '2026-09-10 19:26:17'),
('64cf2639-db39-4063-bfa3-065fef3d58a0', 'Tata Salt Vaccum Evaporated 1kg', 'Spices & Seasoning', '8901058852332', 22.00, 28.00, 99.000, 5.000, NULL, '', NULL, NULL, 'packet', '2026-09-10 19:26:17', '2026-09-22 13:22:56'),
('729a8e95-9588-4708-bc0b-f9af77103742', 'Fresh Amul Taaza Milk 1L', 'Dairy', '8901262010012', 30.00, 34.00, 24.000, 5.000, NULL, '', '2026-09-10', '2026-09-13', 'packet', '2026-09-11 09:04:54', '2026-09-18 09:36:29'),
('8a061b2f-da34-47a2-89dd-b203d3f11ddc', 'Dettol Original Soap 125g (Pack of 3)', 'Personal Care', '8901396312017', 110.00, 140.00, 0.000, 5.000, NULL, '', NULL, NULL, 'pack', '2026-09-10 19:26:17', '2026-09-11 15:02:03'),
('b2ebb3be-b2aa-4fc9-b38b-8344f3a2ef1f', 'India Gate Basmati Rice Feast 1kg', 'Rice & Grains', '8901262010047', 95.00, 130.00, 39.000, 5.000, NULL, '', NULL, NULL, 'kg', '2026-09-10 19:26:17', '2026-09-11 15:01:50'),
('c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', 'Dairy & Eggs', '8901262020015', 240.00, 275.00, 5.000, 5.000, NULL, '', NULL, NULL, 'pcs', '2026-09-10 19:26:17', '2026-09-26 13:05:30'),
('c4e7742b-b837-4726-91f2-137715748309', 'Fortune Sunlite Sunflower Oil 1L', 'Oils & Ghee', '8906007281014', 115.00, 145.00, 43.000, 5.000, NULL, '', NULL, NULL, 'packet', '2026-09-10 19:26:17', '2026-09-21 09:50:22'),
('cd47f421-8442-425c-91ed-e1a8aa5dbfb4', 'Parle-G Gold Biscuits 1kg', 'Biscuits & Cookies', '8901719101018', 90.00, 120.00, 2.000, 5.000, NULL, '', NULL, NULL, 'pack', '2026-09-10 19:26:18', '2026-09-11 15:01:40');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchases`
--

INSERT INTO `purchases` (`id`, `purchase_number`, `supplier_id`, `supplier_name`, `supplier_invoice_number`, `total_amount`, `payment_status`, `payment_mode`, `notes`, `created_by`, `created_at`) VALUES
('0af0effc-ca77-4382-95d5-1eded42038f5', 'PO-20260921-0001', NULL, 'General Supplier', 'PUR-309040', 40.00, 'Paid', 'Cash', '', 'Store Admin', '2026-09-21 16:31:53'),
('4ed03414-f4c4-4fb0-b97f-6be15597f2f5', 'PO-20260911-0002', NULL, 'General Supplier', 'TEST-PO-7813', 400.00, 'Paid', 'Cash', 'Automated test goods inward', 'Store Admin', '2026-09-11 07:57:47'),
('5e803db8-3a07-40d4-a89d-2df2ebe0a573', 'PO-20260911-0001', NULL, 'General Supplier', 'TEST-PO-5857', 400.00, 'Paid', 'Cash', 'Automated test goods inward', 'Store Admin', '2026-09-11 07:52:35'),
('c76164e4-62db-486d-8d0e-ad9f84af9f0a', 'PO-20260911-0004', NULL, 'General Supplier', 'TEST-PO-0501', 400.00, 'Paid', 'Cash', 'Automated test goods inward', 'Store Admin', '2026-09-11 08:07:10'),
('fa13e068-a8f5-4958-9ca7-c90402f533ca', 'PO-20260911-0003', NULL, 'General Supplier', 'TEST-PO-1948', 400.00, 'Paid', 'Cash', 'Automated test goods inward', 'Store Admin', '2026-09-11 08:02:41');

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` varchar(36) NOT NULL,
  `purchase_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_cost` decimal(10,2) NOT NULL,
  `total_cost` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `purchase_items`
--

INSERT INTO `purchase_items` (`id`, `purchase_id`, `product_id`, `product_name`, `quantity`, `unit_cost`, `total_cost`) VALUES
('1bef9b86-3b1b-44fd-b5a0-5281bb218970', '4ed03414-f4c4-4fb0-b97f-6be15597f2f5', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', 10.00, 40.00, 400.00),
('5ed27934-946f-4fe0-8287-32ceed43c313', 'c76164e4-62db-486d-8d0e-ad9f84af9f0a', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', 10.00, 40.00, 400.00),
('9430ea6c-a791-4d92-ab64-108ba20b6331', '5e803db8-3a07-40d4-a89d-2df2ebe0a573', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', 10.00, 40.00, 400.00),
('cb383fbf-d472-4bb6-a9ac-a160d14fbe01', '0af0effc-ca77-4382-95d5-1eded42038f5', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', 1.00, 40.00, 40.00),
('f5001e15-f721-48e0-b160-02451a966660', 'fa13e068-a8f5-4958-9ca7-c90402f533ca', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', 10.00, 40.00, 400.00);

-- --------------------------------------------------------

--
-- Table structure for table `returns`
--

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `returns`
--

INSERT INTO `returns` (`id`, `return_number`, `sale_id`, `invoice_number`, `customer_id`, `customer_name`, `total_refund_amount`, `refund_mode`, `reason`, `processed_by`, `created_at`) VALUES
('04e4cefd-77db-4539-b5e6-f031c0b6ecc3', 'RET-20260926-0006', 'd597ec5f-96c0-4ec4-b13c-9ff79c8e0afd', 'INV-20260926-0009', NULL, 'Walk-in Customer', 0.00, 'Cash', 'Customer Changed Mind', 'Store Admin', '2026-09-26 13:11:35'),
('26dba4a6-1713-474a-b7ef-3dcf352b2862', 'RET-20260926-0005', 'c86bccb1-2108-4f11-b57b-262c057b7590', 'INV-20260926-0010', NULL, 'Walk-in Customer', 0.00, 'Cash', 'Customer Changed Mind', 'Store Admin', '2026-09-26 13:06:42'),
('7ce68635-072f-4d75-a438-dec9011ed890', 'RET-20260911-0001', 'bb3557af-97c1-40e9-a6fb-3bd665296ca1', 'INV-20260911-0005', NULL, 'Test Walk-in', 265.00, 'Cash', 'Customer Changed Mind', 'Store Admin', '2026-09-11 08:02:41'),
('9deb5e65-6f10-4f81-bab0-b64e0fffc1cf', 'RET-20260926-0003', '60eb4cbf-e3fb-466b-8146-ba8d92dbc1d8', 'INV-20260926-0008', NULL, 'Walk-in Customer', 0.00, 'Cash', 'Customer Changed Mind', 'Store Admin', '2026-09-26 12:56:27'),
('b9e44895-d737-4f4c-a6c2-d0babc6ccb3c', 'RET-20260926-0001', 'ce99b877-dd70-4e1c-a045-1349b9380b09', 'INV-20260911-0007', NULL, 'Walk-in Customer', 0.00, 'Cash', 'Customer Changed Mind', 'Store Admin', '2026-09-26 12:28:28'),
('db95a4db-660f-4bd0-8d8b-1b4623a7d78e', 'RET-20260926-0004', '60eb4cbf-e3fb-466b-8146-ba8d92dbc1d8', 'INV-20260926-0008', NULL, 'Walk-in Customer', 0.00, 'Cash', 'Customer Changed Mind', 'Store Admin', '2026-09-26 13:04:53'),
('dd48fd7d-270e-451f-9e58-33f2943f58b9', 'RET-20260926-0002', '26c21aca-028d-4b3e-a1ff-5bee4ebc073b', 'INV-20260926-0005', NULL, 'Walk-in Customer', 0.00, 'Cash', 'Customer Changed Mind', 'Store Admin', '2026-09-26 12:42:19'),
('f4bbc40a-df1b-46a3-9dc1-ec474a3f1fa9', 'RET-20260911-0002', '13d686dc-c7b9-4c72-83f0-bd53278d8753', 'INV-20260911-0006', NULL, 'Test Walk-in', 265.00, 'Cash', 'Customer Changed Mind', 'Store Admin', '2026-09-11 08:07:10');

-- --------------------------------------------------------

--
-- Table structure for table `return_items`
--

CREATE TABLE `return_items` (
  `id` varchar(36) NOT NULL,
  `return_id` varchar(36) NOT NULL,
  `product_id` varchar(36) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `quantity` decimal(10,2) NOT NULL,
  `unit_price` decimal(10,2) NOT NULL,
  `total_refund` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `return_items`
--

INSERT INTO `return_items` (`id`, `return_id`, `product_id`, `product_name`, `quantity`, `unit_price`, `total_refund`) VALUES
('04b20353-f229-4d00-9b3b-57604a930be3', 'dd48fd7d-270e-451f-9e58-33f2943f58b9', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', 1.00, 0.00, 0.00),
('2192c507-acdd-4b65-abed-3ff15320f260', '7ce68635-072f-4d75-a438-dec9011ed890', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', 1.00, 265.00, 265.00),
('7a046209-642d-4275-9bc0-3dc414c7b90e', 'f4bbc40a-df1b-46a3-9dc1-ec474a3f1fa9', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', 1.00, 265.00, 265.00),
('be8a32aa-e917-4f89-9ea4-e05b1dd71182', 'db95a4db-660f-4bd0-8d8b-1b4623a7d78e', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', 1.00, 0.00, 0.00),
('c5074aeb-2aae-407e-a055-3fd618c9796a', 'b9e44895-d737-4f4c-a6c2-d0babc6ccb3c', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', 1.00, 0.00, 0.00),
('d1c07c73-348a-4b21-b9a8-b6ac95330ce3', '04e4cefd-77db-4539-b5e6-f031c0b6ecc3', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', 1.00, 0.00, 0.00),
('dd36c1a0-116d-46e0-98b7-12c175e613b5', '9deb5e65-6f10-4f81-bab0-b64e0fffc1cf', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', 1.00, 0.00, 0.00),
('ffd6ee69-1c94-4355-9b27-0f086ef304ee', '26dba4a6-1713-474a-b7ef-3dcf352b2862', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', 1.00, 0.00, 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

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
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `invoice_number`, `customer_id`, `customer_name`, `cashier_id`, `cashier_name`, `shift_id`, `payment_mode`, `subtotal`, `tax_percent`, `tax_amount`, `discount_amount`, `total_amount`, `received_amount`, `change_amount`, `status`, `return_status`, `created_at`) VALUES
('13d686dc-c7b9-4c72-83f0-bd53278d8753', 'INV-20260911-0006', NULL, 'Test Walk-in', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 530.00, 0.00, 0.00, 0.00, 530.00, 530.00, 0.00, 'Completed', '', '2026-09-11 08:07:10'),
('2133783d-1d44-46fb-bcd0-8e7c974486f8', 'INV-20260926-0002', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 540.00, 0.00, 0.00, 0.00, 540.00, 540.00, 0.00, 'Completed', 'None', '2026-09-26 10:27:34'),
('245eb7d3-a28e-46a9-9cba-6a2435e26a1d', 'INV-20260912-0003', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Card', 145.00, 0.00, 0.00, 0.00, 145.00, 145.00, 0.00, 'Completed', 'None', '2026-09-12 10:22:50'),
('26c21aca-028d-4b3e-a1ff-5bee4ebc073b', 'INV-20260926-0005', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 275.00, 0.00, 0.00, 0.00, 275.00, 275.00, 0.00, 'Completed', '', '2026-09-26 11:45:01'),
('292a7637-f7a5-49f8-984e-3ee22988954c', 'INV-20260914-0002', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 275.00, 0.00, 0.00, 0.00, 275.00, 275.00, 0.00, 'Completed', 'None', '2026-09-14 09:27:15'),
('376377b7-5bf3-4d70-8a8f-ff16fe551a60', 'INV-20260918-0002', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 275.00, 0.00, 0.00, 0.00, 275.00, 275.00, 0.00, 'Completed', 'None', '2026-09-18 09:36:23'),
('3d45ae4d-b9cb-485c-9166-388a66dbd836', 'INV-20260921-0003', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Card', 145.00, 0.00, 0.00, 0.00, 145.00, 145.00, 0.00, 'Completed', 'None', '2026-09-21 09:50:22'),
('3ee64023-f591-41c0-8889-e7ffb31a2147', 'INV-20260926-0004', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 275.00, 0.00, 0.00, 0.00, 275.00, 275.00, 0.00, 'Completed', 'None', '2026-09-26 11:28:09'),
('3f9335e8-1ff0-4316-9b40-5439b5489d29', 'INV-20260918-0001', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 265.00, 0.00, 0.00, 0.00, 265.00, 265.00, 0.00, 'Completed', 'None', '2026-09-18 09:36:17'),
('4658ccff-90f8-4623-a176-4d82da7153ab', 'INV-20260917-0001', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 530.00, 0.00, 0.00, 0.00, 530.00, 530.00, 0.00, 'Completed', 'None', '2026-09-17 09:09:58'),
('46bd3f24-8de5-4168-9fdf-e169b2b0dfcb', 'INV-20260911-0008', '69ac5cb6-25fe-4972-a68a-1b4ea337f45f', 'Split Pay Customer 4274', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, '', 265.00, 0.00, 0.00, 0.00, 265.00, 265.00, 0.00, 'Completed', 'None', '2026-09-11 08:41:54'),
('48340b13-5ea8-453a-8f56-fd947e7dd71a', 'INV-20260912-0002', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 275.00, 0.00, 0.00, 0.00, 275.00, 275.00, 0.00, 'Completed', 'None', '2026-09-12 10:22:43'),
('49c3fb2f-7a03-41b8-915e-ce4fca4990f5', 'INV-20260921-0002', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 550.00, 0.00, 0.00, 0.00, 550.00, 550.00, 0.00, 'Completed', 'None', '2026-09-21 09:50:16'),
('5c95564c-940a-483e-988f-c0f5b10e81b8', 'INV-20260914-0001', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 265.00, 0.00, 0.00, 0.00, 265.00, 265.00, 0.00, 'Completed', 'None', '2026-09-14 09:27:08'),
('60eb4cbf-e3fb-466b-8146-ba8d92dbc1d8', 'INV-20260926-0008', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 275.00, 0.00, 0.00, 0.00, 275.00, 275.00, 0.00, 'Completed', '', '2026-09-26 12:08:01'),
('6c9b1133-f7f0-4831-8df0-b055a33adab1', 'INV-20260912-0001', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 265.00, 0.00, 0.00, 0.00, 265.00, 265.00, 0.00, 'Completed', 'None', '2026-09-12 10:22:36'),
('7170ec83-bf99-4b1b-bf02-5433e738d0d5', 'INV-20260916-0002', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 275.00, 0.00, 0.00, 0.00, 275.00, 275.00, 0.00, 'Completed', 'None', '2026-09-16 08:46:46'),
('74d52ea6-ce93-45ca-837d-d36663ff7aec', 'INV-20260915-0001', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 265.00, 0.00, 0.00, 0.00, 265.00, 265.00, 0.00, 'Completed', 'None', '2026-09-15 03:45:53'),
('7a9be4d4-4211-4e3c-b4ed-03c82e92122e', 'INV-20260911-0011', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 130.00, 0.00, 0.00, 0.00, 130.00, 130.00, 0.00, 'Completed', 'None', '2026-09-11 15:01:50'),
('7be37eaf-def0-432f-a0a0-40291243027c', 'INV-20260921-0001', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 265.00, 0.00, 0.00, 0.00, 265.00, 265.00, 0.00, 'Completed', 'None', '2026-09-21 09:50:06'),
('8117f6a1-1807-4e27-b27a-2bab4b1eb57c', 'INV-20260926-0007', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 265.00, 0.00, 0.00, 0.00, 265.00, 265.00, 0.00, 'Completed', 'None', '2026-09-26 12:04:46'),
('866b643d-897c-4187-8ad5-97bc38825fb2', 'INV-20260911-0012', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Card', 280.00, 0.00, 0.00, 0.00, 280.00, 280.00, 0.00, 'Completed', 'None', '2026-09-11 15:02:03'),
('879cc8a4-ce7b-4692-b2fa-45beb29a1f4c', 'INV-20260919-0002', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 275.00, 0.00, 0.00, 0.00, 275.00, 275.00, 0.00, 'Completed', 'None', '2026-09-19 09:02:46'),
('8ad75379-57f5-43bc-ac4a-6b44cc74a808', 'INV-20260915-0003', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Card', 56.00, 0.00, 0.00, 0.00, 56.00, 56.00, 0.00, 'Completed', 'None', '2026-09-15 03:46:07'),
('906e9209-579f-4306-99a1-d4db5c50e979', 'INV-20260911-0003', NULL, 'Test Walk-in', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 530.00, 0.00, 0.00, 0.00, 530.00, 530.00, 0.00, 'Completed', 'None', '2026-09-11 07:52:35'),
('911c3530-40b3-4a94-9373-67ff0df70e71', 'INV-20260911-0004', NULL, 'Test Walk-in', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 530.00, 0.00, 0.00, 0.00, 530.00, 530.00, 0.00, 'Completed', 'None', '2026-09-11 07:57:47'),
('939e7aa1-ecb9-4a04-8f0d-66cd62cfadc0', 'INV-20260915-0002', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 275.00, 0.00, 0.00, 0.00, 275.00, 275.00, 0.00, 'Completed', 'None', '2026-09-15 03:45:59'),
('9e157fd4-7cf2-43cc-a9fc-11584875c8b8', 'INV-20260919-0003', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Card', 145.00, 0.00, 0.00, 0.00, 145.00, 145.00, 0.00, 'Completed', 'None', '2026-09-19 09:02:51'),
('a2beb3bb-3361-4187-a3f8-fb97e69efc6d', 'INV-20260916-0003', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Card', 145.00, 0.00, 0.00, 0.00, 145.00, 145.00, 0.00, 'Completed', 'None', '2026-09-16 08:46:53'),
('b7f92b19-0bab-4b75-bbf1-2a4427bc90a4', 'INV-2026-0002', NULL, 'Walk-in Customer', NULL, 'Staff', NULL, 'Cash', 530.00, 0.00, 0.00, 0.00, 530.00, 530.00, 0.00, 'Completed', 'None', '2026-09-10 19:40:09'),
('bb3557af-97c1-40e9-a6fb-3bd665296ca1', 'INV-20260911-0005', NULL, 'Test Walk-in', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 530.00, 0.00, 0.00, 0.00, 530.00, 530.00, 0.00, 'Completed', '', '2026-09-11 08:02:41'),
('bdd68b57-1078-4273-92b5-6b32f47318c2', 'INV-20260926-0001', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 265.00, 0.00, 0.00, 0.00, 265.00, 265.00, 0.00, 'Completed', 'None', '2026-09-26 10:14:39'),
('c22e54c4-0659-4079-a43b-b2a6fa3ba14c', 'INV-20260918-0003', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Card', 34.00, 0.00, 0.00, 0.00, 34.00, 34.00, 0.00, 'Completed', 'None', '2026-09-18 09:36:29'),
('c6b5ff4a-684b-4bd5-89fa-6811921596a0', 'INV-20260911-0013', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 265.00, 0.00, 0.00, 0.00, 265.00, 265.00, 0.00, 'Completed', 'None', '2026-09-11 16:03:11'),
('c75066f7-ea09-4432-ac55-d54b8de1c896', 'INV-20260916-0001', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 265.00, 0.00, 0.00, 0.00, 265.00, 265.00, 0.00, 'Completed', 'None', '2026-09-16 08:46:39'),
('c7d5197e-76ac-4a2c-917f-058069b07bbe', 'INV-20260911-0010', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 176.00, 0.00, 0.00, 0.00, 176.00, 176.00, 0.00, 'Completed', 'None', '2026-09-11 15:01:40'),
('c86bccb1-2108-4f11-b57b-262c057b7590', 'INV-20260926-0010', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 275.00, 0.00, 0.00, 0.00, 275.00, 275.00, 0.00, 'Completed', '', '2026-09-26 13:05:30'),
('ce99b877-dd70-4e1c-a045-1349b9380b09', 'INV-20260911-0007', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 265.00, 0.00, 0.00, 0.00, 265.00, 265.00, 0.00, 'Completed', '', '2026-09-11 08:37:58'),
('cf0ebfdd-5c0c-4d31-a7ab-085985531dfa', 'INV-20260926-0003', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 275.00, 0.00, 0.00, 0.00, 275.00, 275.00, 0.00, 'Completed', 'None', '2026-09-26 11:28:01'),
('d118a840-7b42-489b-b45e-74fd63a1d79f', 'INV-20260911-0009', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 680.00, 0.00, 0.00, 0.00, 680.00, 680.00, 0.00, 'Completed', 'None', '2026-09-11 14:19:57'),
('d597ec5f-96c0-4ec4-b13c-9ff79c8e0afd', 'INV-20260926-0009', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 265.00, 0.00, 0.00, 0.00, 265.00, 265.00, 0.00, 'Completed', '', '2026-09-26 12:12:36'),
('d658388c-f6ac-4c13-b778-3737911ba996', 'INV-2026-0001', 'ae1e5551-ca31-4bb1-9567-a788215c4df6', 'Ramesh Sharma', NULL, 'Staff', NULL, 'Cash', 825.00, 0.00, 0.00, 0.00, 825.00, 825.00, 0.00, 'Completed', 'None', '2026-09-10 19:38:41'),
('dd96d8e8-d1d4-40d0-a04c-431ed2321a1f', 'INV-20260917-0003', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Card', 145.00, 0.00, 0.00, 0.00, 145.00, 145.00, 0.00, 'Completed', 'None', '2026-09-17 09:10:21'),
('e78fd877-454e-4991-931c-0d8faa3ab04e', 'INV-20260914-0003', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Card', 145.00, 0.00, 0.00, 0.00, 145.00, 145.00, 0.00, 'Completed', 'None', '2026-09-14 09:27:25'),
('e90cfeae-38a4-4dac-aa6d-25b106aff23d', 'INV-20260917-0002', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 275.00, 0.00, 0.00, 0.00, 275.00, 275.00, 0.00, 'Completed', 'None', '2026-09-17 09:10:16'),
('f2789923-62eb-404d-90ce-58dd986de1da', 'INV-20260919-0001', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 265.00, 0.00, 0.00, 0.00, 265.00, 265.00, 0.00, 'Completed', 'None', '2026-09-19 09:02:39'),
('f5cdf0e7-0344-4d4a-9c3b-e9684e3e9b59', 'INV-20260917-0004', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'Cash', 540.00, 0.00, 0.00, 0.00, 540.00, 540.00, 0.00, 'Completed', 'None', '2026-09-17 11:04:15'),
('f9baea6d-ac9c-4068-97d1-39dd7ae020fd', 'INV-20260926-0006', NULL, 'Walk-in Customer', 'ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', NULL, 'UPI', 275.00, 0.00, 0.00, 0.00, 275.00, 275.00, 0.00, 'Completed', 'None', '2026-09-26 11:57:32');

-- --------------------------------------------------------

--
-- Table structure for table `sale_items`
--

CREATE TABLE `sale_items` (
  `id` char(36) NOT NULL,
  `sale_id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `product_name` varchar(180) NOT NULL,
  `barcode` varchar(100) NOT NULL,
  `unit_purchase_price` decimal(12,2) NOT NULL,
  `unit_selling_price` decimal(12,2) NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `total_price` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `sale_items`
--

INSERT INTO `sale_items` (`id`, `sale_id`, `product_id`, `product_name`, `barcode`, `unit_purchase_price`, `unit_selling_price`, `quantity`, `total_price`) VALUES
('00dea0bb-d053-40db-881d-5ac0dc39c6aa', 'd658388c-f6ac-4c13-b778-3737911ba996', '8a061b2f-da34-47a2-89dd-b203d3f11ddc', 'Dettol Original Soap 125g (Pack of 3)', '8901396312017', 110.00, 140.00, 1.000, 140.00),
('09a5b0c6-0382-4d96-8fcc-575402c901da', '245eb7d3-a28e-46a9-9cba-6a2435e26a1d', 'c4e7742b-b837-4726-91f2-137715748309', 'Fortune Sunlite Sunflower Oil 1L', '8906007281014', 115.00, 145.00, 1.000, 145.00),
('0f3910d0-1b0b-4d1b-b5e9-40d391b46823', 'c6b5ff4a-684b-4bd5-89fa-6811921596a0', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('1136b26a-2975-4def-8f12-b7a8caef95d5', 'f2789923-62eb-404d-90ce-58dd986de1da', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('19a63805-75be-49c1-99c3-0d708a4f542b', 'd118a840-7b42-489b-b45e-74fd63a1d79f', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('1b6678d2-7c79-4d37-a00d-dc44f11317dc', 'c86bccb1-2108-4f11-b57b-262c057b7590', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('242a3a3c-d5a1-4204-b709-4829c392b0d2', '7170ec83-bf99-4b1b-bf02-5433e738d0d5', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('25f04db4-b149-4a60-963a-aad56caa5dc6', '60eb4cbf-e3fb-466b-8146-ba8d92dbc1d8', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('26b25c4e-e586-4026-ae6f-7d1cc9d20cb0', '939e7aa1-ecb9-4a04-8f0d-66cd62cfadc0', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('271b8a35-e0a9-4ef7-ae64-53dbdcae683d', 'd597ec5f-96c0-4ec4-b13c-9ff79c8e0afd', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('30ee8200-3cb1-41ff-8181-caf625b1cb77', 'c75066f7-ea09-4432-ac55-d54b8de1c896', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('33fed05a-12dc-430e-840a-37e90a7fa926', '3ee64023-f591-41c0-8889-e7ffb31a2147', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('37bb74f2-d8ec-40b6-aaff-00acf2caa30f', 'c7d5197e-76ac-4a2c-917f-058069b07bbe', 'cd47f421-8442-425c-91ed-e1a8aa5dbfb4', 'Parle-G Gold Biscuits 1kg', '8901719101018', 90.00, 120.00, 1.000, 120.00),
('3d493de0-fa33-4343-974f-bdc475332d10', '2133783d-1d44-46fb-bcd0-8e7c974486f8', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('3e671417-46c4-4b60-9ad7-76a714d78e94', 'f5cdf0e7-0344-4d4a-9c3b-e9684e3e9b59', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('3ef583f6-a0ff-4788-9aa4-df6b4ba62b00', '48340b13-5ea8-453a-8f56-fd947e7dd71a', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('3f9735c4-13a5-43c0-9e83-71910d897771', '4658ccff-90f8-4623-a176-4d82da7153ab', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 2.000, 530.00),
('3fd76b34-8940-432d-8fb3-ad40c09238f5', 'f9baea6d-ac9c-4068-97d1-39dd7ae020fd', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('4218e254-9e49-4ca5-b677-8904ec6cad75', '292a7637-f7a5-49f8-984e-3ee22988954c', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('44b126a7-b4e4-4346-b1dd-1360d1b99492', 'd658388c-f6ac-4c13-b778-3737911ba996', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('4a872154-f257-455f-a812-9ae469af533d', 'f5cdf0e7-0344-4d4a-9c3b-e9684e3e9b59', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('4c713c8b-af1b-454f-ad15-3dbc609212dc', '6c9b1133-f7f0-4831-8df0-b055a33adab1', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('56f015a3-a1d5-4669-96f7-503a7951120c', 'c7d5197e-76ac-4a2c-917f-058069b07bbe', '2b89f117-77e7-46b6-9a07-6c3012f01f34', 'Maggi 2-Minute Instant Noodles 280g', '8901058841022', 45.00, 56.00, 1.000, 56.00),
('58598f1e-f39d-44fb-a875-dbd124fad984', '13d686dc-c7b9-4c72-83f0-bd53278d8753', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 2.000, 530.00),
('5a33a543-8b9d-46ff-a497-eca264660d83', '8ad75379-57f5-43bc-ac4a-6b44cc74a808', '2b89f117-77e7-46b6-9a07-6c3012f01f34', 'Maggi 2-Minute Instant Noodles 280g', '8901058841022', 45.00, 56.00, 1.000, 56.00),
('5b55fd1a-30b7-42bb-9e6a-5622c1e4286f', '74d52ea6-ce93-45ca-837d-d36663ff7aec', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('5e9ad88e-b021-40f2-b70e-e4f6daf43b94', 'b7f92b19-0bab-4b75-bbf1-2a4427bc90a4', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 210.00, 265.00, 2.000, 530.00),
('6a77581e-b449-456d-bcaf-e97c44a493b1', 'dd96d8e8-d1d4-40d0-a04c-431ed2321a1f', 'c4e7742b-b837-4726-91f2-137715748309', 'Fortune Sunlite Sunflower Oil 1L', '8906007281014', 115.00, 145.00, 1.000, 145.00),
('6b5392fe-aabd-4627-9065-9c4a1fb83d81', '906e9209-579f-4306-99a1-d4db5c50e979', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 2.000, 530.00),
('6d67e5e3-a7aa-4478-a8fe-fd797fa0c110', 'a2beb3bb-3361-4187-a3f8-fb97e69efc6d', 'c4e7742b-b837-4726-91f2-137715748309', 'Fortune Sunlite Sunflower Oil 1L', '8906007281014', 115.00, 145.00, 1.000, 145.00),
('7bcb9fb2-366c-41c2-8d97-03306eccd683', 'd658388c-f6ac-4c13-b778-3737911ba996', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 210.00, 265.00, 1.000, 265.00),
('7cb0a7a7-6432-4b1d-b8ff-efe00df074c3', 'ce99b877-dd70-4e1c-a045-1349b9380b09', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('8191b919-85ed-4a35-b1cc-fa41ef2d8b05', '3d45ae4d-b9cb-485c-9166-388a66dbd836', 'c4e7742b-b837-4726-91f2-137715748309', 'Fortune Sunlite Sunflower Oil 1L', '8906007281014', 115.00, 145.00, 1.000, 145.00),
('83e912b5-467a-4618-b28e-210a26a4fc16', 'c22e54c4-0659-4079-a43b-b2a6fa3ba14c', '729a8e95-9588-4708-bc0b-f9af77103742', 'Fresh Amul Taaza Milk 1L', '8901262010012', 30.00, 34.00, 1.000, 34.00),
('8559ac6a-c9b1-410e-931c-e5aee4448b1a', '2133783d-1d44-46fb-bcd0-8e7c974486f8', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('87e9f492-fdd6-4010-beb4-1ab36b593800', 'bdd68b57-1078-4273-92b5-6b32f47318c2', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('8be5fe3d-e600-4b1a-a88c-63a46e41ecf8', 'bb3557af-97c1-40e9-a6fb-3bd665296ca1', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 2.000, 530.00),
('95f82237-7561-46b9-a990-3fec35596a95', '7a9be4d4-4211-4e3c-b4ed-03c82e92122e', 'b2ebb3be-b2aa-4fc9-b38b-8344f3a2ef1f', 'India Gate Basmati Rice Feast 1kg', '8901262010047', 95.00, 130.00, 1.000, 130.00),
('9662e8db-3d6e-4813-b420-57ba76e4f830', 'd118a840-7b42-489b-b45e-74fd63a1d79f', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('968b5260-c11c-4692-b913-d32b7e2a23cf', '49c3fb2f-7a03-41b8-915e-ce4fca4990f5', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 2.000, 550.00),
('a10449cd-dc01-4245-8922-70c61d51a2da', 'cf0ebfdd-5c0c-4d31-a7ab-085985531dfa', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('a4d2b031-4c85-47a8-9bca-0d664334a31e', 'd118a840-7b42-489b-b45e-74fd63a1d79f', '8a061b2f-da34-47a2-89dd-b203d3f11ddc', 'Dettol Original Soap 125g (Pack of 3)', '8901396312017', 110.00, 140.00, 1.000, 140.00),
('abd7ebfb-da62-4d9f-baff-9cdb7943d98c', 'e90cfeae-38a4-4dac-aa6d-25b106aff23d', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('b1717091-ca1f-4a8a-bf55-ee3e3f74ab39', '3f9335e8-1ff0-4316-9b40-5439b5489d29', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('bc85f5b7-25aa-4f05-a1cf-829f8a9f2bf3', '46bd3f24-8de5-4168-9fdf-e169b2b0dfcb', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('bdfcd1d9-8ab8-44c9-8f06-612a78e61870', '911c3530-40b3-4a94-9373-67ff0df70e71', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 2.000, 530.00),
('c33a1884-1f40-4f0c-b033-f64741f15aaa', '7be37eaf-def0-432f-a0a0-40291243027c', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('c7a0c1eb-2e38-4a27-8bfa-6b1fba439b8f', 'd658388c-f6ac-4c13-b778-3737911ba996', 'c4e7742b-b837-4726-91f2-137715748309', 'Fortune Sunlite Sunflower Oil 1L', '8906007281014', 115.00, 145.00, 1.000, 145.00),
('c7eb0447-9c07-4801-9a21-28461a2cb700', '866b643d-897c-4187-8ad5-97bc38825fb2', '8a061b2f-da34-47a2-89dd-b203d3f11ddc', 'Dettol Original Soap 125g (Pack of 3)', '8901396312017', 110.00, 140.00, 2.000, 280.00),
('d25e69b5-5eac-4e5a-9f97-73d321c0d286', '879cc8a4-ce7b-4692-b2fa-45beb29a1f4c', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('d2a60200-0157-41e1-9a77-fc6a07bd028d', '26c21aca-028d-4b3e-a1ff-5bee4ebc073b', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('e110438c-e390-428c-806b-eee4794e2dcb', '8117f6a1-1807-4e27-b27a-2bab4b1eb57c', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('e422a87a-112b-4034-a5d9-91b61dc95a15', '376377b7-5bf3-4d70-8a8f-ff16fe551a60', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'Amul Butter Pasteurised 500g', '8901262020015', 240.00, 275.00, 1.000, 275.00),
('e478e682-e15c-40dc-9959-cd7023a655ee', '5c95564c-940a-483e-988f-c0f5b10e81b8', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'Aashirvaad Shudh Chakki Atta 5kg', '8901030383182', 40.00, 265.00, 1.000, 265.00),
('f334f501-bbc8-4e7e-bd1b-d8ebf0181543', '9e157fd4-7cf2-43cc-a9fc-11584875c8b8', 'c4e7742b-b837-4726-91f2-137715748309', 'Fortune Sunlite Sunflower Oil 1L', '8906007281014', 115.00, 145.00, 1.000, 145.00),
('fd656a33-507b-4f31-b53f-badfd9736c81', 'e78fd877-454e-4991-931c-0d8faa3ab04e', 'c4e7742b-b837-4726-91f2-137715748309', 'Fortune Sunlite Sunflower Oil 1L', '8906007281014', 115.00, 145.00, 1.000, 145.00);

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

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
  `thermal_printer_size` varchar(10) DEFAULT '80mm',
  `auto_print_receipt` tinyint(1) DEFAULT 1,
  `receipt_header_note` varchar(255) DEFAULT 'TAX INVOICE / CASH MEMO',
  `receipt_footer_note` text DEFAULT NULL,
  `show_upi_qr_on_receipt` tinyint(1) DEFAULT 1,
  `show_barcode_on_receipt` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `shop_name`, `owner_name`, `phone`, `address`, `gst_number`, `currency_symbol`, `default_tax_percent`, `low_stock_threshold`, `upi_id`, `updated_at`, `thermal_printer_size`, `auto_print_receipt`, `receipt_header_note`, `receipt_footer_note`, `show_upi_qr_on_receipt`, `show_barcode_on_receipt`) VALUES
(1, 'Green Grocery & Retail Store', '', '', NULL, NULL, '₹', 0.00, 10, NULL, '2026-09-10 19:26:17', '80mm', 1, 'TAX INVOICE / CASH MEMO', NULL, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(50) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `marital_status` varchar(30) DEFAULT NULL,
  `father_name` varchar(100) DEFAULT NULL,
  `mother_name` varchar(100) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `emergency_contact` varchar(20) DEFAULT NULL,
  `user_id` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `role` varchar(100) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `qualification` varchar(150) DEFAULT NULL,
  `work_experience` varchar(100) DEFAULT NULL,
  `contract_type` varchar(50) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT 0.00,
  `epf_number` varchar(100) DEFAULT NULL,
  `pay_scale` varchar(100) DEFAULT NULL,
  `shift` varchar(50) DEFAULT NULL,
  `current_address` text DEFAULT NULL,
  `permanent_address` text DEFAULT NULL,
  `location` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `profile_photo` varchar(255) DEFAULT NULL,
  `resume` varchar(255) DEFAULT NULL,
  `joining_letter` varchar(255) DEFAULT NULL,
  `resignation_letter` varchar(255) DEFAULT NULL,
  `other_document_name` varchar(150) DEFAULT NULL,
  `other_document` varchar(255) DEFAULT NULL,
  `joining_date` date DEFAULT NULL,
  `status` enum('Active','Inactive') DEFAULT 'Active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_attendance`
--

CREATE TABLE `staff_attendance` (
  `id` varchar(36) NOT NULL,
  `staff_id` varchar(36) NOT NULL,
  `attendance_date` date NOT NULL,
  `status` enum('Present','Absent','Half Day','Leave') NOT NULL DEFAULT 'Present',
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `staff_roles`
--

CREATE TABLE `staff_roles` (
  `id` int(11) NOT NULL,
  `role_name` varchar(100) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff_roles`
--

INSERT INTO `staff_roles` (`id`, `role_name`, `status`, `created_at`) VALUES
(1, 'Admin', 'active', '2026-09-21 15:44:02'),
(2, 'Manager', 'active', '2026-09-21 15:44:02'),
(3, 'Cashier', 'active', '2026-09-21 15:44:02'),
(4, 'Sales Staff', 'active', '2026-09-21 15:44:02'),
(5, 'Accountant', 'active', '2026-09-21 15:44:02'),
(6, 'Store Keeper', 'active', '2026-09-21 15:44:02'),
(7, 'Other', 'active', '2026-09-21 15:44:02'),
(8, 'nikita', 'inactive', '2026-09-21 16:20:04');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` char(36) NOT NULL,
  `product_id` char(36) NOT NULL,
  `movement_type` enum('IN','SALE','ADJUSTMENT') NOT NULL,
  `quantity` decimal(12,3) NOT NULL,
  `previous_quantity` decimal(12,3) NOT NULL,
  `new_quantity` decimal(12,3) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `product_id`, `movement_type`, `quantity`, `previous_quantity`, `new_quantity`, `note`, `created_at`) VALUES
('000ef5da-6c87-404b-b607-cdbd154113cf', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 7.000, 6.000, 'Sold via invoice INV-20260926-0008', '2026-09-26 12:08:01'),
('002361a4-2c59-4a57-b14f-99aa8a530fbb', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 23.000, 22.000, 'Sold via invoice INV-20260911-0008', '2026-09-11 08:41:54'),
('034dcf95-0491-493e-bef0-75c63bce9baa', 'c4e7742b-b837-4726-91f2-137715748309', 'SALE', -1.000, 49.000, 48.000, 'Sold via invoice INV-20260912-0003', '2026-09-12 10:22:50'),
('048b57c8-114e-47e2-bde1-0ef0015ec377', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'IN', 10.000, 32.000, 32.000, 'Received via PO PO-20260911-0001 (Inv: TEST-PO-5857)', '2026-09-11 07:52:35'),
('0502de51-660c-46c9-95f8-9eae57c16c7c', '8a061b2f-da34-47a2-89dd-b203d3f11ddc', 'SALE', -1.000, 3.000, 2.000, 'Sold via invoice INV-20260911-0009', '2026-09-11 14:19:57'),
('054da9f9-0ba0-46e3-aa24-e572ede00cb6', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 18.000, 17.000, 'Sold via invoice INV-20260917-0004', '2026-09-17 11:04:15'),
('06495afa-1205-4fa1-a0a8-acae25b2fb52', '729a8e95-9588-4708-bc0b-f9af77103742', 'SALE', -1.000, 25.000, 24.000, 'Sold via invoice INV-20260918-0003', '2026-09-18 09:36:29'),
('0d396d46-a81e-4406-829c-d1ddfe09433c', 'c4e7742b-b837-4726-91f2-137715748309', 'SALE', -1.000, 48.000, 47.000, 'Sold via invoice INV-20260914-0003', '2026-09-14 09:27:25'),
('12295ac7-f3f8-4835-8c32-437cc0863126', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 21.000, 20.000, 'Sold via invoice INV-20260915-0002', '2026-09-15 03:45:59'),
('155fbb24-e39a-4067-a151-55b9a5a85d30', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 20.000, 19.000, 'Sold via invoice INV-20260912-0001', '2026-09-12 10:22:36'),
('1632562c-8c62-4bc3-b2ee-31603f62532b', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', 2.000, 0.000, 0.000, 'Invoice INV-2026-0002', '2026-09-10 19:40:09'),
('1d319e51-609b-4fe8-9fd0-24d492eb0a39', '2b89f117-77e7-46b6-9a07-6c3012f01f34', 'SALE', -1.000, 59.000, 58.000, 'Sold via invoice INV-20260915-0003', '2026-09-15 03:46:07'),
('23f4cdd6-0245-4fe3-90f7-978c07aab4d6', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 12.000, 11.000, 'Sold via invoice INV-20260926-0002', '2026-09-26 10:27:34'),
('25bb79ad-3215-46dc-99b8-0443927d799f', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'IN', 1.000, 6.000, 6.000, 'Restocked via Return RET-20260926-0006 (Inv: INV-20260926-0009)', '2026-09-26 13:11:35'),
('2612fcea-c8ee-4e7b-be28-d4f12320b025', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -2.000, 32.000, 30.000, 'Sold via invoice INV-20260911-0003', '2026-09-11 07:52:35'),
('264301bd-4c32-4f7f-84c0-0d7c135f75e1', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 9.000, 8.000, 'Sold via invoice INV-20260926-0005', '2026-09-26 11:45:01'),
('27ef162c-068b-41ab-b631-f5a066083eed', 'c4e7742b-b837-4726-91f2-137715748309', 'SALE', -1.000, 46.000, 45.000, 'Sold via invoice INV-20260917-0003', '2026-09-17 09:10:21'),
('28170039-053b-49a4-8fdd-19cdd7aaa474', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', 1.000, 0.000, 0.000, 'Invoice INV-2026-0001', '2026-09-10 19:38:41'),
('288861c6-cde7-493d-a9e3-5f936947aa1c', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'IN', 1.000, 5.000, 5.000, 'Restocked via Return RET-20260926-0005 (Inv: INV-20260926-0010)', '2026-09-26 13:06:42'),
('2a0c2440-643a-46be-b09e-86e404df3576', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 8.000, 7.000, 'Sold via invoice INV-20260926-0007', '2026-09-26 12:04:46'),
('2a1d3311-9474-42e0-bb67-1a5051a42998', '8a061b2f-da34-47a2-89dd-b203d3f11ddc', 'SALE', 1.000, 0.000, 0.000, 'Invoice INV-2026-0001', '2026-09-10 19:38:41'),
('2a5a0f36-6f20-4ed3-80b0-0b4314febc60', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 17.000, 16.000, 'Sold via invoice INV-20260918-0002', '2026-09-18 09:36:23'),
('2beaae84-250f-46c5-b3d0-c8f3c8153bfe', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', 1.000, 0.000, 0.000, 'Invoice INV-2026-0001', '2026-09-10 19:38:41'),
('2d7a3532-2af5-42ed-bc27-0786fcccf150', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 11.000, 10.000, 'Sold via invoice INV-20260921-0001', '2026-09-21 09:50:06'),
('2f76dc81-ca64-4000-979c-0a498309c1df', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 21.000, 20.000, 'Sold via invoice INV-20260911-0013', '2026-09-11 16:03:11'),
('30e3eef7-2088-4e62-adbc-9503e33848cc', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 18.000, 17.000, 'Sold via invoice INV-20260915-0001', '2026-09-15 03:45:53'),
('34735e09-dd26-4d67-952e-871f3f1fe8ed', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -2.000, 16.000, 14.000, 'Sold via invoice INV-20260917-0001', '2026-09-17 09:09:58'),
('3a2522ed-1aa9-4d2f-9322-b3297ed69498', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 13.000, 12.000, 'Stock reserved for Web Order WEB-159082', '2026-09-22 13:22:56'),
('3df98807-0e2a-41d0-a19f-a83af958da0b', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -2.000, 26.000, 24.000, 'Sold via invoice INV-20260911-0006', '2026-09-11 08:07:10'),
('41839e44-6df5-42c4-921c-83a9c92fc117', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 24.000, 23.000, 'Sold via invoice INV-20260911-0009', '2026-09-11 14:19:57'),
('4267cb0b-d5de-4838-ba2f-37b84afded5b', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 23.000, 22.000, 'Sold via invoice INV-20260912-0002', '2026-09-12 10:22:43'),
('49deece5-8300-4714-b7c3-53a875f05a44', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 7.000, 6.000, 'Sold via invoice INV-20260926-0009', '2026-09-26 12:12:37'),
('4ce40342-f968-4366-a446-061d075b0c55', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 10.000, 9.000, 'Sold via invoice INV-20260926-0001', '2026-09-26 10:14:39'),
('54f50706-446b-47d3-a91d-9a7154d29ea2', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 19.000, 18.000, 'Sold via invoice INV-20260914-0001', '2026-09-14 09:27:08'),
('5b7535d4-37e7-4f38-8e50-f908bfcae592', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -2.000, 30.000, 28.000, 'Sold via invoice INV-20260911-0004', '2026-09-11 07:57:47'),
('5d791ac7-5180-4672-836d-968e7389a093', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -2.000, 15.000, 13.000, 'Sold via invoice INV-20260921-0002', '2026-09-21 09:50:16'),
('5fe7567e-5329-459f-8239-1f0dc8d643eb', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'IN', 1.000, 6.000, 6.000, 'Restocked via Return RET-20260926-0002 (Inv: INV-20260926-0005)', '2026-09-26 12:42:19'),
('671f7ab3-05ec-4176-88ea-c2c87462901a', 'c4e7742b-b837-4726-91f2-137715748309', 'SALE', -1.000, 47.000, 46.000, 'Sold via invoice INV-20260916-0003', '2026-09-16 08:46:53'),
('6a3a58b3-1ece-4f51-8a25-70b7459c907c', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'IN', 1.000, 24.000, 24.000, 'Restocked via Return RET-20260911-0002 (Inv: INV-20260911-0006)', '2026-09-11 08:07:10'),
('6a494b21-5d76-41f0-b8fb-9d01c7dc3abc', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 11.000, 10.000, 'Sold via invoice INV-20260926-0003', '2026-09-26 11:28:01'),
('81c09b23-c201-40e2-beeb-192641630ae2', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 6.000, 5.000, 'Sold via invoice INV-20260926-0010', '2026-09-26 13:05:30'),
('823a2c42-11be-458b-a17f-e111b1b5ed0b', 'cd47f421-8442-425c-91ed-e1a8aa5dbfb4', 'SALE', -1.000, 3.000, 2.000, 'Sold via invoice INV-20260911-0010', '2026-09-11 15:01:40'),
('84a8e035-36c7-477b-bbe7-38c231622a99', '2b89f117-77e7-46b6-9a07-6c3012f01f34', 'SALE', -1.000, 60.000, 59.000, 'Sold via invoice INV-20260911-0010', '2026-09-11 15:01:40'),
('84cd0748-8ad8-4a9b-9874-05b46293bd5f', 'b2ebb3be-b2aa-4fc9-b38b-8344f3a2ef1f', 'SALE', -1.000, 40.000, 39.000, 'Sold via invoice INV-20260911-0011', '2026-09-11 15:01:50'),
('890de197-5660-497e-b1df-91a45ac820c5', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'IN', 1.000, 26.000, 26.000, 'Restocked via Return RET-20260911-0001 (Inv: INV-20260911-0005)', '2026-09-11 08:02:41'),
('8a149b2c-7024-43ca-bafd-160d18f009c7', '8a061b2f-da34-47a2-89dd-b203d3f11ddc', 'SALE', -2.000, 2.000, 0.000, 'Sold via invoice INV-20260911-0012', '2026-09-11 15:02:03'),
('8d509eb0-b05f-422d-9f75-c78c6514ac30', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 17.000, 16.000, 'Sold via invoice INV-20260916-0001', '2026-09-16 08:46:39'),
('8daf333e-a5bd-4990-85e6-eff8711dc8db', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'IN', 1.000, 6.000, 6.000, 'Restocked via Return RET-20260926-0001 (Inv: INV-20260911-0007)', '2026-09-26 12:28:28'),
('8f0779a1-a7f8-452d-8c87-616446a3a5ec', 'c4e7742b-b837-4726-91f2-137715748309', 'SALE', -1.000, 45.000, 44.000, 'Sold via invoice INV-20260919-0003', '2026-09-19 09:02:51'),
('90a0a1c1-e1b7-43ee-9236-445224ec1363', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'IN', 1.000, 6.000, 6.000, 'Restocked via Return RET-20260926-0004 (Inv: INV-20260926-0008)', '2026-09-26 13:04:53'),
('96a9a07e-a5c8-4e3e-b389-abc0aa98382f', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -2.000, 28.000, 26.000, 'Sold via invoice INV-20260911-0005', '2026-09-11 08:02:41'),
('96e995cd-fad5-4f25-8d90-5ccf75df943d', 'c4e7742b-b837-4726-91f2-137715748309', 'SALE', -1.000, 44.000, 43.000, 'Sold via invoice INV-20260921-0003', '2026-09-21 09:50:22'),
('9b5ddc7b-2ded-422d-9325-debf97055933', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 20.000, 19.000, 'Sold via invoice INV-20260916-0002', '2026-09-16 08:46:46'),
('9c6f9d5a-c18c-4ea0-8a04-b88ab37f9047', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 13.000, 12.000, 'Sold via invoice INV-20260918-0001', '2026-09-18 09:36:17'),
('9daf839b-c921-4d9c-9bbd-082f8c7ea426', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 24.000, 23.000, 'Sold via invoice INV-20260911-0007', '2026-09-11 08:37:58'),
('9ec72854-c33f-4828-8531-929981b52a19', '729a8e95-9588-4708-bc0b-f9af77103742', 'IN', 25.000, 0.000, 25.000, 'Initial stock entry', '2026-09-11 09:04:54'),
('a23f618a-7721-445a-bcaa-f59c238cb8c7', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'IN', 10.000, 30.000, 30.000, 'Received via PO PO-20260911-0002 (Inv: TEST-PO-7813)', '2026-09-11 07:57:47'),
('a7b2892a-a519-4a51-a161-af945f5be98d', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 10.000, 9.000, 'Sold via invoice INV-20260926-0004', '2026-09-26 11:28:09'),
('aa6e8db6-ac2f-45fd-a5b6-274050268f12', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'IN', 10.000, 28.000, 28.000, 'Received via PO PO-20260911-0003 (Inv: TEST-PO-1948)', '2026-09-11 08:02:41'),
('b01ad1ab-f043-4518-bbd6-296a5559d5ba', 'c4e7742b-b837-4726-91f2-137715748309', 'SALE', 1.000, 0.000, 0.000, 'Invoice INV-2026-0001', '2026-09-10 19:38:41'),
('b2e1e49a-7878-410f-a783-8b401b0cef0a', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 8.000, 7.000, 'Sold via invoice INV-20260926-0006', '2026-09-26 11:57:32'),
('c13ae065-ca3e-402f-ad7b-7d9954f92ac4', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 22.000, 21.000, 'Sold via invoice INV-20260914-0002', '2026-09-14 09:27:15'),
('c2df73a0-7aa4-490d-8ef9-3c9b9ee7c21d', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 9.000, 8.000, 'Sold via invoice INV-20260926-0002', '2026-09-26 10:27:34'),
('c5ef9a6d-620f-4f45-ade3-9a0fb5cae088', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 16.000, 15.000, 'Sold via invoice INV-20260919-0002', '2026-09-19 09:02:46'),
('ce3489d7-5324-4a37-ab2d-40893b0b4992', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 22.000, 21.000, 'Sold via invoice INV-20260911-0009', '2026-09-11 14:19:57'),
('d0b44608-f721-4c59-a140-6226b8e301be', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 12.000, 11.000, 'Sold via invoice INV-20260919-0001', '2026-09-19 09:02:39'),
('dee8036d-9256-4d54-bfad-a34295623f10', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'IN', 10.000, 26.000, 26.000, 'Received via PO PO-20260911-0004 (Inv: TEST-PO-0501)', '2026-09-11 08:07:10'),
('e467670c-e5eb-4e7f-893b-0e8e3610a07a', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'SALE', -1.000, 19.000, 18.000, 'Sold via invoice INV-20260917-0002', '2026-09-17 09:10:16'),
('e4696d4f-60ce-46ec-a882-10b60b934a5c', '64cf2639-db39-4063-bfa3-065fef3d58a0', 'SALE', -1.000, 100.000, 99.000, 'Stock reserved for Web Order WEB-159082', '2026-09-22 13:22:56'),
('e5ac04c7-056c-4f73-b350-65a1fcc7645c', 'c38773b7-2bf9-489d-b3c6-f8cdb4f7ac4e', 'IN', 1.000, 6.000, 6.000, 'Restocked via Return RET-20260926-0003 (Inv: INV-20260926-0008)', '2026-09-26 12:56:27'),
('f1982842-2087-47bf-8285-331b018d15ef', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'SALE', -1.000, 14.000, 13.000, 'Sold via invoice INV-20260917-0004', '2026-09-17 11:04:15'),
('fbf88b38-3c39-4d72-a876-38d3ba59286a', '1a7991ff-2b04-4e3e-abfe-271c296a73a1', 'IN', 1.000, 10.000, 10.000, 'Received via PO PO-20260921-0001 (Inv: PUR-309040)', '2026-09-21 16:31:53');

-- --------------------------------------------------------

--
-- Table structure for table `suppliers`
--

CREATE TABLE `suppliers` (
  `id` char(36) NOT NULL,
  `name` varchar(150) NOT NULL,
  `company_name` varchar(150) NOT NULL DEFAULT '',
  `phone` varchar(30) NOT NULL DEFAULT '',
  `email` varchar(160) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` varchar(36) NOT NULL,
  `name` varchar(120) NOT NULL,
  `username` varchar(80) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Cashier','Manager') DEFAULT 'Cashier',
  `pin` varchar(10) DEFAULT '1234',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `role`, `pin`, `created_at`) VALUES
('2cee8974-f5df-4795-b8d9-aaa06244195c', 'Billing Cashier', 'cashier', '$2b$10$xVb481.IjERWxE8o00JSC.L562kQ2x4r5qW.3HYniPoWof.QFVaei', 'Cashier', '$2b$10$igu', '2026-09-10 19:46:39'),
('ac8b708b-ff12-4115-b5b8-826d0ed420e4', 'Store Admin', 'admin', '$2b$10$bKG3WUtZh0FyiELPwbiv4ezI5yTAdR1pzfh/NVJF7KaYT9SYImCpC', 'Admin', '$2b$10$kHs', '2026-09-10 19:46:39');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_staff_attendance` (`staff_id`,`attendance_date`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_entity` (`entity_type`,`entity_id`);

--
-- Indexes for table `cash_shifts`
--
ALTER TABLE `cash_shifts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customers_phone` (`phone`),
  ADD KEY `idx_customers_pincode` (`pincode`);

--
-- Indexes for table `customer_ledger`
--
ALTER TABLE `customer_ledger`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_customer_id` (`customer_id`);

--
-- Indexes for table `delivery_zones`
--
ALTER TABLE `delivery_zones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_delivery_pincode` (`pincode`),
  ADD KEY `idx_delivery_place` (`place`),
  ADD KEY `idx_delivery_available` (`delivery_available`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expense_categories`
--
ALTER TABLE `expense_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_category_name` (`name`);

--
-- Indexes for table `online_orders`
--
ALTER TABLE `online_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `idx_online_orders_customer_id` (`customer_id`);

--
-- Indexes for table `payroll`
--
ALTER TABLE `payroll`
  ADD PRIMARY KEY (`id`),
  ADD KEY `staff_id` (`staff_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_products_barcode` (`barcode`),
  ADD KEY `fk_products_supplier` (`supplier_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `purchase_number` (`purchase_number`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_purchase_id` (`purchase_id`),
  ADD KEY `idx_product_id` (`product_id`);

--
-- Indexes for table `returns`
--
ALTER TABLE `returns`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `return_number` (`return_number`),
  ADD KEY `idx_sale_id` (`sale_id`);

--
-- Indexes for table `return_items`
--
ALTER TABLE `return_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_return_id` (`return_id`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_number` (`invoice_number`),
  ADD KEY `idx_sales_created_at` (`created_at`),
  ADD KEY `fk_sales_customer` (`customer_id`);

--
-- Indexes for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sale_items_sale` (`sale_id`),
  ADD KEY `fk_sale_items_product` (`product_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `staff_attendance`
--
ALTER TABLE `staff_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_staff_attendance` (`staff_id`,`attendance_date`);

--
-- Indexes for table `staff_roles`
--
ALTER TABLE `staff_roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_stock_movements_product` (`product_id`);

--
-- Indexes for table `suppliers`
--
ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `staff_roles`
--
ALTER TABLE `staff_roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payroll`
--
ALTER TABLE `payroll`
  ADD CONSTRAINT `payroll_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_products_supplier` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `fk_sales_customer` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `sale_items`
--
ALTER TABLE `sale_items`
  ADD CONSTRAINT `fk_sale_items_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `fk_sale_items_sale` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `staff_attendance`
--
ALTER TABLE `staff_attendance`
  ADD CONSTRAINT `staff_attendance_ibfk_1` FOREIGN KEY (`staff_id`) REFERENCES `staff` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `fk_stock_movements_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
