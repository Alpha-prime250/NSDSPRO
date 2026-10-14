import React, { useState, useEffect, useRef } from 'react';
import { api } from '../api';
import { 
  Search, 
  Barcode, 
  Trash2, 
  Plus, 
  Minus, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Users, 
  Check, 
  X, 
  AlertCircle,
  Receipt,
  PauseCircle,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function POSBilling({ settings, onSaleComplete }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  
  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [barcodeInput, setBarcodeInput] = useState('');

  // Checkout State
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [receivedAmount, setReceivedAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Split Payment States
  const [splitCash, setSplitCash] = useState('');
  const [splitUPI, setSplitUPI] = useState('');
  const [splitCard, setSplitCard] = useState('');
  const [splitCredit, setSplitCredit] = useState('');

  // Held Bills States (Persisted in localStorage)
  const [heldBills, setHeldBills] = useState(() => {
    try {
      const saved = localStorage.getItem('pos_held_bills');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHeldBillsModal, setShowHeldBillsModal] = useState(false);

  const barcodeInputRef = useRef(null);

  // Load products & customers on mount
  useEffect(() => {
    loadData();
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  const loadData = async () => {
    try {
      const [prodList, custList] = await Promise.all([
        api.getProducts(),
        api.getCustomers()
      ]);
      setProducts(prodList);
      setCustomers(custList);
    } catch (err) {
      console.error('Failed to load POS data:', err);
    }
  };

  // Categories list
  const categories = ['All', ...new Set(products.map(p => p.category || 'General'))];

  // Filtered product grid
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (p.barcode && p.barcode.includes(searchTerm));
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Add product to cart
  const addToCart = (product) => {
    if (product.quantity <= 0) {
      setErrorMsg(`"${product.name}" is out of stock!`);
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          setErrorMsg(`Cannot add more than available stock (${product.quantity})`);
          setTimeout(() => setErrorMsg(''), 3000);
          return prev;
        }
        return prev.map(item => 
          item.product_id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, {
          product_id: product.id,
          product_name: product.name,
          barcode: product.barcode || '',
          unit_purchase_price: Number(product.purchase_price || 0),
          unit_selling_price: Number(product.selling_price),
          quantity: 1,
          max_stock: Number(product.quantity),
          unit: product.unit || 'pcs'
        }];
      }
    });
  };

  // Handle barcode scanner input
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(p => p.barcode === barcodeInput.trim());
    if (matched) {
      addToCart(matched);
      setBarcodeInput('');
    } else {
      setErrorMsg(`No product found with barcode: ${barcodeInput}`);
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  // Adjust cart item quantity
  const updateQuantity = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQty = item.quantity + delta;
        if (newQty <= 0) return null;
        if (newQty > item.max_stock) {
          setErrorMsg(`Cannot exceed available stock of ${item.max_stock}`);
          setTimeout(() => setErrorMsg(''), 3000);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountAmount(0);
    setReceivedAmount('');
    setSelectedCustomer(null);
    setPaymentMode('Cash');
    setSplitCash('');
    setSplitUPI('');
    setSplitCard('');
    setSplitCredit('');
  };

  // Hold / Park Bill Handlers
  const handleHoldBill = () => {
    if (cart.length === 0) {
      setErrorMsg('Cannot hold an empty cart.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    const defaultName = selectedCustomer ? selectedCustomer.name : `Customer #${heldBills.length + 1}`;
    const note = window.prompt('Enter identifier/name for this held bill:', defaultName);
    if (note === null) return; // User cancelled

    const newHeldBill = {
      id: Date.now(),
      heldAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      note: note || `Bill #${heldBills.length + 1}`,
      cart: [...cart],
      selectedCustomer,
      discountAmount,
      paymentMode,
      totalAmount
    };

    const updated = [newHeldBill, ...heldBills];
    setHeldBills(updated);
    localStorage.setItem('pos_held_bills', JSON.stringify(updated));
    clearCart();
    setErrorMsg('');
  };

  const handleResumeBill = (bill) => {
    if (cart.length > 0) {
      if (!window.confirm('Current cart has items. Replace it with the held bill?')) {
        return;
      }
    }

    setCart(bill.cart || []);
    setSelectedCustomer(bill.selectedCustomer || null);
    setDiscountAmount(bill.discountAmount || 0);
    setPaymentMode(bill.paymentMode || 'Cash');

    const updated = heldBills.filter(b => b.id !== bill.id);
    setHeldBills(updated);
    localStorage.setItem('pos_held_bills', JSON.stringify(updated));
    setShowHeldBillsModal(false);
  };

  const handleDiscardHeldBill = (billId) => {
    if (!window.confirm('Are you sure you want to discard this held bill?')) return;
    const updated = heldBills.filter(b => b.id !== billId);
    setHeldBills(updated);
    localStorage.setItem('pos_held_bills', JSON.stringify(updated));
  };

  // Bill Calculations
  const subtotal = cart.reduce((sum, item) => sum + (item.unit_selling_price * item.quantity), 0);
  const discount = Math.min(Number(discountAmount || 0), subtotal);
  const taxRate = Number(settings?.default_tax_percent || 0);
  const taxAmount = Number(((subtotal - discount) * (taxRate / 100)).toFixed(2));
  const totalAmount = Number((subtotal - discount + taxAmount).toFixed(2));
  
  const symbol = settings?.currency_symbol || '₹';
  const tenderCash = receivedAmount ? Number(receivedAmount) : totalAmount;
  const changeToReturn = Math.max(0, tenderCash - totalAmount);

  // Split payment totals
  const totalSplitAllocated = Number((
    (Number(splitCash) || 0) +
    (Number(splitUPI) || 0) +
    (Number(splitCard) || 0) +
    (Number(splitCredit) || 0)
  ).toFixed(2));
  const splitDifference = Number((totalAmount - totalSplitAllocated).toFixed(2));

  // Complete Sale
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMsg('Cart is empty. Please add items to checkout.');
      return;
    }

    if (paymentMode === 'Credit' && !selectedCustomer) {
      setErrorMsg('Please select a customer for credit / udhaar sales.');
      return;
    }

    if (paymentMode === 'Split') {
      if (Math.abs(splitDifference) > 0.05) {
        setErrorMsg(`Split payment must match total (${symbol}${totalAmount.toFixed(2)}). Remaining to allocate: ${symbol}${splitDifference.toFixed(2)}`);
        return;
      }
      if ((Number(splitCredit) || 0) > 0 && !selectedCustomer) {
        setErrorMsg('Please select a customer to record the Khata / Credit portion.');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      const salePayload = {
        customer_id: selectedCustomer ? selectedCustomer.id : null,
        customer_name: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
        payment_mode: paymentMode,
        tax_percent: taxRate,
        discount_amount: discount,
        received_amount: paymentMode === 'Cash' ? tenderCash : totalAmount,
        payment_split: paymentMode === 'Split' ? {
          cash: Number(splitCash) || 0,
          upi: Number(splitUPI) || 0,
          card: Number(splitCard) || 0,
          credit: Number(splitCredit) || 0
        } : null,
        items: cart.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          barcode: item.barcode,
          unit_purchase_price: item.unit_purchase_price,
          unit_selling_price: item.unit_selling_price,
          quantity: item.quantity
        }))
      };

      const createdInvoice = await api.createSale(salePayload);
      clearCart();
      loadData(); // Refresh product stock
      if (onSaleComplete) {
        onSaleComplete(createdInvoice);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMsg(err.message || 'Failed to complete transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '1.25rem', height: '100%' }}>
      {/* LEFT COLUMN: Product Catalog & Barcode Scanner */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
        {/* Search & Barcode Header */}
        <div className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {/* Barcode Fast Scan Field */}
          <form onSubmit={handleBarcodeSubmit} style={{ flex: '0 0 220px', position: 'relative' }}>
            <Barcode size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              ref={barcodeInputRef}
              type="text"
              placeholder="Scan Barcode (Enter)..."
              value={barcodeInput}
              onChange={e => setBarcodeInput(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.2rem' }}
            />
          </form>

          {/* Product Name Search */}
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text"
              placeholder="Search products by title or code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.2rem' }}
            />
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '9999px',
                border: '1px solid var(--border-color)',
                backgroundColor: selectedCategory === cat ? 'var(--primary)' : 'white',
                color: selectedCategory === cat ? 'white' : 'var(--text-main)',
                fontSize: '0.8125rem',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error Alert if any */}
        {errorMsg && (
          <div style={{
            padding: '0.625rem 1rem',
            backgroundColor: 'var(--danger-light)',
            color: 'var(--danger)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8125rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Product Cards Grid */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '0.875rem',
          paddingRight: '0.25rem'
        }}>
          {filteredProducts.map(prod => {
            const isOutOfStock = prod.quantity <= 0;
            return (
              <div 
                key={prod.id}
                onClick={() => !isOutOfStock && addToCart(prod)}
                className="card"
                style={{
                  cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                  opacity: isOutOfStock ? 0.6 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  border: '1px solid var(--border-color)',
                  transition: 'transform 0.1s ease, box-shadow 0.1s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>
                    {prod.category}
                  </div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '700', marginTop: '0.2rem', lineHeight: 1.3 }}>
                    {prod.name}
                  </h4>
                </div>

                <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <span style={{ fontSize: '1.05rem', fontWeight: '800', color: 'var(--primary)' }}>
                      {symbol}{Number(prod.selling_price).toFixed(2)}
                    </span>
                  </div>
                  <span className={`badge ${prod.quantity <= prod.min_stock_level ? 'badge-danger' : 'badge-info'}`}>
                    {Number(prod.quantity).toFixed(0)} {prod.unit}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Current Sale Cart & Checkout Panel */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '1.25rem' }}>
        {/* Cart Header & Hold / Clear Buttons */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', margin: 0 }}>Active Invoice</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {cart.length} unique {cart.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              onClick={() => setShowHeldBillsModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.3rem 0.6rem',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                backgroundColor: heldBills.length > 0 ? '#eff6ff' : '#f8fafc',
                color: heldBills.length > 0 ? '#2563eb' : '#64748b',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Clock size={13} />
              <span>Held ({heldBills.length})</span>
            </button>
            {cart.length > 0 && (
              <button
                type="button"
                onClick={handleHoldBill}
                title="Park this bill and serve next customer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '6px',
                  border: '1px solid #f59e0b',
                  backgroundColor: '#fffbeb',
                  color: '#b45309',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                <PauseCircle size={13} />
                <span>Hold</span>
              </button>
            )}
            {cart.length > 0 && (
              <button 
                onClick={clearCart} 
                style={{ background: 'none', border: 'none', color: 'var(--danger)', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer', padding: '0.3rem' }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Customer Select */}
        <div style={{ marginBottom: '0.75rem' }}>
          <select 
            value={selectedCustomer?.id || ''}
            onChange={e => {
              const cust = customers.find(c => c.id === e.target.value);
              setSelectedCustomer(cust || null);
            }}
            className="input-field"
            style={{ fontSize: '0.8125rem', fontWeight: '500' }}
          >
            <option value="">👤 Walk-in Customer (Default)</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.phone ? `(${c.phone})` : ''} {c.outstanding_dues > 0 ? `· Due: ${symbol}${c.outstanding_dues}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Cart Item Rows */}
        <div style={{ flex: 1, overflowY: 'auto', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '0.5rem 0' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem 1rem' }}>
              <Receipt size={36} style={{ margin: '0 auto 0.75rem auto', opacity: 0.4 }} />
              <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Cart is empty</div>
              <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Scan barcode or click on products to add</div>
            </div>
          ) : (
            cart.map(item => (
              <div 
                key={item.product_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.625rem 0',
                  borderBottom: '1px solid #f1f5f9'
                }}
              >
                <div style={{ flex: 1, paddingRight: '0.5rem' }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: '700', lineHeight: 1.2 }}>
                    {item.product_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {symbol}{item.unit_selling_price.toFixed(2)} &times; {item.quantity}
                  </div>
                </div>

                {/* Qty Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <button 
                    onClick={() => updateQuantity(item.product_id, -1)}
                    style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Minus size={12} />
                  </button>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', minWidth: '24px', textAlign: 'center' }}>
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(item.product_id, 1)}
                    style={{ width: '24px', height: '24px', borderRadius: '4px', border: '1px solid var(--border-color)', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                {/* Item Line Total */}
                <div style={{ width: '70px', textAlign: 'right', fontWeight: '700', fontSize: '0.875rem' }}>
                  {symbol}{(item.unit_selling_price * item.quantity).toFixed(2)}
                </div>

                {/* Remove */}
                <button 
                  onClick={() => removeFromCart(item.product_id)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', marginLeft: '0.5rem' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Checkout Summary & Payment Options */}
        <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
          {/* Subtotal, Discount & Tax */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>{symbol}{subtotal.toFixed(2)}</span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Discount</span>
            <div style={{ width: '100px' }}>
              <input 
                type="number"
                min="0"
                value={discountAmount}
                onChange={e => setDiscountAmount(Math.max(0, Number(e.target.value)))}
                className="input-field"
                style={{ padding: '0.25rem 0.5rem', textAlign: 'right', fontSize: '0.8125rem' }}
              />
            </div>
          </div>

          {taxRate > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span>Tax ({taxRate}%)</span>
              <span>{symbol}{taxAmount.toFixed(2)}</span>
            </div>
          )}

          {/* Grand Total */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '0.4rem',
            borderTop: '2px dashed var(--border-color)',
            fontSize: '1.25rem',
            fontWeight: '800',
            color: 'var(--primary)'
          }}>
            <span>Total Payable</span>
            <span>{symbol}{totalAmount.toFixed(2)}</span>
          </div>

          {/* Payment Method Selector (5 Modes) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.3rem', marginTop: '0.25rem' }}>
            {[
              { id: 'Cash', icon: Banknote, label: 'Cash' },
              { id: 'UPI', icon: QrCode, label: 'UPI' },
              { id: 'Card', icon: CreditCard, label: 'Card' },
              { id: 'Credit', icon: Users, label: 'Credit' },
              { id: 'Split', icon: Layers, label: 'Split' }
            ].map(m => {
              const Icon = m.icon;
              const isSelected = paymentMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setPaymentMode(m.id)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.2rem',
                    padding: '0.35rem 0.2rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                    backgroundColor: isSelected ? 'var(--primary-light)' : 'white',
                    color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                    fontWeight: isSelected ? '700' : '500',
                    fontSize: '0.72rem',
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={15} />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cash Tender Input if Cash */}
          {paymentMode === 'Cash' && totalAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ flex: 1 }}>
                <input 
                  type="number"
                  placeholder="Cash Received..."
                  value={receivedAmount}
                  onChange={e => setReceivedAmount(e.target.value)}
                  className="input-field"
                  style={{ fontSize: '0.8125rem', padding: '0.4rem 0.6rem' }}
                />
              </div>
              {tenderCash > totalAmount && (
                <div style={{ fontSize: '0.8125rem', fontWeight: '700', color: 'var(--primary)' }}>
                  Change: {symbol}{changeToReturn.toFixed(2)}
                </div>
              )}
            </div>
          )}

          {/* Split Payment Allocation Inputs */}
          {paymentMode === 'Split' && totalAmount > 0 && (
            <div style={{
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '0.65rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.4rem',
              marginTop: '0.25rem'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.15rem' }}>
                    Cash ({symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={splitCash}
                    onChange={e => setSplitCash(e.target.value)}
                    style={{ width: '100%', padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.15rem' }}>
                    UPI / QR ({symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={splitUPI}
                    onChange={e => setSplitUPI(e.target.value)}
                    style={{ width: '100%', padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.15rem' }}>
                    Card ({symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={splitCard}
                    onChange={e => setSplitCard(e.target.value)}
                    style={{ width: '100%', padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '0.15rem' }}>
                    Khata / Credit ({symbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0.00"
                    value={splitCredit}
                    onChange={e => setSplitCredit(e.target.value)}
                    style={{ width: '100%', padding: '0.3rem 0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                  />
                </div>
              </div>

              {/* Allocation balance status */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '0.35rem',
                borderTop: '1px dashed #cbd5e1',
                fontSize: '0.75rem'
              }}>
                <span>Allocated: <strong>{symbol}{totalSplitAllocated.toFixed(2)}</strong></span>
                {Math.abs(splitDifference) <= 0.05 ? (
                  <span style={{ color: '#059669', fontWeight: '700' }}>✓ Match</span>
                ) : (
                  <span style={{ color: '#dc2626', fontWeight: '700' }}>
                    Rem: {symbol}{splitDifference.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Checkout Submit Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || isSubmitting}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.7rem', fontSize: '0.95rem', marginTop: '0.35rem' }}
          >
            {isSubmitting ? 'Processing Sale...' : `Complete Sale (${symbol}${totalAmount.toFixed(2)})`}
          </button>
        </div>
      </div>

      {/* Held Bills Modal */}
      {showHeldBillsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            width: '100%',
            maxWidth: '520px',
            maxHeight: '80vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <PauseCircle size={18} color="#d97706" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: '700' }}>
                  Parked / Held Bills ({heldBills.length})
                </h3>
              </div>
              <button
                onClick={() => setShowHeldBillsModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ padding: '1rem', overflowY: 'auto', flex: 1 }}>
              {heldBills.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#94a3b8' }}>
                  No bills are currently on hold.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {heldBills.map((bill) => (
                    <div
                      key={bill.id}
                      style={{
                        padding: '0.85rem',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: '#ffffff',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '700', fontSize: '0.9rem' }}>{bill.note}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.15rem' }}>
                          Held at {bill.heldAt} · {bill.cart?.length || 0} items · <strong>{symbol}{parseFloat(bill.totalAmount || 0).toFixed(2)}</strong>
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => handleResumeBill(bill)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.78rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.3rem'
                          }}
                        >
                          <span>Resume</span>
                          <ArrowRight size={13} />
                        </button>
                        <button
                          onClick={() => handleDiscardHeldBill(bill.id)}
                          style={{
                            padding: '0.4rem 0.6rem',
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            border: 'none',
                            borderRadius: 'var(--radius-md)',
                            fontSize: '0.78rem',
                            cursor: 'pointer'
                          }}
                          title="Discard Bill"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'flex-end', backgroundColor: '#f8fafc' }}>
              <button
                onClick={() => setShowHeldBillsModal(false)}
                className="btn btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.35rem 0.85rem' }}
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
