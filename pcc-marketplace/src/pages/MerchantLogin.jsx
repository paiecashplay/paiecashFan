import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { LayoutDashboard, LogIn, ArrowRight } from 'lucide-react';

export default function MerchantLogin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // For club admins, we use the same user login but check for tenant_id
      const data = await api.login(email);
      if (!data.user.tenant_id && data.user.role !== 'club_admin') {
        throw new Error('This account is not registered as a club admin.');
      }
      localStorage.setItem('pcc_merchant_token', JSON.stringify(data));
      navigate('/merchant/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card-glass fade-in" style={{ maxWidth: 400, width: '100%', padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ margin: '0 auto 16px', display: 'flex', justifyContent: 'center' }}>
            <img src="/images/logo.png" alt="Paiecash Logo" style={{ width: 100, height: 100, objectFit: 'contain' }} />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Merchant Access</h2>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Manage your club storefront</p>
        </div>

        {error && <div className="badge badge-failed" style={{ width: '100%', padding: 12, marginBottom: 20 }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Merchant Email</label>
            <input 
              className="form-input" 
              type="email" 
              placeholder="admin@yourclub.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <button className="btn btn-accent" style={{ width: '100%', marginTop: 8 }} disabled={loading}>
            {loading ? <div className="spinner" /> : <>Access Dashboard <ArrowRight size={18} style={{ marginLeft: 8 }} /></>}
          </button>
        </form>
      </div>
    </div>
  );
}
