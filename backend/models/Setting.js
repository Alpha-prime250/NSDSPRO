const pool = require('../db');

class Setting {
  // Get all store and print settings
  static async get() {
    const [rows] = await pool.query(`
      SELECT
        id,
        shop_name,
        owner_name,
        phone,
        address,
        gst_number,
        gst_number AS gstin,
        currency_symbol,
        default_tax_percent AS tax_rate,
        default_tax_percent,
        low_stock_threshold,
        upi_id,
        thermal_printer_size,
        auto_print_receipt,
        receipt_header_note,
        receipt_footer_note,
        show_upi_qr_on_receipt,
        show_barcode_on_receipt,
        updated_at
      FROM settings
      WHERE id = 1
    `);

    if (rows.length === 0) {
      return {
        id: 1,
        shop_name: 'Super Grocery Store',
        currency_symbol: '₹',
        tax_rate: 5.00,
        default_tax_percent: 5.00,
        thermal_printer_size: '80mm',
        auto_print_receipt: 1,
        receipt_header_note: '',
        receipt_footer_note: '',
        show_upi_qr_on_receipt: 1,
        show_barcode_on_receipt: 1
      };
    }

    return rows[0];
  }

  // Update store and print settings
  static async update(data) {
    const {
      shop_name,
      owner_name,
      phone,
      address,
      gst_number,
      gstin,
      currency_symbol,
      tax_rate,
      default_tax_percent,
      low_stock_threshold,
      upi_id,
      thermal_printer_size,
      auto_print_receipt,
      receipt_header_note,
      receipt_footer_note,
      show_upi_qr_on_receipt,
      show_barcode_on_receipt
    } = data;

    const actualGst = gst_number ?? gstin ?? null;

    const actualTax =
      tax_rate !== undefined ? tax_rate : default_tax_percent;

    await pool.query(
      `UPDATE settings SET
        shop_name = COALESCE(?, shop_name),
        owner_name = COALESCE(?, owner_name),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        gst_number = COALESCE(?, gst_number),
        currency_symbol = COALESCE(?, currency_symbol),
        default_tax_percent = COALESCE(?, default_tax_percent),
        low_stock_threshold = COALESCE(?, low_stock_threshold),
        upi_id = COALESCE(?, upi_id),
        thermal_printer_size = COALESCE(?, thermal_printer_size),
        auto_print_receipt = COALESCE(?, auto_print_receipt),
        receipt_header_note = COALESCE(?, receipt_header_note),
        receipt_footer_note = COALESCE(?, receipt_footer_note),
        show_upi_qr_on_receipt = COALESCE(?, show_upi_qr_on_receipt),
        show_barcode_on_receipt = COALESCE(?, show_barcode_on_receipt)
      WHERE id = 1`,
      [
        shop_name ?? null,
        owner_name ?? null,
        phone ?? null,
        address ?? null,
        actualGst,
        currency_symbol ?? null,
        actualTax ?? null,
        low_stock_threshold ?? null,
        upi_id ?? null,
        thermal_printer_size ?? null,
        auto_print_receipt ?? null,
        receipt_header_note ?? null,
        receipt_footer_note ?? null,
        show_upi_qr_on_receipt ?? null,
        show_barcode_on_receipt ?? null
      ]
    );

    return this.get();
  }
}

module.exports = Setting;
