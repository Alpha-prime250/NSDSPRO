import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Barcode, Printer, Search, Plus, RefreshCw, Check } from 'lucide-react';

export default function BarcodeGenerator({ settings }) {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [customName, setCustomName] = useState('');
  const [customBarcode, setCustomBarcode] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [copies, setCopies] = useState(24);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const currency = settings?.currency_symbol || '₹';
  const shopName = settings?.shop_name || 'Retail Grocery';

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({ limit: 100 });
      setProducts(data || []);
      if (data && data.length > 0) {
        selectProduct(data[0]);
      }
    } catch (err) {
      console.error('Failed to load products for barcodes:', err);
    } finally {
      setLoading(false);
    }
  };

  const selectProduct = (p) => {
    setSelectedProduct(p);
    setCustomName(p.name);
    setCustomBarcode(p.barcode || `890${Math.floor(100000000 + Math.random() * 900000000)}`);
    setCustomPrice(p.selling_price.toString());
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    (p.barcode && p.barcode.includes(search))
  );

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Barcode color="#059669" /> Barcode & Price Tag Generator
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Generate standard sticker labels for shelf pricing or loose repackaged grocery items.
          </p>
        </div>

        <button 
          onClick={handlePrint} 
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', fontSize: '0.95rem' }}
        >
          <Printer size={18} /> Print Label Sheet
        </button>
      </div>

      {/* Control Panel (Hidden on Print) */}
      <div className="card no-print" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Select Product */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem' }}>
              Select Item from Inventory
            </label>
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="input-field" 
                placeholder="Search by name or code..."
                style={{ paddingLeft: '2.25rem' }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div style={{ maxHeight: '140px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              {filteredProducts.map(p => (
                <div 
                  key={p.id}
                  onClick={() => selectProduct(p)}
                  style={{
                    padding: '0.5rem 0.75rem',
                    cursor: 'pointer',
                    backgroundColor: selectedProduct?.id === p.id ? 'var(--primary-light)' : 'transparent',
                    color: selectedProduct?.id === p.id ? 'var(--primary)' : 'inherit',
                    fontSize: '0.8125rem',
                    fontWeight: selectedProduct?.id === p.id ? '700' : '400',
                    display: 'flex',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid #f1f5f9'
                  }}
                >
                  <span>{p.name}</span>
                  <span>{currency}{p.selling_price}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Label Details */}
          <div>
            <div style={{ marginBottom: '0.75rem' }}>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                Label Header / Item Name
              </label>
              <input 
                type="text" 
                className="input-field" 
                value={customName}
                onChange={e => setCustomName(e.target.value)}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Barcode Number
                </label>
                <input 
                  type="text" 
                  className="input-field" 
                  value={customBarcode}
                  onChange={e => setCustomBarcode(e.target.value)}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem' }}>
                  Price ({currency})
                </label>
                <input 
                  type="number" 
                  className="input-field" 
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Sheet Layout Settings */}
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: '600', marginBottom: '0.35rem' }}>
              Number of Stickers to Print
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              {[12, 24, 36, 48].map(qty => (
                <button
                  key={qty}
                  onClick={() => setCopies(qty)}
                  className={`btn ${copies === qty ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.5rem', fontSize: '0.8125rem' }}
                >
                  {qty}
                </button>
              ))}
            </div>

            <div style={{
              padding: '0.875rem',
              backgroundColor: '#f8fafc',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)'
            }}>
              💡 <strong>Tip:</strong> Standard A4 sheet supports 24 labels (3 columns × 8 rows). Fits standard self-adhesive sticker sheets.
            </div>
          </div>
        </div>
      </div>

      {/* Printable Sheet Area */}
      <div className="printable-labels-container" style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        minHeight: '600px'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '12px'
        }}>
          {Array.from({ length: copies }).map((_, index) => (
            <div 
              key={index} 
              style={{
                border: '1px dashed #cbd5e1',
                borderRadius: '6px',
                padding: '10px 8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                backgroundColor: 'white',
                minHeight: '115px'
              }}
            >
              {/* Store Name */}
              <div style={{ fontSize: '9px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569' }}>
                {shopName}
              </div>

              {/* Item Name */}
              <div style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a', margin: '2px 0 4px', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {customName || 'Product Name'}
              </div>

              {/* Barcode Visual Bars (CSS Simulation of Code128) */}
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                height: '32px',
                gap: '1.5px',
                margin: '3px 0'
              }}>
                {(customBarcode || '890123456789').split('').map((char, i) => {
                  const val = parseInt(char, 10) || (char.charCodeAt(0) % 10);
                  const width = (val % 3) + 1.5;
                  return (
                    <div 
                      key={i} 
                      style={{
                        width: `${width}px`,
                        height: '100%',
                        backgroundColor: '#000'
                      }}
                    />
                  );
                })}
              </div>

              {/* Barcode Numbers */}
              <div style={{ fontSize: '10px', letterSpacing: '2px', fontFamily: 'monospace', fontWeight: '600', color: '#1e293b' }}>
                {customBarcode || '890123456789'}
              </div>

              {/* Selling Price */}
              <div style={{ fontSize: '13px', fontWeight: '900', color: '#000', marginTop: '2px' }}>
                MRP: {currency}{customPrice || '0.00'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .printable-labels-container, .printable-labels-container * {
            visibility: visible;
          }
          .printable-labels-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 0 !important;
            border: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}
