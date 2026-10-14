import React, { useState } from 'react';
import {
  RotateCcw,
  X,
  CheckCircle,
  Printer
} from 'lucide-react';
import { api } from '../api';
import { printThermalReturn } from '../utils/thermalPrinter';

export default function ReturnModal({
  sale,
  settings,
  onClose,
  onReturnSuccess
}) {
  const symbol = settings?.currency_symbol || '₹';

  const [returnItems, setReturnItems] = useState(() => {
    return (sale.items || []).map(item => ({
      sale_item_id: item.id,
      product_id: item.product_id,
      name: item.product_name || item.name,
      barcode: item.barcode,
      unit_price: parseFloat(item.unit_price || item.price || 0),
      sold_qty: parseFloat(item.quantity || 0),
      return_qty: 0,
      selected: false
    }));
  });

  const [reason, setReason] = useState('Customer Changed Mind');
  const [refundMethod, setRefundMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successReturn, setSuccessReturn] = useState(null);

  // ==============================
  // QUANTITY CHANGE
  // ==============================
  const handleQtyChange = (index, qty) => {
    const updated = [...returnItems];
    const val = parseFloat(qty) || 0;
    const maxVal = updated[index].sold_qty;

    updated[index].return_qty = Math.min(
      Math.max(0, val),
      maxVal
    );

    updated[index].selected = updated[index].return_qty > 0;
    setReturnItems(updated);
  };

  // ==============================
  // SELECT ITEM
  // ==============================
  const handleToggleSelect = (index) => {
    const updated = [...returnItems];

    updated[index].selected = !updated[index].selected;

    if (updated[index].selected && updated[index].return_qty === 0) {
      updated[index].return_qty = Math.min(
        1,
        updated[index].sold_qty
      );
    } else if (!updated[index].selected) {
      updated[index].return_qty = 0;
    }

    setReturnItems(updated);
  };

  const selectedList = returnItems.filter(
    item => item.selected && item.return_qty > 0
  );

  const totalRefundAmount = selectedList.reduce(
    (sum, item) => sum + item.return_qty * item.unit_price,
    0
  );

  // ==============================
  // PROCESS RETURN
  // ==============================
  const handleSubmitReturn = async (e) => {
    e.preventDefault();

    if (selectedList.length === 0) {
      setErrorMsg(
        'Please select at least one item and quantity to return.'
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        sale_id: sale.id,
        reason,
        refund_method: refundMethod,
        notes,
        items: selectedList.map(item => ({
          product_id: item.product_id,
          sale_item_id: item.sale_item_id,
          quantity: item.return_qty,
          unit_price: item.unit_price,
          total_refund: item.return_qty * item.unit_price
        }))
      };

      const res = await api.createReturn(payload);

      if (res && res.success) {
        setSuccessReturn(res);

        if (onReturnSuccess) {
          onReturnSuccess(res);
        }
      } else {
        setErrorMsg(res?.error || 'Failed to process return');
      }
    } catch (err) {
      setErrorMsg(
        err.message || 'Server error while processing return'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================
  // PRINT RETURN RECEIPT
  // Using thermalPrinter.js utility
  // ==============================
  const handlePrintReturnSlip = () => {
    if (!successReturn) {
      alert('Return receipt is not available.');
      return;
    }

    // Escape special HTML characters
    const escapeHtml = (value) => {
      return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    };

    const refundAmount =
      parseFloat(
        successReturn.refund_amount ?? totalRefundAmount
      ) || 0;

    const returnNumber =
      successReturn.return_number || 'N/A';

    const returnDate = new Date().toLocaleString('en-IN');

    // Returned items HTML
    const itemsHtml = selectedList.map(item => `
      <tr>
        <td style="
          padding:6px 0;
          border-bottom:1px dashed #aaa;
          overflow-wrap:anywhere;
        ">
          <strong>${escapeHtml(item.name)}</strong>
          <br>
          <small>
            Qty: ${escapeHtml(item.return_qty)}
            × ${escapeHtml(symbol)}${item.unit_price.toFixed(2)}
          </small>
        </td>

        <td style="
          padding:6px 0;
          text-align:right;
          vertical-align:top;
          white-space:nowrap;
          border-bottom:1px dashed #aaa;
        ">
          ${escapeHtml(symbol)}${(
            item.return_qty * item.unit_price
          ).toFixed(2)}
        </td>
      </tr>
    `).join('');

    // Receipt HTML fragment
    const receiptHtml = `
      <div style="text-align:center;">
        <h2 style="font-size:18px;margin:5px 0;">
          RETURN RECEIPT
        </h2>
        <p style="margin:5px 0;">StorePOS</p>
      </div>

      <hr style="border:0;border-top:1px dashed #000;margin:10px 0;">

      <p>
        Return No:
        <strong>${escapeHtml(returnNumber)}</strong>
      </p>

      <p>
        Original Invoice:
        ${escapeHtml(sale.invoice_number || 'N/A')}
      </p>

      <p>
        Customer:
        ${escapeHtml(sale.customer_name || 'Walk-in')}
      </p>

      <p>
        Date:
        ${escapeHtml(returnDate)}
      </p>

      <hr style="border:0;border-top:1px dashed #000;margin:10px 0;">

      <table style="
        width:100%;
        border-collapse:collapse;
        font-size:11px;
      ">
        <thead>
          <tr>
            <th style="
              text-align:left;
              padding:6px 0;
              border-bottom:1px solid #000;
            ">
              Returned Item
            </th>

            <th style="
              text-align:right;
              padding:6px 0;
              border-bottom:1px solid #000;
            ">
              Amount
            </th>
          </tr>
        </thead>

        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <hr style="border:0;border-top:1px dashed #000;margin:10px 0;">

      <div style="
        display:flex;
        justify-content:space-between;
        gap:8px;
        font-size:16px;
        font-weight:bold;
      ">
        <span>Refund:</span>
        <span>
          ${escapeHtml(symbol)}${refundAmount.toFixed(2)}
        </span>
      </div>

      <p>
        Refund Mode:
        ${escapeHtml(refundMethod)}
      </p>

      <p>
        Reason:
        ${escapeHtml(reason)}
      </p>

      ${
        notes
          ? `<p>Notes: ${escapeHtml(notes)}</p>`
          : ''
      }

      <hr style="border:0;border-top:1px dashed #000;margin:10px 0;">

      <div style="
        text-align:center;
        font-size:11px;
        margin-top:15px;
      ">
        <p>Return processed successfully.</p>
        <p>Please keep this receipt for your records.</p>
        <p>Thank you!</p>
      </div>
    `;

    // Call thermal printer utility
    printThermalReturn(receiptHtml, {
      width: '80mm',
      title: `Return Receipt - ${returnNumber}`
    });
  };

  // ==============================
  // COMPONENT UI
  // ==============================
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '700px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: '#fff1f2'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem'
            }}
          >
            <div
              style={{
                backgroundColor: '#ffe4e6',
                padding: '0.45rem',
                borderRadius: '8px',
                color: '#e11d48'
              }}
            >
              <RotateCcw size={20} />
            </div>

            <div>
              <h2
                style={{
                  fontSize: '1.15rem',
                  fontWeight: '700',
                  margin: 0,
                  color: '#881337'
                }}
              >
                Process Return / Refund
              </h2>

              <span
                style={{
                  fontSize: '0.78rem',
                  color: '#9f1239'
                }}
              >
                Original Invoice:{' '}
                <strong>{sale.invoice_number}</strong>
                {' | '}
                Customer: {sale.customer_name || 'Walk-in'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            padding: '1.5rem',
            overflowY: 'auto',
            flex: 1
          }}
        >
          {successReturn ? (
            <div
              style={{
                textAlign: 'center',
                padding: '1.5rem 0'
              }}
            >
              <CheckCircle
                size={48}
                color="#059669"
                style={{ margin: '0 auto 1rem' }}
              />

              <h3
                style={{
                  fontSize: '1.25rem',
                  fontWeight: '700',
                  color: '#065f46',
                  marginBottom: '0.5rem'
                }}
              >
                Return Processed Successfully!
              </h3>

              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: '0.85rem',
                  marginBottom: '1.5rem'
                }}
              >
                Return Reference:{' '}
                <strong>{successReturn.return_number}</strong>
                <br />

                Refund of{' '}
                <strong>
                  {symbol}
                  {parseFloat(
                    successReturn.refund_amount ?? totalRefundAmount
                  ).toFixed(2)}
                </strong>{' '}
                has been recorded and items restocked.
              </p>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '1rem',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  onClick={handlePrintReturnSlip}
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#0f172a',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={16} />
                  Print Return Receipt
                </button>

                <button
                  onClick={onClose}
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitReturn}>
              {errorMsg && (
                <div
                  style={{
                    padding: '0.75rem',
                    backgroundColor: '#fee2e2',
                    border: '1px solid #f87171',
                    borderRadius: 'var(--radius-md)',
                    color: '#b91c1c',
                    marginBottom: '1rem',
                    fontSize: '0.85rem'
                  }}
                >
                  {errorMsg}
                </div>
              )}

              <div
                style={{
                  marginBottom: '1rem',
                  fontSize: '0.825rem',
                  color: 'var(--text-muted)'
                }}
              >
                Select the items and quantity the customer wishes to
                return. Quantities will automatically be restored to
                your inventory.
              </div>

              {/* Items Table */}
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'auto',
                  marginBottom: '1.25rem'
                }}
              >
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '0.82rem'
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: '#f8fafc',
                        borderBottom: '1px solid var(--border-color)'
                      }}
                    >
                      <th style={{ padding: '0.6rem 0.75rem' }}>
                        Select
                      </th>

                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left' }}>
                        Item Sold
                      </th>

                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                        Sold Qty
                      </th>

                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>
                        Price
                      </th>

                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'center' }}>
                        Return Qty
                      </th>

                      <th style={{ padding: '0.6rem 0.75rem', textAlign: 'right' }}>
                        Refund
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {returnItems.map((item, idx) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: '1px solid #f1f5f9',
                          backgroundColor: item.selected
                            ? '#fff1f2'
                            : 'transparent'
                        }}
                      >
                        <td
                          style={{
                            padding: '0.6rem 0.75rem',
                            textAlign: 'center'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => handleToggleSelect(idx)}
                          />
                        </td>

                        <td style={{ padding: '0.6rem 0.75rem' }}>
                          <div style={{ fontWeight: '600' }}>
                            {item.name}
                          </div>

                          {item.barcode && (
                            <div
                              style={{
                                fontSize: '0.72rem',
                                color: '#94a3b8'
                              }}
                            >
                              {item.barcode}
                            </div>
                          )}
                        </td>

                        <td
                          style={{
                            padding: '0.6rem 0.75rem',
                            textAlign: 'center'
                          }}
                        >
                          {item.sold_qty}
                        </td>

                        <td
                          style={{
                            padding: '0.6rem 0.75rem',
                            textAlign: 'right'
                          }}
                        >
                          {symbol}{item.unit_price.toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding: '0.6rem 0.75rem',
                            textAlign: 'center'
                          }}
                        >
                          <input
                            type="number"
                            min="0"
                            max={item.sold_qty}
                            step="any"
                            value={item.return_qty}
                            disabled={!item.selected}
                            onChange={e =>
                              handleQtyChange(idx, e.target.value)
                            }
                            style={{
                              width: '70px',
                              padding: '0.3rem',
                              textAlign: 'center',
                              borderRadius: 'var(--radius-md)',
                              border: '1px solid var(--border-color)',
                              fontSize: '0.82rem'
                            }}
                          />
                        </td>

                        <td
                          style={{
                            padding: '0.6rem 0.75rem',
                            textAlign: 'right',
                            fontWeight: '700',
                            color: '#e11d48'
                          }}
                        >
                          {symbol}
                          {(item.return_qty * item.unit_price).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Return Details */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.25rem'
                }}
              >
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      marginBottom: '0.35rem'
                    }}
                  >
                    Reason for Return
                  </label>

                  <select
                    value={reason}
                    onChange={e => setReason(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Customer Changed Mind">
                      Customer Changed Mind
                    </option>

                    <option value="Defective / Expired Product">
                      Defective / Expired Product
                    </option>

                    <option value="Incorrect Item Sold">
                      Incorrect Item Sold
                    </option>

                    <option value="Billing Discrepancy">
                      Billing Discrepancy
                    </option>

                    <option value="Other">Other Reason</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.8rem',
                      fontWeight: '600',
                      marginBottom: '0.35rem'
                    }}
                  >
                    Refund Payment Mode
                  </label>

                  <select
                    value={refundMethod}
                    onChange={e => setRefundMethod(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <option value="Cash">Cash Refund</option>

                    <option value="Credit Note">
                      Credit Note / Ledger Adjustment
                    </option>

                    <option value="UPI">UPI / QR Refund</option>

                    <option value="Original Payment Method">
                      Original Payment Mode
                    </option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div style={{ marginBottom: '1.25rem' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.8rem',
                    fontWeight: '600',
                    marginBottom: '0.35rem'
                  }}
                >
                  Return Notes (Optional)
                </label>

                <input
                  type="text"
                  placeholder="e.g. Returned sealed packet due to wrong weight"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Total Refund */}
              <div
                style={{
                  backgroundColor: '#fff1f2',
                  padding: '0.85rem 1.25rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid #fecdd3',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem'
                }}
              >
                <span style={{ fontWeight: '600', color: '#9f1239' }}>
                  Total Refund Due:
                </span>

                <span
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: '800',
                    color: '#e11d48'
                  }}
                >
                  {symbol}{totalRefundAmount.toFixed(2)}
                </span>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.75rem',
                  flexWrap: 'wrap'
                }}
              >
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '0.65rem 1.25rem',
                    backgroundColor: '#f1f5f9',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting || selectedList.length === 0
                  }
                  style={{
                    padding: '0.65rem 1.5rem',
                    backgroundColor: '#e11d48',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    opacity:
                      submitting || selectedList.length === 0
                        ? 0.6
                        : 1
                  }}
                >
                  {submitting
                    ? 'Processing Return...'
                    : 'Confirm Return & Restock'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
