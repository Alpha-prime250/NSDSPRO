import React, { useState, useEffect } from 'react';
import { api } from '../api';
import {
  Settings as SettingsIcon,
  Save,
  CheckCircle2,
  Printer,
  QrCode,
  Barcode,
  Receipt
} from 'lucide-react';

export default function Settings({ settings, onUpdateSettings }) {
  const [formData, setFormData] = useState({
    shop_name: '',
    owner_name: '',
    phone: '',
    address: '',
    gst_number: '',
    currency_symbol: '₹',
    default_tax_percent: 0,
    low_stock_threshold: 10,
    upi_id: '',

    // Print Configuration
    thermal_printer_size: '80mm',
    auto_print_receipt: 1,
    show_upi_qr_on_receipt: 1,
    show_barcode_on_receipt: 1,
    receipt_header_note: '',
    receipt_footer_note: ''
  });

  const [savedMsg, setSavedMsg] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load settings
  useEffect(() => {
    if (settings) {
      setFormData({
        shop_name: settings.shop_name || '',
        owner_name: settings.owner_name || '',
        phone: settings.phone || '',
        address: settings.address || '',
        gst_number: settings.gst_number || settings.gstin || '',
        currency_symbol: settings.currency_symbol || '₹',

        default_tax_percent: Number(
          settings.default_tax_percent ?? settings.tax_rate ?? 0
        ),

        low_stock_threshold: Number(
          settings.low_stock_threshold ?? 10
        ),

        upi_id: settings.upi_id || '',

        // Print Configuration
        thermal_printer_size:
          settings.thermal_printer_size || '80mm',

        auto_print_receipt: Number(
          settings.auto_print_receipt ?? 1
        ),

        show_upi_qr_on_receipt: Number(
          settings.show_upi_qr_on_receipt ?? 1
        ),

        show_barcode_on_receipt: Number(
          settings.show_barcode_on_receipt ?? 1
        ),

        receipt_header_note: settings.receipt_header_note || '',
        receipt_footer_note: settings.receipt_footer_note || ''
      });
    }
  }, [settings]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? checked
            ? 1
            : 0
          : type === 'number'
          ? Number(value)
          : value
    }));
  };

  // Save settings
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSaving(true);

      const updated = await api.updateSettings(formData);

      if (onUpdateSettings) {
        onUpdateSettings(updated);
      }

      setSavedMsg(true);

      setTimeout(() => {
        setSavedMsg(false);
      }, 3000);
    } catch (err) {
      alert(err.message || 'Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  // Common styles
  const labelStyle = {
    fontSize: '0.8125rem',
    fontWeight: '600',
    marginBottom: '0.4rem',
    display: 'block'
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box'
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem'
  };

  const sectionHeaderStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.25rem',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '1rem'
  };

  const iconBoxStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };

  const toggleRowStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    marginBottom: '0.75rem'
  };

  const isEnabled = (value) => Number(value) === 1;

  return (
    <div
      style={{
        maxWidth: '850px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        paddingBottom: '2rem'
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        {/* STORE PROFILE */}
        <div className="card">
          <div style={sectionHeaderStyle}>
            <div style={iconBoxStyle}>
              <SettingsIcon size={22} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>
                Store Profile & System Settings
              </h2>

              <span
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)'
                }}
              >
                Configure your shop branding, receipts and tax preferences.
              </span>
            </div>
          </div>

          {/* SUCCESS MESSAGE */}
          {savedMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1.25rem'
              }}
            >
              <CheckCircle2 size={18} />
              <span>
                Store and print settings successfully updated!
              </span>
            </div>
          )}

          {/* SHOP NAME AND OWNER */}
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Shop / Store Name *</label>

              <input
                type="text"
                name="shop_name"
                required
                value={formData.shop_name}
                onChange={handleChange}
                className="input-field"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>
                Store Owner / Manager Name
              </label>

              <input
                type="text"
                name="owner_name"
                value={formData.owner_name}
                onChange={handleChange}
                className="input-field"
                style={inputStyle}
              />
            </div>
          </div>

          {/* PHONE AND GST */}
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>Phone Number</label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="input-field"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>GSTIN / Tax ID</label>

              <input
                type="text"
                name="gst_number"
                placeholder="Optional GST number"
                value={formData.gst_number}
                onChange={handleChange}
                className="input-field"
                style={inputStyle}
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>
              Store Address (Printed on Receipts)
            </label>

            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="input-field"
              style={inputStyle}
            />
          </div>

          {/* CURRENCY, TAX, LOW STOCK */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '1rem'
            }}
          >
            <div>
              <label style={labelStyle}>Currency Symbol</label>

              <input
                type="text"
                name="currency_symbol"
                value={formData.currency_symbol}
                onChange={handleChange}
                className="input-field"
                style={{
                  ...inputStyle,
                  textAlign: 'center',
                  fontSize: '1rem',
                  fontWeight: '700'
                }}
              />
            </div>

            <div>
              <label style={labelStyle}>Default Tax Rate (%)</label>

              <input
                type="number"
                name="default_tax_percent"
                step="0.1"
                min="0"
                value={formData.default_tax_percent}
                onChange={handleChange}
                className="input-field"
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Low Stock Threshold</label>

              <input
                type="number"
                name="low_stock_threshold"
                min="1"
                value={formData.low_stock_threshold}
                onChange={handleChange}
                className="input-field"
                style={inputStyle}
              />
            </div>
          </div>

          {/* UPI ID */}
          <div style={{ marginTop: '1rem' }}>
            <label style={labelStyle}>
              UPI VPA / ID (For Digital Payments)
            </label>

            <input
              type="text"
              name="upi_id"
              placeholder="e.g. storename@upi"
              value={formData.upi_id}
              onChange={handleChange}
              className="input-field"
              style={inputStyle}
            />
          </div>
        </div>

        {/* PRINT CONFIGURATION */}
        <div className="card">
          <div style={sectionHeaderStyle}>
            <div style={iconBoxStyle}>
              <Printer size={22} />
            </div>

            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800' }}>
                Print Configuration
              </h2>

              <span
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-muted)'
                }}
              >
                Configure paper size, printing options and receipt content.
              </span>
            </div>
          </div>

          {/* PAPER SIZE */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>
              Default Receipt Paper Size
            </label>

            <select
              name="thermal_printer_size"
              value={formData.thermal_printer_size}
              onChange={handleChange}
              className="input-field"
              style={inputStyle}
            >
              <option value="58mm">58mm Thermal Printer</option>
              <option value="80mm">80mm Thermal Printer</option>
              <option value="A4">A4 Paper</option>
            </select>
          </div>

          {/* AUTO PRINT */}
          <div style={toggleRowStyle}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                <Printer
                  size={16}
                  style={{
                    verticalAlign: 'middle',
                    marginRight: '0.5rem'
                  }}
                />
                Auto Print Receipt
              </div>

              <small style={{ color: 'var(--text-muted)' }}>
                Automatically trigger receipt printing after billing.
              </small>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <input
                type="checkbox"
                name="auto_print_receipt"
                checked={isEnabled(formData.auto_print_receipt)}
                onChange={handleChange}
                style={{ width: '18px', height: '18px' }}
              />

              <strong>
                {isEnabled(formData.auto_print_receipt) ? 'ON' : 'OFF'}
              </strong>
            </label>
          </div>

          {/* UPI QR CODE */}
          <div style={toggleRowStyle}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                <QrCode
                  size={16}
                  style={{
                    verticalAlign: 'middle',
                    marginRight: '0.5rem'
                  }}
                />
                Show UPI QR Code
              </div>

              <small style={{ color: 'var(--text-muted)' }}>
                Display the UPI payment QR code on the receipt.
              </small>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <input
                type="checkbox"
                name="show_upi_qr_on_receipt"
                checked={isEnabled(formData.show_upi_qr_on_receipt)}
                onChange={handleChange}
                style={{ width: '18px', height: '18px' }}
              />

              <strong>
                {isEnabled(formData.show_upi_qr_on_receipt) ? 'ON' : 'OFF'}
              </strong>
            </label>
          </div>

          {/* BARCODE */}
          <div style={toggleRowStyle}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>
                <Barcode
                  size={16}
                  style={{
                    verticalAlign: 'middle',
                    marginRight: '0.5rem'
                  }}
                />
                Show Barcode
              </div>

              <small style={{ color: 'var(--text-muted)' }}>
                Display the barcode on the receipt.
              </small>
            </div>

            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              <input
                type="checkbox"
                name="show_barcode_on_receipt"
                checked={isEnabled(formData.show_barcode_on_receipt)}
                onChange={handleChange}
                style={{ width: '18px', height: '18px' }}
              />

              <strong>
                {isEnabled(formData.show_barcode_on_receipt) ? 'ON' : 'OFF'}
              </strong>
            </label>
          </div>

          {/* HEADER NOTE */}
          <div style={{ marginTop: '1.25rem' }}>
            <label style={labelStyle}>Receipt Header Note</label>

            <textarea
              name="receipt_header_note"
              value={formData.receipt_header_note}
              onChange={handleChange}
              className="input-field"
              rows={3}
              placeholder="Enter a note to display at the top of the receipt"
              style={{
                ...inputStyle,
                resize: 'vertical'
              }}
            />
          </div>

          {/* FOOTER NOTE */}
          <div style={{ marginTop: '1rem' }}>
            <label style={labelStyle}>Receipt Footer Note</label>

            <textarea
              name="receipt_footer_note"
              value={formData.receipt_footer_note}
              onChange={handleChange}
              className="input-field"
              rows={3}
              placeholder="Thank you for shopping with us!"
              style={{
                ...inputStyle,
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        {/* SAVE BUTTON */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '0.5rem'
          }}
        >
          <button
            type="submit"
            disabled={isSaving}
            className="btn btn-primary"
            style={{
              padding: '0.75rem 1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}
