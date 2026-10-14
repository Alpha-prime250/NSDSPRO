import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useOutletContext } from 'react-router-dom';
import { api } from '../../api';
import { useCart } from '../../context/CartContext';
import { Search, Filter, Plus, Minus, Check, ArrowUpDown, RefreshCw, ShoppingBag } from 'lucide-react';

export default function StoreShopPage() {
  const { settings } = useOutletContext();
  const { cart, addToCart, updateQty } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const currentCategory = searchParams.get('cat') || 'All';
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [sortBy, setSortBy] = useState('default');
  const [maxPrice, setMaxPrice] = useState(2000);

  const symbol = settings?.currency_symbol || '₹';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await api.getProducts({ limit: 200 });
      setProducts(list || []);
      const cats = ['All', ...new Set((list || []).map(p => p.category || 'General'))];
      setCategories(cats);
    } catch (err) {
      console.error('Failed to load shop catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat) => {
    if (cat === 'All') {
      searchParams.delete('cat');
    } else {
      searchParams.set('cat', cat);
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (val) {
      searchParams.set('q', val);
    } else {
      searchParams.delete('q');
    }
    setSearchParams(searchParams);
  };

  const getItemCartQty = (productId) => {
    const it = cart.find(i => i.product_id === productId);
    return it ? it.quantity : 0;
  };

  // Filter and Sort logic
  const filteredProducts = products
    .filter(p => {
      const matchesCat = currentCategory === 'All' || p.category === currentCategory;
      const matchesSearch = !searchTerm || 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesPrice = Number(p.selling_price) <= maxPrice;
      return matchesCat && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'price_asc') return Number(a.selling_price) - Number(b.selling_price);
      if (sortBy === 'price_desc') return Number(b.selling_price) - Number(a.selling_price);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Banner / Filter Header */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem 2rem',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--text-main)', margin: 0 }}>
              All Groceries & Daily Staples
            </h1>
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Showing {filteredProducts.length} items available for immediate home delivery
            </p>
          </div>

          {/* Search Bar & Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', minWidth: '260px' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-field"
                placeholder="Search atta, oil, milk, tea..."
                style={{ paddingLeft: '2.5rem', fontSize: '0.875rem' }}
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: '#f1f5f9', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)' }}>
              <ArrowUpDown size={15} color="var(--text-muted)" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                style={{ border: 'none', background: 'none', fontSize: '0.825rem', fontWeight: '600', color: 'var(--text-main)', outline: 'none', cursor: 'pointer' }}
              >
                <option value="default">Featured Sort</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          paddingBottom: '0.25rem'
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              style={{
                padding: '0.45rem 1rem',
                borderRadius: '9999px',
                border: currentCategory === cat ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: currentCategory === cat ? 'var(--primary)' : '#f8fafc',
                color: currentCategory === cat ? 'white' : 'var(--text-main)',
                fontSize: '0.825rem',
                fontWeight: currentCategory === cat ? '700' : '500',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-muted)' }}>
          <RefreshCw className="animate-spin" size={32} style={{ display: 'inline', marginBottom: '0.75rem' }} />
          <div>Loading fresh groceries catalog...</div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '4rem 2rem',
          textAlign: 'center',
          color: 'var(--text-muted)'
        }}>
          <ShoppingBag size={48} style={{ opacity: 0.3, margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-main)' }}>No matching items found</h3>
          <p style={{ fontSize: '0.85rem', marginTop: '0.35rem' }}>
            Try clearing your search term or select another category.
          </p>
          <button
            onClick={() => { setSearchTerm(''); handleCategorySelect('All'); }}
            className="btn btn-secondary"
            style={{ marginTop: '1rem' }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredProducts.map(prod => {
            const qtyInCart = getItemCartQty(prod.id);
            return (
              <div
                key={prod.id}
                style={{
                  backgroundColor: 'white',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 10px 20px -5px rgba(0,0,0,0.08)';
                  e.currentTarget.style.borderColor = '#cbd5e1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                {/* Category & Status */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontSize: '0.725rem',
                    fontWeight: '700',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    textTransform: 'uppercase'
                  }}>
                    {prod.category || 'Grocery'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: '700' }}>
                    In Stock
                  </span>
                </div>

                {/* Name & Pack */}
                <div>
                  <Link
                    to={`/product/${prod.id}`}
                    style={{
                      textDecoration: 'none',
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: 'var(--text-main)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: 1.3
                    }}
                  >
                    {prod.name}
                  </Link>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Pack size: 1 {prod.unit || 'pcs'}
                  </div>
                </div>

                {/* Pricing & Cart Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '900', color: 'var(--text-main)' }}>
                      {symbol}{Number(prod.selling_price).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      Inclusive of all taxes
                    </div>
                  </div>

                  {qtyInCart === 0 ? (
                    <button
                      onClick={() => addToCart(prod)}
                      className="btn btn-primary"
                      style={{ padding: '0.5rem 1rem', fontSize: '0.825rem', borderRadius: 'var(--radius-md)' }}
                    >
                      <Plus size={15} /> Add
                    </button>
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: 'var(--radius-md)',
                      overflow: 'hidden'
                    }}>
                      <button
                        onClick={() => updateQty(prod.id, -1)}
                        style={{ padding: '0.45rem 0.65rem', border: 'none', background: 'none', cursor: 'pointer', color: '#065f46' }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ fontWeight: '800', fontSize: '0.9rem', color: '#065f46', minWidth: '24px', textAlign: 'center' }}>
                        {qtyInCart}
                      </span>
                      <button
                        onClick={() => updateQty(prod.id, 1)}
                        style={{ padding: '0.45rem 0.65rem', border: 'none', background: 'none', cursor: 'pointer', color: '#065f46' }}
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
