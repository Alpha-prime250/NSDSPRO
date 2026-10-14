import React, { useEffect, useState } from 'react';
import { Printer, X, CheckCircle2 } from 'lucide-react';

import {
  generateQRCodeSVG,
  generateBarcodeSVG,
} from '../utils/receiptVisuals';

export default function InvoiceModal({ invoice, settings, onClose }) {
  const [qrCode, setQrCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [paperSize, setPaperSize] = useState(
    settings?.thermal_printer_size || '80mm'
  );

  const symbol = settings?.currency_symbol || '₹';
  const printerSize = paperSize;

  const safeInvoice = invoice || {};
  const invoiceNumber = safeInvoice.invoice_number || '';
  const totalAmount = Number(safeInvoice.total_amount || 0);
  const showQR = Number(settings?.show_upi_qr_on_receipt ?? 1) === 1;
  const showBarcode = Number(settings?.show_barcode_on_receipt ?? 1) === 1;

  const headerNote =
    settings?.receipt_header_note || 'TAX INVOICE / CASH MEMO';

  const footerNote =
    settings?.receipt_footer_note || 'Thank you for shopping with us!';

  // Keep the initial printer size in sync with Settings.
  useEffect(() => {
    if (settings?.thermal_printer_size) {
      setPaperSize(settings.thermal_printer_size);
    }
  }, [settings?.thermal_printer_size]);

  // Generate QR Code and Barcode
  useEffect(() => {
    let isMounted = true;

    const generateVisuals = async () => {
      try {
        // UPI QR Code
        if (showQR && settings?.upi_id && totalAmount > 0) {
          const upiText =
            `upi://pay?pa=${encodeURIComponent(settings.upi_id)}` +
            `&pn=${encodeURIComponent(settings.shop_name || 'Retail Store')}` +
            `&am=${totalAmount.toFixed(2)}` +
            `&cu=INR`;

          const qr = await generateQRCodeSVG(upiText);

          if (isMounted) {
            setQrCode(qr || '');
          }
        } else {
          setQrCode('');
        }

        // Invoice Barcode
        if (showBarcode && invoiceNumber) {
          const barcodeSVG = generateBarcodeSVG(invoiceNumber);

          if (isMounted) {
            setBarcode(barcodeSVG || '');
          }
        } else {
          setBarcode('');
        }
      } catch (error) {
        console.error('Receipt QR/Barcode generation error:', error);

        if (isMounted) {
          setQrCode('');
          setBarcode('');
        }
      }
    };

    generateVisuals();

    return () => {
      isMounted = false;
    };
  }, [
    invoiceNumber,
    totalAmount,
    showQR,
    showBarcode,
    settings?.upi_id,
    settings?.shop_name,
  ]);

  if (!invoice) return null;

  // Print Receipt
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth:
            printerSize === '58mm'
              ? '320px'
              : printerSize === 'A4'
              ? '850px'
              : '420px',
          width: '100%',
          padding: '1.5rem',
        }}
      >
        {/* Actions Bar */}
        <div
          className="receipt-actions"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.25rem',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: 'var(--primary)',
              fontWeight: '700',
              fontSize: '0.875rem',
            }}
          >
            <CheckCircle2 size={18} />
            <span>Sale Completed</span>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <select
              aria-label="Receipt paper size"
              value={paperSize}
              onChange={(e) => setPaperSize(e.target.value)}
              style={{
                padding: '0.4rem',
                borderRadius: '6px',
                border: '1px solid #ccc',
                fontSize: '0.8rem',
                background: '#fff',
                color: '#111',
              }}
            >
              <option value="58mm">58mm</option>
              <option value="80mm">80mm</option>
              <option value="A4">A4</option>
            </select>
            <button
              onClick={handlePrint}
              className="btn btn-primary"
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.75rem',
              }}
            >
              <Printer size={14} /> Print Receipt
            </button>

            <button
              onClick={onClose}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.6rem' }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Printable Receipt */}
        <div
          className={`printable-receipt receipt-${printerSize}`}
          style={{
            backgroundColor: '#ffffff',
            border: '1px dashed var(--border-color)',
            borderRadius: 'var(--radius-md)',
            padding: printerSize === '58mm' ? '0.5rem' : '1rem',
            fontFamily: 'monospace',
            fontSize:
              printerSize === '58mm'
                ? '0.68rem'
                : printerSize === 'A4'
                ? '1rem'
                : '0.8125rem',
            lineHeight: 1.4,
            color: '#000000',
            width: '100%',
            maxWidth: printerSize === 'A4' ? '794px' : '100%',
            minHeight: printerSize === 'A4' ? '1123px' : 'auto',
            margin: printerSize === 'A4' ? '0 auto' : undefined,
            boxSizing: 'border-box',
          }}
        >
          {/* Header */}
          <div
            style={{
              textAlign: 'center',
              borderBottom: '1px dashed #000',
              paddingBottom: '0.75rem',
              marginBottom: '0.75rem',
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                fontSize: printerSize === '58mm' ? '0.9rem' : '1.1rem',
                textTransform: 'uppercase',
                overflowWrap: 'anywhere',
              }}
            >
              {settings?.shop_name || 'Retail Store'}
            </div>

            {settings?.address && (
              <div style={{ fontSize: '0.75rem', overflowWrap: 'anywhere' }}>
                {settings.address}
              </div>
            )}

            {settings?.phone && (
              <div style={{ fontSize: '0.75rem' }}>
                Phone: {settings.phone}
              </div>
            )}

            {settings?.gst_number && (
              <div style={{ fontSize: '0.75rem', overflowWrap: 'anywhere' }}>
                GSTIN: {settings.gst_number}
              </div>
            )}

            {headerNote && (
              <div
                style={{
                  fontWeight: 'bold',
                  marginTop: '0.4rem',
                  fontSize: '0.75rem',
                }}
              >
                {headerNote}
              </div>
            )}
          </div>

          {/* Invoice Details */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '0.3rem',
              fontSize: '0.72rem',
              marginBottom: '0.25rem',
              overflowWrap: 'anywhere',
            }}
          >
            <span>Invoice: {invoiceNumber}</span>
            <span>
              Date:{' '}
              {new Date(
                invoice.created_at || Date.now()
              ).toLocaleDateString('en-IN')}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: '0.3rem',
              fontSize: '0.72rem',
              marginBottom: '0.75rem',
            }}
          >
            <span style={{ overflowWrap: 'anywhere' }}>
              Customer: {invoice.customer_name || 'Walk-in'}
            </span>

            <span>Pay: {invoice.payment_mode || 'Cash'}</span>
          </div>

          {/* Items Table */}
          <div
            style={{
              borderTop: '1px dashed #000',
              borderBottom: '1px dashed #000',
              padding: '0.5rem 0',
              margin: '0.5rem 0',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontWeight: 'bold',
                fontSize: '0.7rem',
                marginBottom: '0.35rem',
              }}
            >
              <span style={{ flex: 1 }}>Item</span>
              <span style={{ width: '30px', textAlign: 'center' }}>Qty</span>
              <span style={{ width: '52px', textAlign: 'right' }}>Price</span>
              <span style={{ width: '58px', textAlign: 'right' }}>Total</span>
            </div>

            {(invoice.items || []).map((it, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  fontSize: '0.7rem',
                  padding: '0.15rem 0',
                  gap: '2px',
                }}
              >
                <span
                  style={{
                    flex: 1,
                    overflowWrap: 'anywhere',
                    minWidth: 0,
                  }}
                >
                  {it.product_name || it.name || 'Product'}
                </span>

                <span style={{ width: '30px', textAlign: 'center' }}>
                  {Number(it.quantity || 0)}
                </span>

                <span style={{ width: '52px', textAlign: 'right' }}>
                  {Number(it.unit_selling_price || 0).toFixed(2)}
                </span>

                <span style={{ width: '58px', textAlign: 'right' }}>
                  {Number(it.total_price || 0).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.2rem',
              marginTop: '0.5rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>Subtotal:</span>
              <span>
                {symbol}
                {Number(invoice.subtotal || 0).toFixed(2)}
              </span>
            </div>

            {Number(invoice.discount_amount) > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Discount:</span>
                <span>
                  -{symbol}
                  {Number(invoice.discount_amount).toFixed(2)}
                </span>
              </div>
            )}

            {Number(invoice.tax_amount) > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>Tax ({invoice.tax_percent}%):</span>
                <span>
                  +{symbol}
                  {Number(invoice.tax_amount).toFixed(2)}
                </span>
              </div>
            )}

            {/* Grand Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 'bold',
                fontSize: '1rem',
                borderTop: '1px dashed #000',
                paddingTop: '0.4rem',
                marginTop: '0.25rem',
              }}
            >
              <span>TOTAL:</span>
              <span>
                {symbol}
                {totalAmount.toFixed(2)}
              </span>
            </div>

            {/* Cash Details */}
            {invoice.payment_mode === 'Cash' &&
              Number(invoice.received_amount) > 0 && (
                <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: '#444',
                    }}
                  >
                    <span>Cash Received:</span>
                    <span>
                      {symbol}
                      {Number(invoice.received_amount).toFixed(2)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      color: '#444',
                    }}
                  >
                    <span>Change Due:</span>
                    <span>
                      {symbol}
                      {Number(invoice.change_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </>
              )}
          </div>

          {/* UPI QR Code */}
          {showQR && qrCode && (
            <div
              style={{
                textAlign: 'center',
                marginTop: '1rem',
                paddingTop: '0.5rem',
                borderTop: '1px dashed #000',
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '0.4rem' }}>
                Scan to Pay
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                dangerouslySetInnerHTML={{ __html: qrCode }}
              />

              <div style={{ fontSize: '0.7rem', marginTop: '0.3rem' }}>
                UPI: {settings?.upi_id}
              </div>
            </div>
          )}

          {/* Barcode */}
          {showBarcode && barcode && (
            <div
              style={{
                textAlign: 'center',
                marginTop: '1rem',
                paddingTop: '0.5rem',
                borderTop: '1px dashed #000',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
                dangerouslySetInnerHTML={{ __html: barcode }}
              />

              <div style={{ fontSize: '0.7rem', marginTop: '0.3rem' }}>
                {invoiceNumber}
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '1rem',
              fontSize: '0.7rem',
              borderTop: '1px dashed #000',
              paddingTop: '0.5rem',
              overflowWrap: 'anywhere',
            }}
          >
            {footerNote.split('\n').map((line, index) => (
              <div key={index}>{line}</div>
            ))}

            <div style={{ marginTop: '0.3rem' }}>
              Please visit again!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
