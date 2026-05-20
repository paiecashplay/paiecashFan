import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, Trash2, Package, DollarSign, ShoppingBag, LogOut, LayoutGrid, List } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function MerchantDashboard() {
  const toast = useToast();
  const [merchant, setMerchant] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', pricePcc: '', description: '', imageUrl: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem('pcc_merchant_token');
    if (!saved) {
      navigate('/merchant/login');
      return;
    }
    const data = JSON.parse(saved);
    setMerchant(data);
    loadDashboard(data.user.tenant_id);
  }, []);

  const loadDashboard = async (tenantId) => {
    try {
      const data = await api.getClubDashboard(tenantId);
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.createProduct({
        tenantId: merchant.user.tenant_id,
        ...newProduct
      });
      setShowAddModal(false);
      setNewProduct({ name: '', pricePcc: '', description: '', imageUrl: '' });
      loadDashboard(merchant.user.tenant_id);
    } catch (err) {
      toast.error('Failed to add product: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.deleteProduct(id);
      loadDashboard(merchant.user.tenant_id);
    } catch (err) {
      toast.error('Delete failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('pcc_merchant_token');
    navigate('/merchant/login');
  };

  if (loading) return <div style={{ padding: 100, textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;
  if (!stats) return <div className="section">Error loading dashboard</div>;

  return (
    <div className="section fade-in" style={{ paddingBottom: 100 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900 }}>{stats.club?.club_name} Admin</h1>
          <p style={{ color: 'var(--text-dim)' }}>Manage your club storefront and track performance</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}><Plus size={18} /> Add Product</button>
          <button className="btn btn-outline" onClick={logout}><LogOut size={18} /> Logout</button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 48 }}>
        <div className="card-glass" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ color: 'var(--primary)', marginBottom: 12 }}><DollarSign size={32} style={{ margin: '0 auto' }} /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.earnings?.toLocaleString()} PCC</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 4 }}>Total Earnings</div>
        </div>
        <div className="card-glass" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ color: 'var(--accent)', marginBottom: 12 }}><ShoppingBag size={32} style={{ margin: '0 auto' }} /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.totalSales}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 4 }}>Total Sales</div>
        </div>
        <div className="card-glass" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ color: '#ec4899', marginBottom: 12 }}><Package size={32} style={{ margin: '0 auto' }} /></div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{stats.products?.length}</div>
          <div style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginTop: 4 }}>Live Products</div>
        </div>
      </div>

      <div className="card-glass" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><List size={20} /> Product Inventory</h3>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.2)', textAlign: 'left' }}>
                <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 600, fontSize: '0.8rem' }}>PRODUCT</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 600, fontSize: '0.8rem' }}>PRICE</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 600, fontSize: '0.8rem' }}>DESCRIPTION</th>
                <th style={{ padding: '16px 24px', color: 'var(--text-dim)', fontWeight: 600, fontSize: '0.8rem', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {stats.products?.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={p.image_url} alt="" style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', background: '#000' }} />
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <span className="mono" style={{ color: 'var(--primary)', fontWeight: 700 }}>{p.pcc_price} PCC</span>
                  </td>
                  <td style={{ padding: '16px 24px', color: 'var(--text-dim)', fontSize: '0.85rem', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.description || '-'}
                  </td>
                  <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                    <button className="btn btn-sm btn-outline" style={{ color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }} onClick={() => handleDeleteProduct(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {stats.products?.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ padding: 60, textAlign: 'center', color: 'var(--text-dim)' }}>
                    No products added yet. Click "Add Product" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div className="card-glass fade-in" style={{ maxWidth: 500, width: '100%', padding: 32 }}>
            <h3 style={{ marginBottom: 24 }}>Add New Product</h3>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input className="form-input" placeholder="e.g. Official Home Jersey 24/25" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Price (PCC)</label>
                <input className="form-input" type="number" placeholder="50" value={newProduct.pricePcc} onChange={e => setNewProduct({...newProduct, pricePcc: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input className="form-input" placeholder="https://..." value={newProduct.imageUrl} onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" style={{ minHeight: 80 }} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <button type="button" className="btn btn-outline btn-block" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button className="btn btn-primary btn-block">Create Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
