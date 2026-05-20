import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Store, CheckCircle, ArrowRight, Building, Globe, Trophy } from 'lucide-react';

export default function ClubOnboarding() {
  const [formData, setFormData] = useState({
    applicantName: '',
    applicantEmail: '',
    clubName: '',
    country: '',
    sport: 'Football',
    website: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.registerMerchant({
        name: formData.clubName,
        email: formData.applicantEmail
      });
      // Also send formal application
      await api.applyClub(formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Onboarding failed');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="section" style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card-glass fade-in" style={{ maxWidth: 500, width: '100%', padding: 40, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <CheckCircle size={48} />
          </div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 12 }}>Application Submitted!</h2>
          <p style={{ color: 'var(--text-dim)', marginBottom: 32 }}>
            Your club application for <strong>{formData.clubName}</strong> has been received. Our governance team will review your details and contact you at <strong>{formData.applicantEmail}</strong> soon.
          </p>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/')}>
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="section" style={{ padding: '60px 20px' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="badge badge-accent" style={{ marginBottom: 16 }}>For Sports Clubs</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: 16 }}>Onboard Your Club</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem', maxWidth: 600, margin: '0 auto' }}>
            Join the PaieCash ecosystem, list your merchandise, and engage with fans globally through our robust PCC-powered marketplace.
          </p>
        </div>

        <div className="grid-2" style={{ gap: 40 }}>
          <div className="card-glass" style={{ padding: 32 }}>
            <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}><Store size={24} color="var(--primary)" /> Application Form</h3>
            
            {error && <div className="badge badge-failed" style={{ width: '100%', padding: 12, marginBottom: 20 }}>{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Applicant Name</label>
                <input className="form-input" placeholder="Your Name" value={formData.applicantName} onChange={e => setFormData({...formData, applicantName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input className="form-input" type="email" placeholder="admin@club.com" value={formData.applicantEmail} onChange={e => setFormData({...formData, applicantEmail: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Club Name</label>
                <input className="form-input" placeholder="Official Club Name" value={formData.clubName} onChange={e => setFormData({...formData, clubName: e.target.value})} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input className="form-input" placeholder="e.g. India" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Sport</label>
                  <select className="form-select" value={formData.sport} onChange={e => setFormData({...formData, sport: e.target.value})}>
                    <option>Football</option>
                    <option>Cricket</option>
                    <option>Basketball</option>
                    <option>Rugby</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Website (Optional)</label>
                <input className="form-input" placeholder="https://yourclub.com" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Club Description</label>
                <textarea className="form-input" style={{ minHeight: 100 }} placeholder="Tell us about your club..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={loading}>
                {loading ? <div className="spinner" /> : <>Submit Application <ArrowRight size={18} style={{ marginLeft: 8 }} /></>}
              </button>
            </form>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            <div className="card-glass" style={{ padding: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Building size={20} />
              </div>
              <h4 style={{ marginBottom: 8 }}>Global Reach</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Access a global fan base and accept payments in PCC with zero cross-border friction.</p>
            </div>
            <div className="card-glass" style={{ padding: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Globe size={20} />
              </div>
              <h4 style={{ marginBottom: 8 }}>Real-time Inventory</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>List products and see them updated instantly on the fan dashboard and marketplace.</p>
            </div>
            <div className="card-glass" style={{ padding: 24 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
                <Trophy size={20} />
              </div>
              <h4 style={{ marginBottom: 8 }}>Engage Fans</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-dim)' }}>Offer exclusive merchandise, digital collectibles, and contest entries to your loyal supporters.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
