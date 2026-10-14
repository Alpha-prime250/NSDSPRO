import React, { useState, useEffect } from 'react';
import {
  PackagePlus,
  Search,
  Plus,
  Trash2,
  Eye,
  FileText,
  X,
  Download
} from 'lucide-react';

import { api } from '../../api';
import { exportToCSV } from '../../utils/exportUtils';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    supplier_id: '',
    invoice_number: '',
    purchase_date: new Date().toISOString().split('T')[0],
    payment_status: 'Paid',
    payment_method: 'Cash',
    paid_amount: 0,
    notes: '',
    items: []
  });

  // Current item
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQty, setItemQty] = useState(1);
  const [itemCost, setItemCost] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  // =========================================================
  // LOAD INITIAL DATA
  // =========================================================

  const fetchInitialData = async () => {
    setLoading(true);

    try {
      const [
        purchasesData,
        suppliersData,
        productsData
      ] = await Promise.all([
        api.getPurchases(),
        api.getSuppliers(),
        api.getProducts()
      ]);

      setPurchases(
        Array.isArray(purchasesData)
          ? purchasesData
          : purchasesData?.data || purchasesData?.purchases || []
      );

      setSuppliers(
        Array.isArray(suppliersData)
          ? suppliersData
          : suppliersData?.data || suppliersData?.suppliers || []
      );

      setProducts(
        Array.isArray(productsData)
          ? productsData
          : productsData?.data || productsData?.products || []
      );

    } catch (err) {
      console.error(
        'Failed to load purchases data:',
        err
      );

      setPurchases([]);
      setSuppliers([]);
      setProducts([]);

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // OPEN ADD PURCHASE MODAL
  // =========================================================

  const handleOpenAddModal = () => {
    const firstProduct =
      products.length > 0 ? products[0] : null;

    setFormData({
      supplier_id:
        suppliers.length > 0
          ? suppliers[0].id
          : '',

      invoice_number:
        'PUR-' +
        Date.now()
          .toString()
          .slice(-6),

      purchase_date:
        new Date()
          .toISOString()
          .split('T')[0],

      payment_status: 'Paid',

      payment_method: 'Cash',

      paid_amount: 0,

      notes: '',

      items: []
    });

    setSelectedProductId(
      firstProduct
        ? firstProduct.id
        : ''
    );

    setItemQty(1);

    setItemCost(
      firstProduct
        ? (
            firstProduct.cost_price ??
            firstProduct.price ??
            0
          )
        : 0
    );

    setErrorMsg('');
    setShowAddModal(true);
  };

  // =========================================================
  // PRODUCT SELECT
  // =========================================================

  const handleProductSelectChange = (
    productId
  ) => {
    setSelectedProductId(productId);

    const prod = products.find(
      p =>
        String(p.id) ===
        String(productId)
    );

    if (prod) {
      setItemCost(
        prod.cost_price !== undefined &&
        prod.cost_price !== null
          ? prod.cost_price
          : (
              prod.price || 0
            )
      );
    }
  };

  // =========================================================
  // ADD PRODUCT ITEM
  // =========================================================

  const handleAddItem = () => {
    if (!selectedProductId) {
      setErrorMsg(
        'Please select a product.'
      );
      return;
    }

    const prod = products.find(
      p =>
        String(p.id) ===
        String(selectedProductId)
    );

    if (!prod) {
      setErrorMsg(
        'Selected product not found.'
      );
      return;
    }

    const qty =
      parseFloat(itemQty) || 1;

    const cost =
      parseFloat(itemCost) || 0;

    if (qty <= 0) {
      setErrorMsg(
        'Quantity must be greater than 0.'
      );
      return;
    }

    if (cost < 0) {
      setErrorMsg(
        'Unit cost cannot be negative.'
      );
      return;
    }

    setErrorMsg('');

    const existingIndex =
      formData.items.findIndex(
        item =>
          String(item.product_id) ===
          String(prod.id)
      );

    let updatedItems =
      [...formData.items];

    if (existingIndex >= 0) {
      const existingItem =
        {
          ...updatedItems[
            existingIndex
          ]
        };

      existingItem.quantity =
        Number(
          existingItem.quantity
        ) + qty;

      existingItem.unit_cost =
        cost;

      existingItem.total_cost =
        existingItem.quantity *
        cost;

      updatedItems[
        existingIndex
      ] = existingItem;

    } else {
      updatedItems.push({
        product_id: prod.id,

        product_name:
          prod.name,

        barcode:
          prod.barcode,

        unit:
          prod.unit || 'pcs',

        quantity: qty,

        unit_cost: cost,

        total_cost:
          qty * cost
      });
    }

    const newTotal =
      updatedItems.reduce(
        (sum, item) =>
          sum +
          Number(
            item.total_cost || 0
          ),
        0
      );

    setFormData(prev => ({
      ...prev,

      items: updatedItems,

      paid_amount:
        prev.payment_status ===
        'Paid'
          ? newTotal
          : prev.paid_amount
    }));

    setItemQty(1);
  };

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const handleRemoveItem = (
    index
  ) => {
    const updatedItems =
      formData.items.filter(
        (_, idx) =>
          idx !== index
      );

    const newTotal =
      updatedItems.reduce(
        (sum, item) =>
          sum +
          Number(
            item.total_cost || 0
          ),
        0
      );

    setFormData(prev => ({
      ...prev,

      items: updatedItems,

      paid_amount:
        prev.payment_status ===
        'Paid'
          ? newTotal
          : Math.min(
              Number(
                prev.paid_amount || 0
              ),
              newTotal
            )
    }));
  };

  // =========================================================
  // TOTAL
  // =========================================================

  const totalPurchaseAmount =
    formData.items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.total_cost || 0
        ),
      0
    );

  // =========================================================
  // SUBMIT PURCHASE
  // =========================================================

  const handleSubmitPurchase =
    async e => {
      e.preventDefault();

      if (
        formData.items.length ===
        0
      ) {
        setErrorMsg(
          'Please add at least one item to this purchase order.'
        );
        return;
      }

      setSubmitting(true);
      setErrorMsg('');

      try {
        const payload = {
          supplier_id:
            formData.supplier_id ||
            null,

          invoice_number:
            formData.invoice_number ||
            null,

          purchase_date:
            formData.purchase_date,

          total_amount:
            totalPurchaseAmount,

          paid_amount:
            parseFloat(
              formData.paid_amount
            ) || 0,

          payment_status:
            formData.payment_status,

          payment_method:
            formData.payment_method,

          notes:
            formData.notes,

          items:
            formData.items.map(
              item => ({
                product_id:
                  item.product_id,

                quantity:
                  item.quantity,

                unit_cost:
                  item.unit_cost,

                total_cost:
                  item.total_cost
              })
            )
        };

        const res =
          await api.createPurchase(
            payload
          );

        if (
          res &&
          res.success
        ) {
          setShowAddModal(false);

          await fetchInitialData();

        } else {
          setErrorMsg(
            res?.error ||
            'Failed to record purchase'
          );
        }

      } catch (err) {
        console.error(
          'Create Purchase Error:',
          err
        );

        setErrorMsg(
          err.message ||
          'Server error occurred'
        );

      } finally {
        setSubmitting(false);
      }
    };

  // =========================================================
  // VIEW PURCHASE DETAILS
  // =========================================================

  const handleViewPurchase =
    async p => {
      try {

        /*
         * IMPORTANT:
         * Correct API method is getPurchaseById()
         *
         * Old:
         * api.getPurchase(p.id)
         *
         * New:
         * api.getPurchaseById(p.id)
         */

        const details =
          await api.getPurchaseById(
            p.id
          );

        /*
         * Some APIs return:
         * { success: true, data: {...} }
         *
         * Others return:
         * {...}
         *
         * Handle both formats.
         */

        const purchaseDetails =
          details?.data ||
          details?.purchase ||
          details;

        setSelectedPurchase(
          purchaseDetails || p
        );

        setShowDetailModal(true);

      } catch (error) {

        console.error(
          'Failed to load purchase details:',
          error
        );

        /*
         * If detail API fails,
         * still open the available
         * purchase row data.
         */

        setSelectedPurchase(p);

        setShowDetailModal(true);
      }
    };

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredPurchases =
    purchases.filter(p => {
      const term =
        search
          .toLowerCase()
          .trim();

      if (!term) {
        return true;
      }

      const invoice =
        String(
          p.invoice_number || ''
        ).toLowerCase();

      const supplier =
        String(
          p.supplier_name || ''
        ).toLowerCase();

      return (
        invoice.includes(term) ||
        supplier.includes(term)
      );
    });

  // =========================================================
  // EXPORT CSV
  // =========================================================

  const handleExportCSV =
    () => {
      exportToCSV(
        'supplier_purchases',
        filteredPurchases,
        [
          {
            key:
              'invoice_number',
            label:
              'Invoice Number'
          },
          {
            key:
              'purchase_date',
            label: 'Date'
          },
          {
            key:
              'supplier_name',
            label:
              'Supplier'
          },
          {
            key:
              'total_amount',
            label:
              'Total Amount'
          },
          {
            key:
              'paid_amount',
            label:
              'Paid Amount'
          },
          {
            key:
              'payment_status',
            label:
              'Payment Status'
          },
          {
            key:
              'payment_method',
            label:
              'Payment Method'
          }
        ]
      );
    };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div
      style={{
        display: 'flex',
        flexDirection:
          'column',
        gap: '1.25rem'
      }}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div
        style={{
          display: 'flex',
          alignItems:
            'center',
          justifyContent:
            'space-between',
          flexWrap:
            'wrap',
          gap: '1rem',
          backgroundColor:
            '#ffffff',
          padding:
            '1.25rem 1.5rem',
          borderRadius:
            'var(--radius-lg)',
          boxShadow:
            'var(--shadow-sm)',
          border:
            '1px solid var(--border-color)'
        }}
      >

        <div>
          <div
            style={{
              display:
                'flex',
              alignItems:
                'center',
              gap: '0.6rem'
            }}
          >

            <div
              style={{
                backgroundColor:
                  '#ecfdf5',
                padding:
                  '0.5rem',
                borderRadius:
                  '8px',
                color:
                  'var(--primary)'
              }}
            >
              <PackagePlus
                size={22}
              />
            </div>

            <div>

              <h1
                style={{
                  fontSize:
                    '1.35rem',
                  fontWeight:
                    '700',
                  margin: 0,
                  color:
                    'var(--text-main)'
                }}
              >
                Goods Receiving
                & Purchases
              </h1>

              <p
                style={{
                  margin: 0,
                  fontSize:
                    '0.85rem',
                  color:
                    'var(--text-muted)'
                }}
              >
                Inward stock from
                suppliers, update
                purchase costs,
                and track incoming
                shipments
              </p>

            </div>
          </div>
        </div>

        <div
          style={{
            display:
              'flex',
            gap:
              '0.75rem',
            alignItems:
              'center'
          }}
        >

          <button
            onClick={
              handleExportCSV
            }
            style={{
              display:
                'flex',
              alignItems:
                'center',
              gap:
                '0.4rem',
              padding:
                '0.65rem 1rem',
              backgroundColor:
                '#f8fafc',
              color:
                'var(--text-main)',
              border:
                '1px solid var(--border-color)',
              borderRadius:
                'var(--radius-md)',
              fontWeight:
                '600',
              fontSize:
                '0.85rem',
              cursor:
                'pointer'
            }}
            title="Download CSV of purchases"
          >
            <Download
              size={16}
            />
            <span>
              Export CSV
            </span>
          </button>

          <button
            onClick={
              handleOpenAddModal
            }
            style={{
              display:
                'flex',
              alignItems:
                'center',
              gap:
                '0.5rem',
              padding:
                '0.65rem 1.25rem',
              backgroundColor:
                'var(--primary)',
              color:
                'white',
              border:
                'none',
              borderRadius:
                'var(--radius-md)',
              fontWeight:
                '600',
              fontSize:
                '0.875rem',
              cursor:
                'pointer',
              boxShadow:
                '0 2px 4px rgba(5, 150, 105, 0.2)'
            }}
          >
            <Plus
              size={18}
            />

            <span>
              New Goods Inward
            </span>
          </button>

        </div>
      </div>

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div
        style={{
          display:
            'flex',
          gap:
            '1rem',
          backgroundColor:
            '#ffffff',
          padding:
            '0.85rem 1.25rem',
          borderRadius:
            'var(--radius-md)',
          border:
            '1px solid var(--border-color)',
          alignItems:
            'center'
        }}
      >

        <div
          style={{
            position:
              'relative',
            flex: 1,
            maxWidth:
              '400px'
          }}
        >

          <Search
            size={16}
            style={{
              position:
                'absolute',
              left:
                '12px',
              top:
                '50%',
              transform:
                'translateY(-50%)',
              color:
                '#94a3b8'
            }}
          />

          <input
            type="text"
            placeholder="Search by invoice number or supplier..."
            value={search}
            onChange={e =>
              setSearch(
                e.target.value
              )
            }
            style={{
              width:
                '100%',
              padding:
                '0.5rem 0.75rem 0.5rem 2.25rem',
              borderRadius:
                'var(--radius-md)',
              border:
                '1px solid var(--border-color)',
              fontSize:
                '0.85rem'
            }}
          />

        </div>

        <div
          style={{
            fontSize:
              '0.85rem',
            color:
              'var(--text-muted)'
          }}
        >
          Showing{' '}
          <strong>
            {
              filteredPurchases.length
            }
          </strong>{' '}
          purchase records
        </div>

      </div>

      {/* =====================================================
          PURCHASE TABLE
      ===================================================== */}

      <div
        style={{
          backgroundColor:
            '#ffffff',
          borderRadius:
            'var(--radius-lg)',
          border:
            '1px solid var(--border-color)',
          overflow:
            'hidden',
          boxShadow:
            'var(--shadow-sm)'
        }}
      >

        {loading ? (

          <div
            style={{
              padding:
                '3rem',
              textAlign:
                'center',
              color:
                'var(--text-muted)'
            }}
          >
            Loading purchases
            records...
          </div>

        ) : filteredPurchases.length === 0 ? (

          <div
            style={{
              padding:
                '3rem',
              textAlign:
                'center',
              color:
                'var(--text-muted)'
            }}
          >

            <FileText
              size={40}
              style={{
                color:
                  '#cbd5e1',
                marginBottom:
                  '0.5rem'
              }}
            />

            <div
              style={{
                fontWeight:
                  '600',
                color:
                  'var(--text-main)'
              }}
            >
              No purchase
              records found
            </div>

            <div
              style={{
                fontSize:
                  '0.85rem'
              }}
            >
              Click "New Goods
              Inward" to record
              incoming supplier
              shipments.
            </div>

          </div>

        ) : (

          <div
            style={{
              overflowX:
                'auto'
            }}
          >

            <table
              style={{
                width:
                  '100%',
                borderCollapse:
                  'collapse',
                textAlign:
                  'left',
                fontSize:
                  '0.85rem'
              }}
            >

              <thead>

                <tr
                  style={{
                    backgroundColor:
                      '#f8fafc',
                    borderBottom:
                      '1px solid var(--border-color)',
                    color:
                      '#475569'
                  }}
                >

                  <th
                    style={{
                      padding:
                        '0.75rem 1rem'
                    }}
                  >
                    Invoice #
                  </th>

                  <th
                    style={{
                      padding:
                        '0.75rem 1rem'
                    }}
                  >
                    Date
                  </th>

                  <th
                    style={{
                      padding:
                        '0.75rem 1rem'
                    }}
                  >
                    Supplier
                  </th>

                  <th
                    style={{
                      padding:
                        '0.75rem 1rem',
                      textAlign:
                        'right'
                    }}
                  >
                    Total Cost
                  </th>

                  <th
                    style={{
                      padding:
                        '0.75rem 1rem',
                      textAlign:
                        'right'
                    }}
                  >
                    Paid
                  </th>

                  <th
                    style={{
                      padding:
                        '0.75rem 1rem',
                      textAlign:
                        'center'
                    }}
                  >
                    Payment Status
                  </th>

                  <th
                    style={{
                      padding:
                        '0.75rem 1rem',
                      textAlign:
                        'center'
                    }}
                  >
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredPurchases.map(
                  p => {

                    const isPaid =
                      p.payment_status ===
                      'Paid';

                    const isPartial =
                      p.payment_status ===
                      'Partial';

                    return (

                      <tr
                        key={p.id}
                        style={{
                          borderBottom:
                            '1px solid #f1f5f9'
                        }}
                      >

                        <td
                          style={{
                            padding:
                              '0.75rem 1rem',
                            fontWeight:
                              '600',
                            color:
                              'var(--text-main)'
                          }}
                        >
                          {
                            p.invoice_number ||
                            `PUR-${p.id}`
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              '0.75rem 1rem',
                            color:
                              'var(--text-muted)'
                          }}
                        >
                          {
                            p.purchase_date
                              ? new Date(
                                  p.purchase_date
                                ).toLocaleDateString()
                              : '-'
                          }
                        </td>

                        <td
                          style={{
                            padding:
                              '0.75rem 1rem'
                          }}
                        >

                          <div
                            style={{
                              fontWeight:
                                '500'
                            }}
                          >
                            {
                              p.supplier_name ||
                              'Generic Supplier'
                            }
                          </div>

                          {p.supplier_phone && (
                            <div
                              style={{
                                fontSize:
                                  '0.75rem',
                                color:
                                  '#94a3b8'
                              }}
                            >
                              {
                                p.supplier_phone
                              }
                            </div>
                          )}

                        </td>

                        <td
                          style={{
                            padding:
                              '0.75rem 1rem',
                            textAlign:
                              'right',
                            fontWeight:
                              '700',
                            color:
                              'var(--text-main)'
                          }}
                        >
                          ₹
                          {parseFloat(
                            p.total_amount ||
                            0
                          ).toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding:
                              '0.75rem 1rem',
                            textAlign:
                              'right',
                            color:
                              '#059669',
                            fontWeight:
                              '600'
                          }}
                        >
                          ₹
                          {parseFloat(
                            p.paid_amount ||
                            0
                          ).toFixed(2)}
                        </td>

                        <td
                          style={{
                            padding:
                              '0.75rem 1rem',
                            textAlign:
                              'center'
                          }}
                        >

                          <span
                            style={{
                              padding:
                                '0.2rem 0.55rem',
                              borderRadius:
                                '9999px',
                              fontSize:
                                '0.75rem',
                              fontWeight:
                                '600',
                              backgroundColor:
                                isPaid
                                  ? '#ecfdf5'
                                  : isPartial
                                    ? '#fffbeb'
                                    : '#fef2f2',
                              color:
                                isPaid
                                  ? '#059669'
                                  : isPartial
                                    ? '#d97706'
                                    : '#dc2626'
                            }}
                          >
                            {
                              p.payment_status
                            }
                          </span>

                        </td>

                        <td
                          style={{
                            padding:
                              '0.75rem 1rem',
                            textAlign:
                              'center'
                          }}
                        >

                          <button
                            onClick={() =>
                              handleViewPurchase(
                                p
                              )
                            }
                            style={{
                              padding:
                                '0.35rem 0.75rem',
                              backgroundColor:
                                '#f8fafc',
                              border:
                                '1px solid var(--border-color)',
                              borderRadius:
                                'var(--radius-md)',
                              cursor:
                                'pointer',
                              fontSize:
                                '0.78rem',
                              fontWeight:
                                '600',
                              display:
                                'inline-flex',
                              alignItems:
                                'center',
                              gap:
                                '0.35rem',
                              color:
                                'var(--text-main)'
                            }}
                          >

                            <Eye
                              size={14}
                            />

                            <span>
                              Details
                            </span>

                          </button>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

      {/* =====================================================
          ADD PURCHASE MODAL
      ===================================================== */}

      {showAddModal && (

        <div
          style={{
            position:
              'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor:
              'rgba(0, 0, 0, 0.5)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            zIndex:
              9999,
            padding:
              '1rem'
          }}
        >

          <div
            style={{
              backgroundColor:
                '#ffffff',
              borderRadius:
                'var(--radius-lg)',
              width:
                '100%',
              maxWidth:
                '780px',
              maxHeight:
                '90vh',
              display:
                'flex',
              flexDirection:
                'column',
              overflow:
                'hidden',
              boxShadow:
                'var(--shadow-lg)'
            }}
          >

            {/* MODAL HEADER */}

            <div
              style={{
                padding:
                  '1rem 1.5rem',
                borderBottom:
                  '1px solid var(--border-color)',
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'space-between',
                backgroundColor:
                  '#f8fafc'
              }}
            >

              <div
                style={{
                  display:
                    'flex',
                  alignItems:
                    'center',
                  gap:
                    '0.5rem'
                }}
              >

                <PackagePlus
                  size={20}
                  color="var(--primary)"
                />

                <h2
                  style={{
                    fontSize:
                      '1.15rem',
                    fontWeight:
                      '700',
                    margin: 0
                  }}
                >
                  Record Goods
                  Inward /
                  Purchase Order
                </h2>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddModal(
                    false
                  )
                }
                style={{
                  background:
                    'none',
                  border:
                    'none',
                  cursor:
                    'pointer',
                  color:
                    '#64748b'
                }}
              >
                <X
                  size={20}
                />
              </button>

            </div>

            {/* MODAL FORM */}

            <form
              onSubmit={
                handleSubmitPurchase
              }
              style={{
                overflowY:
                  'auto',
                padding:
                  '1.5rem',
                flex: 1
              }}
            >

              {errorMsg && (

                <div
                  style={{
                    padding:
                      '0.75rem 1rem',
                    backgroundColor:
                      '#fee2e2',
                    border:
                      '1px solid #f87171',
                    borderRadius:
                      'var(--radius-md)',
                    color:
                      '#b91c1c',
                    marginBottom:
                      '1rem',
                    fontSize:
                      '0.85rem'
                  }}
                >
                  {errorMsg}
                </div>

              )}

              {/* TOP DETAILS */}

              <div
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    'repeat(3, 1fr)',
                  gap:
                    '1rem',
                  marginBottom:
                    '1.25rem'
                }}
              >

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      fontSize:
                        '0.8rem',
                      fontWeight:
                        '600',
                      marginBottom:
                        '0.35rem'
                    }}
                  >
                    Supplier
                  </label>

                  <select
                    value={
                      formData.supplier_id
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        supplier_id:
                          e.target.value
                      })
                    }
                    style={{
                      width:
                        '100%',
                      padding:
                        '0.5rem',
                      borderRadius:
                        'var(--radius-md)',
                      border:
                        '1px solid var(--border-color)',
                      fontSize:
                        '0.85rem'
                    }}
                  >

                    <option value="">
                      -- Generic /
                      None --
                    </option>

                    {suppliers.map(
                      supplier => (
                        <option
                          key={
                            supplier.id
                          }
                          value={
                            supplier.id
                          }
                        >
                          {
                            supplier.name
                          }
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      fontSize:
                        '0.8rem',
                      fontWeight:
                        '600',
                      marginBottom:
                        '0.35rem'
                    }}
                  >
                    Supplier Bill /
                    Invoice #
                  </label>

                  <input
                    type="text"
                    value={
                      formData.invoice_number
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        invoice_number:
                          e.target.value
                      })
                    }
                    placeholder="e.g. INV-9042"
                    style={{
                      width:
                        '100%',
                      padding:
                        '0.5rem',
                      borderRadius:
                        'var(--radius-md)',
                      border:
                        '1px solid var(--border-color)',
                      fontSize:
                        '0.85rem'
                    }}
                  />

                </div>

                <div>

                  <label
                    style={{
                      display:
                        'block',
                      fontSize:
                        '0.8rem',
                      fontWeight:
                        '600',
                      marginBottom:
                        '0.35rem'
                    }}
                  >
                    Purchase Date
                  </label>

                  <input
                    type="date"
                    value={
                      formData.purchase_date
                    }
                    onChange={e =>
                      setFormData({
                        ...formData,
                        purchase_date:
                          e.target.value
                      })
                    }
                    style={{
                      width:
                        '100%',
                      padding:
                        '0.5rem',
                      borderRadius:
                        'var(--radius-md)',
                      border:
                        '1px solid var(--border-color)',
                      fontSize:
                        '0.85rem'
                    }}
                  />

                </div>

              </div>

              {/* ADD PRODUCTS */}

              <div
                style={{
                  backgroundColor:
                    '#f8fafc',
                  padding:
                    '1rem',
                  borderRadius:
                    'var(--radius-md)',
                  border:
                    '1px solid #e2e8f0',
                  marginBottom:
                    '1.25rem'
                }}
              >

                <div
                  style={{
                    fontWeight:
                      '600',
                    fontSize:
                      '0.85rem',
                    marginBottom:
                      '0.75rem',
                    color:
                      '#334155'
                  }}
                >
                  Add Products
                  to Inward
                </div>

                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      '2fr 1fr 1fr auto',
                    gap:
                      '0.75rem',
                    alignItems:
                      'end'
                  }}
                >

                  <div>

                    <label
                      style={{
                        display:
                          'block',
                        fontSize:
                          '0.75rem',
                        fontWeight:
                          '600',
                        marginBottom:
                          '0.25rem'
                      }}
                    >
                      Select Product
                    </label>

                    <select
                      value={
                        selectedProductId
                      }
                      onChange={e =>
                        handleProductSelectChange(
                          e.target.value
                        )
                      }
                      style={{
                        width:
                          '100%',
                        padding:
                          '0.45rem',
                        borderRadius:
                          'var(--radius-md)',
                        border:
                          '1px solid var(--border-color)',
                        fontSize:
                          '0.82rem'
                      }}
                    >

                      {products.map(
                        product => (
                          <option
                            key={
                              product.id
                            }
                            value={
                              product.id
                            }
                          >
                            {
                              product.name
                            }{' '}
                            (Stock:{' '}
                            {
                              product.stock
                            }{' '}
                            {
                              product.unit
                            })
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div>

                    <label
                      style={{
                        display:
                          'block',
                        fontSize:
                          '0.75rem',
                        fontWeight:
                          '600',
                        marginBottom:
                          '0.25rem'
                      }}
                    >
                      Inward Qty
                    </label>

                    <input
                      type="number"
                      min="1"
                      step="any"
                      value={
                        itemQty
                      }
                      onChange={e =>
                        setItemQty(
                          e.target.value
                        )
                      }
                      style={{
                        width:
                          '100%',
                        padding:
                          '0.45rem',
                        borderRadius:
                          'var(--radius-md)',
                        border:
                          '1px solid var(--border-color)',
                        fontSize:
                          '0.82rem'
                      }}
                    />

                  </div>

                  <div>

                    <label
                      style={{
                        display:
                          'block',
                        fontSize:
                          '0.75rem',
                        fontWeight:
                          '600',
                        marginBottom:
                          '0.25rem'
                      }}
                    >
                      Unit Cost (₹)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        itemCost
                      }
                      onChange={e =>
                        setItemCost(
                          e.target.value
                        )
                      }
                      style={{
                        width:
                          '100%',
                        padding:
                          '0.45rem',
                        borderRadius:
                          'var(--radius-md)',
                        border:
                          '1px solid var(--border-color)',
                        fontSize:
                          '0.82rem'
                      }}
                    />

                  </div>

                  <button
                    type="button"
                    onClick={
                      handleAddItem
                    }
                    style={{
                      padding:
                        '0.5rem 1rem',
                      backgroundColor:
                        'var(--primary)',
                      color:
                        'white',
                      border:
                        'none',
                      borderRadius:
                        'var(--radius-md)',
                      fontSize:
                        '0.82rem',
                      fontWeight:
                        '600',
                      cursor:
                        'pointer'
                    }}
                  >
                    + Add
                  </button>

                </div>

              </div>

              {/* ITEMS TABLE */}

              <div
                style={{
                  border:
                    '1px solid var(--border-color)',
                  borderRadius:
                    'var(--radius-md)',
                  overflow:
                    'hidden',
                  marginBottom:
                    '1.25rem'
                }}
              >

                <table
                  style={{
                    width:
                      '100%',
                    borderCollapse:
                      'collapse',
                    fontSize:
                      '0.82rem'
                  }}
                >

                  <thead>

                    <tr
                      style={{
                        backgroundColor:
                          '#f1f5f9',
                        borderBottom:
                          '1px solid var(--border-color)'
                      }}
                    >

                      <th
                        style={{
                          padding:
                            '0.6rem 0.75rem',
                          textAlign:
                            'left'
                        }}
                      >
                        Item
                      </th>

                      <th
                        style={{
                          padding:
                            '0.6rem 0.75rem',
                          textAlign:
                            'center'
                        }}
                      >
                        Qty
                      </th>

                      <th
                        style={{
                          padding:
                            '0.6rem 0.75rem',
                          textAlign:
                            'right'
                        }}
                      >
                        Cost
                      </th>

                      <th
                        style={{
                          padding:
                            '0.6rem 0.75rem',
                          textAlign:
                            'right'
                        }}
                      >
                        Total
                      </th>

                      <th
                        style={{
                          padding:
                            '0.6rem 0.75rem',
                          textAlign:
                            'center'
                        }}
                      >
                        Action
                      </th>

                    </tr>

                  </thead>

                  <tbody>

                    {formData.items.length ===
                    0 ? (

                      <tr>

                        <td
                          colSpan="5"
                          style={{
                            textAlign:
                              'center',
                            padding:
                              '1.5rem',
                            color:
                              '#94a3b8'
                          }}
                        >
                          No items added
                          yet. Select a
                          product above
                          and click
                          "+ Add".
                        </td>

                      </tr>

                    ) : (

                      formData.items.map(
                        (
                          item,
                          index
                        ) => (

                          <tr
                            key={
                              `${item.product_id}-${index}`
                            }
                            style={{
                              borderBottom:
                                '1px solid #f1f5f9'
                            }}
                          >

                            <td
                              style={{
                                padding:
                                  '0.6rem 0.75rem'
                              }}
                            >

                              <div
                                style={{
                                  fontWeight:
                                    '600'
                                }}
                              >
                                {
                                  item.product_name
                                }
                              </div>

                              {item.barcode && (
                                <div
                                  style={{
                                    fontSize:
                                      '0.72rem',
                                    color:
                                      '#94a3b8'
                                  }}
                                >
                                  {
                                    item.barcode
                                  }
                                </div>
                              )}

                            </td>

                            <td
                              style={{
                                padding:
                                  '0.6rem 0.75rem',
                                textAlign:
                                  'center'
                              }}
                            >
                              {
                                item.quantity
                              }{' '}
                              {
                                item.unit
                              }
                            </td>

                            <td
                              style={{
                                padding:
                                  '0.6rem 0.75rem',
                                textAlign:
                                  'right'
                              }}
                            >
                              ₹
                              {Number(
                                item.unit_cost ||
                                0
                              ).toFixed(2)}
                            </td>

                            <td
                              style={{
                                padding:
                                  '0.6rem 0.75rem',
                                textAlign:
                                  'right',
                                fontWeight:
                                  '600'
                              }}
                            >
                              ₹
                              {Number(
                                item.total_cost ||
                                0
                              ).toFixed(2)}
                            </td>

                            <td
                              style={{
                                padding:
                                  '0.6rem 0.75rem',
                                textAlign:
                                  'center'
                              }}
                            >

                              <button
                                type="button"
                                onClick={() =>
                                  handleRemoveItem(
                                    index
                                  )
                                }
                                style={{
                                  background:
                                    'none',
                                  border:
                                    'none',
                                  color:
                                    '#ef4444',
                                  cursor:
                                    'pointer'
                                }}
                              >
                                <Trash2
                                  size={
                                    16
                                  }
                                />
                              </button>

                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

              {/* PAYMENT */}

              <div
                style={{
                  display:
                    'grid',
                  gridTemplateColumns:
                    '1fr 1fr',
                  gap:
                    '1.5rem',
                  backgroundColor:
                    '#f8fafc',
                  padding:
                    '1rem',
                  borderRadius:
                    'var(--radius-md)',
                  border:
                    '1px solid #e2e8f0',
                  marginBottom:
                    '1rem'
                }}
              >

                <div>

                  <div
                    style={{
                      marginBottom:
                        '0.75rem'
                    }}
                  >

                    <label
                      style={{
                        display:
                          'block',
                        fontSize:
                          '0.75rem',
                        fontWeight:
                          '600',
                        marginBottom:
                          '0.25rem'
                      }}
                    >
                      Payment Status
                    </label>

                    <select
                      value={
                        formData.payment_status
                      }
                      onChange={e => {

                        const status =
                          e.target.value;

                        setFormData(
                          prev => ({
                            ...prev,

                            payment_status:
                              status,

                            paid_amount:
                              status ===
                              'Paid'
                                ? totalPurchaseAmount
                                : status ===
                                  'Unpaid'
                                  ? 0
                                  : prev.paid_amount
                          })
                        );

                      }}
                      style={{
                        width:
                          '100%',
                        padding:
                          '0.45rem',
                        borderRadius:
                          'var(--radius-md)',
                        border:
                          '1px solid var(--border-color)',
                        fontSize:
                          '0.82rem'
                      }}
                    >

                      <option value="Paid">
                        Fully Paid
                      </option>

                      <option value="Partial">
                        Partially Paid
                      </option>

                      <option value="Unpaid">
                        Unpaid / On
                        Credit
                      </option>

                    </select>

                  </div>

                  <div>

                    <label
                      style={{
                        display:
                          'block',
                        fontSize:
                          '0.75rem',
                        fontWeight:
                          '600',
                        marginBottom:
                          '0.25rem'
                      }}
                    >
                      Payment Method
                    </label>

                    <select
                      value={
                        formData.payment_method
                      }
                      onChange={e =>
                        setFormData(
                          prev => ({
                            ...prev,
                            payment_method:
                              e.target.value
                          })
                        )
                      }
                      style={{
                        width:
                          '100%',
                        padding:
                          '0.45rem',
                        borderRadius:
                          'var(--radius-md)',
                        border:
                          '1px solid var(--border-color)',
                        fontSize:
                          '0.82rem'
                      }}
                    >

                      <option value="Cash">
                        Cash
                      </option>

                      <option value="Bank">
                        Bank Transfer /
                        NEFT
                      </option>

                      <option value="UPI">
                        UPI / QR
                      </option>

                      <option value="Cheque">
                        Cheque
                      </option>

                    </select>

                  </div>

                </div>

                <div
                  style={{
                    display:
                      'flex',
                    flexDirection:
                      'column',
                    justifyContent:
                      'center',
                    gap:
                      '0.5rem'
                  }}
                >

                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      fontSize:
                        '0.9rem'
                    }}
                  >
                    <span>
                      Total Purchase
                      Cost:
                    </span>

                    <strong>
                      ₹
                      {totalPurchaseAmount.toFixed(
                        2
                      )}
                    </strong>
                  </div>

                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'center',
                      fontSize:
                        '0.9rem'
                    }}
                  >

                    <span>
                      Amount Paid:
                    </span>

                    <input
                      type="number"
                      min="0"
                      max={
                        totalPurchaseAmount
                      }
                      step="0.01"
                      value={
                        formData.paid_amount
                      }
                      onChange={e =>
                        setFormData(
                          prev => ({
                            ...prev,
                            paid_amount:
                              e.target.value
                          })
                        )
                      }
                      disabled={
                        formData.payment_status ===
                        'Unpaid'
                      }
                      style={{
                        width:
                          '110px',
                        padding:
                          '0.35rem 0.5rem',
                        textAlign:
                          'right',
                        borderRadius:
                          'var(--radius-md)',
                        border:
                          '1px solid var(--border-color)',
                        fontWeight:
                          '600'
                      }}
                    />

                  </div>

                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      fontSize:
                        '0.9rem',
                      color:
                        '#dc2626',
                      fontWeight:
                        '600',
                      borderTop:
                        '1px dashed #cbd5e1',
                      paddingTop:
                        '0.4rem'
                    }}
                  >

                    <span>
                      Due Balance:
                    </span>

                    <span>
                      ₹
                      {Math.max(
                        0,
                        totalPurchaseAmount -
                          (
                            parseFloat(
                              formData.paid_amount
                            ) || 0
                          )
                      ).toFixed(2)}
                    </span>

                  </div>

                </div>

              </div>

              {/* BUTTONS */}

              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'flex-end',
                  gap:
                    '0.75rem'
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowAddModal(
                      false
                    )
                  }
                  style={{
                    padding:
                      '0.65rem 1.25rem',
                    backgroundColor:
                      '#f1f5f9',
                    border:
                      '1px solid var(--border-color)',
                    borderRadius:
                      'var(--radius-md)',
                    fontWeight:
                      '600',
                    fontSize:
                      '0.85rem',
                    cursor:
                      'pointer'
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    submitting ||
                    formData.items.length ===
                      0
                  }
                  style={{
                    padding:
                      '0.65rem 1.5rem',
                    backgroundColor:
                      'var(--primary)',
                    color:
                      'white',
                    border:
                      'none',
                    borderRadius:
                      'var(--radius-md)',
                    fontWeight:
                      '600',
                    fontSize:
                      '0.85rem',
                    cursor:
                      'pointer',
                    opacity:
                      submitting ||
                      formData.items.length ===
                        0
                        ? 0.6
                        : 1
                  }}
                >
                  {submitting
                    ? 'Saving & Updating Stock...'
                    : 'Save Purchase & Inward Stock'}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

      {/* =====================================================
          PURCHASE DETAILS MODAL
      ===================================================== */}

      {showDetailModal &&
        selectedPurchase && (

          <div
            style={{
              position:
                'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor:
                'rgba(0, 0, 0, 0.5)',
              display:
                'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              zIndex:
                9999,
              padding:
                '1rem'
            }}
          >

            <div
              style={{
                backgroundColor:
                  '#ffffff',
                borderRadius:
                  'var(--radius-lg)',
                width:
                  '100%',
                maxWidth:
                  '650px',
                maxHeight:
                  '90vh',
                display:
                  'flex',
                flexDirection:
                  'column',
                overflow:
                  'hidden',
                boxShadow:
                  'var(--shadow-lg)'
              }}
            >

              {/* DETAIL HEADER */}

              <div
                style={{
                  padding:
                    '1rem 1.5rem',
                  borderBottom:
                    '1px solid var(--border-color)',
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'space-between',
                  backgroundColor:
                    '#f8fafc'
                }}
              >

                <div>

                  <h3
                    style={{
                      margin: 0,
                      fontSize:
                        '1.1rem'
                    }}
                  >
                    Purchase Invoice:{' '}
                    {
                      selectedPurchase.invoice_number ||
                      `PUR-${selectedPurchase.id}`
                    }
                  </h3>

                  <span
                    style={{
                      fontSize:
                        '0.8rem',
                      color:
                        'var(--text-muted)'
                    }}
                  >
                    Date:{' '}
                    {
                      selectedPurchase.purchase_date
                        ? new Date(
                            selectedPurchase.purchase_date
                          ).toLocaleDateString()
                        : '-'
                    }
                  </span>

                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowDetailModal(
                      false
                    )
                  }
                  style={{
                    background:
                      'none',
                    border:
                      'none',
                    cursor:
                      'pointer',
                    color:
                      '#64748b'
                  }}
                >
                  <X
                    size={20}
                  />
                </button>

              </div>

              {/* DETAIL BODY */}

              <div
                style={{
                  padding:
                    '1.5rem',
                  overflowY:
                    'auto'
                }}
              >

                <div
                  style={{
                    display:
                      'grid',
                    gridTemplateColumns:
                      '1fr 1fr',
                    gap:
                      '1rem',
                    marginBottom:
                      '1.25rem'
                  }}
                >

                  <div>

                    <div
                      style={{
                        fontSize:
                          '0.75rem',
                        color:
                          '#64748b'
                      }}
                    >
                      Supplier:
                    </div>

                    <div
                      style={{
                        fontWeight:
                          '600'
                      }}
                    >
                      {
                        selectedPurchase.supplier_name ||
                        'Generic Supplier'
                      }
                    </div>

                    {selectedPurchase.supplier_phone && (
                      <div
                        style={{
                          fontSize:
                            '0.8rem'
                        }}
                      >
                        {
                          selectedPurchase.supplier_phone
                        }
                      </div>
                    )}

                  </div>

                  <div>

                    <div
                      style={{
                        fontSize:
                          '0.75rem',
                        color:
                          '#64748b'
                      }}
                    >
                      Payment Status:
                    </div>

                    <span
                      style={{
                        display:
                          'inline-block',
                        padding:
                          '0.2rem 0.5rem',
                        borderRadius:
                          '9999px',
                        fontSize:
                          '0.75rem',
                        fontWeight:
                          '600',
                        backgroundColor:
                          selectedPurchase.payment_status ===
                          'Paid'
                            ? '#ecfdf5'
                            : '#fffbeb',
                        color:
                          selectedPurchase.payment_status ===
                          'Paid'
                            ? '#059669'
                            : '#d97706'
                      }}
                    >
                      {
                        selectedPurchase.payment_status
                      }{' '}
                      (
                      {
                        selectedPurchase.payment_method ||
                        'Cash'
                      }
                      )
                    </span>

                  </div>

                </div>

                {/* ITEMS */}

                <div
                  style={{
                    border:
                      '1px solid var(--border-color)',
                    borderRadius:
                      'var(--radius-md)',
                    overflow:
                      'hidden',
                    marginBottom:
                      '1rem'
                  }}
                >

                  <table
                    style={{
                      width:
                        '100%',
                      borderCollapse:
                        'collapse',
                      fontSize:
                        '0.82rem'
                    }}
                  >

                    <thead>

                      <tr
                        style={{
                          backgroundColor:
                            '#f1f5f9'
                        }}
                      >

                        <th
                          style={{
                            padding:
                              '0.5rem 0.75rem',
                            textAlign:
                              'left'
                          }}
                        >
                          Item
                        </th>

                        <th
                          style={{
                            padding:
                              '0.5rem 0.75rem',
                            textAlign:
                              'center'
                          }}
                        >
                          Inward Qty
                        </th>

                        <th
                          style={{
                            padding:
                              '0.5rem 0.75rem',
                            textAlign:
                              'right'
                          }}
                        >
                          Cost
                        </th>

                        <th
                          style={{
                            padding:
                              '0.5rem 0.75rem',
                            textAlign:
                              'right'
                          }}
                        >
                          Total
                        </th>

                      </tr>

                    </thead>

                    <tbody>

                      {Array.isArray(
                        selectedPurchase.items
                      ) &&
                      selectedPurchase.items.length >
                        0 ? (

                        selectedPurchase.items.map(
                          (
                            item,
                            index
                          ) => (

                            <tr
                              key={
                                `${item.product_id}-${index}`
                              }
                              style={{
                                borderBottom:
                                  '1px solid #f1f5f9'
                              }}
                            >

                              <td
                                style={{
                                  padding:
                                    '0.5rem 0.75rem'
                                }}
                              >

                                <div
                                  style={{
                                    fontWeight:
                                      '500'
                                  }}
                                >
                                  {
                                    item.product_name ||
                                    `Product #${item.product_id}`
                                  }
                                </div>

                                {item.barcode && (
                                  <div
                                    style={{
                                      fontSize:
                                        '0.7rem',
                                      color:
                                        '#94a3b8'
                                    }}
                                  >
                                    {
                                      item.barcode
                                    }
                                  </div>
                                )}

                              </td>

                              <td
                                style={{
                                  padding:
                                    '0.5rem 0.75rem',
                                  textAlign:
                                    'center'
                                }}
                              >
                                {
                                  item.quantity
                                }{' '}
                                {
                                  item.unit ||
                                  'pcs'
                                }
                              </td>

                              <td
                                style={{
                                  padding:
                                    '0.5rem 0.75rem',
                                  textAlign:
                                    'right'
                                }}
                              >
                                ₹
                                {parseFloat(
                                  item.unit_cost ||
                                  0
                                ).toFixed(
                                  2
                                )}
                              </td>

                              <td
                                style={{
                                  padding:
                                    '0.5rem 0.75rem',
                                  textAlign:
                                    'right',
                                  fontWeight:
                                    '600'
                                }}
                              >
                                ₹
                                {parseFloat(
                                  item.total_cost ||
                                  0
                                ).toFixed(
                                  2
                                )}
                              </td>

                            </tr>

                          )
                        )

                      ) : (

                        <tr>

                          <td
                            colSpan="4"
                            style={{
                              padding:
                                '1.5rem',
                              textAlign:
                                'center',
                              color:
                                '#94a3b8'
                            }}
                          >
                            No purchase
                            items found.
                          </td>

                        </tr>

                      )}

                    </tbody>

                  </table>

                </div>

                {/* TOTALS */}

                <div
                  style={{
                    textAlign:
                      'right',
                    fontSize:
                      '0.9rem',
                    display:
                      'flex',
                    flexDirection:
                      'column',
                    gap:
                      '0.25rem'
                  }}
                >

                  <div>
                    Total Amount:{' '}
                    <strong>
                      ₹
                      {parseFloat(
                        selectedPurchase.total_amount ||
                        0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div>
                    Paid Amount:{' '}
                    <strong
                      style={{
                        color:
                          '#059669'
                      }}
                    >
                      ₹
                      {parseFloat(
                        selectedPurchase.paid_amount ||
                        0
                      ).toFixed(2)}
                    </strong>
                  </div>

                  <div
                    style={{
                      color:
                        '#dc2626',
                      fontWeight:
                        '600'
                    }}
                  >
                    Due Amount:{' '}
                    ₹
                    {Math.max(
                      0,
                      parseFloat(
                        selectedPurchase.total_amount ||
                        0
                      ) -
                        parseFloat(
                          selectedPurchase.paid_amount ||
                          0
                        )
                    ).toFixed(2)}
                  </div>

                </div>

              </div>

              {/* DETAIL FOOTER */}

              <div
                style={{
                  padding:
                    '1rem 1.5rem',
                  borderTop:
                    '1px solid var(--border-color)',
                  display:
                    'flex',
                  justifyContent:
                    'flex-end',
                  backgroundColor:
                    '#f8fafc'
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    setShowDetailModal(
                      false
                    )
                  }
                  style={{
                    padding:
                      '0.5rem 1.25rem',
                    backgroundColor:
                      'var(--primary)',
                    color:
                      'white',
                    border:
                      'none',
                    borderRadius:
                      'var(--radius-md)',
                    fontWeight:
                      '600',
                    fontSize:
                      '0.85rem',
                    cursor:
                      'pointer'
                  }}
                >
                  Close
                </button>

              </div>

            </div>

          </div>

        )}

    </div>
  );
}
