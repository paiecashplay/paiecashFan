import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { useToast } from '../../components/Toast';

const GAME_OPTIONS = ['aviator', 'slots', 'roulette', 'cricket', 'braai_poker', 'football', 'custom'];
const STATUS_OPTIONS = ['upcoming', 'live', 'completed', 'cancelled'];

export default function ContestAdmin() {
  const [contests, setContests] = useState([]);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '', description: '', game_id: 'aviator',
    entry_fee_pcc: 5, prize_pool_pcc: 500,
    max_entries: 100, status: 'upcoming'
  });
  const toast = useToast();
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('pcc_user') || '{}'); }
    catch { return {}; }
  })();

  useEffect(() => {
    if (!['frostrek_admin', 'club_admin'].includes(user?.role)) {
      navigate('/');
      return;
    }
    loadContests();
  }, []);

  const loadContests = async () => {
    try {
      const data = await api.getContests('all');
      setContests(data.contests || data || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title) { toast.error('Title is required'); return; }
    setCreating(true);
    try {
      const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const API_BASE = import.meta.env.VITE_API_URL || (IS_LOCAL ? 'http://localhost:3001' : '');
      const res = await fetch(`${API_BASE}/api/v2/admin/governance/contests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Failed');
      toast.success(`Contest "${form.title}" created successfully!`);
      setForm({
        title: '', description: '', game_id: 'aviator',
        entry_fee_pcc: 5, prize_pool_pcc: 500, max_entries: 100, status: 'upcoming'
      });
      loadContests();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', boxSizing: 'border-box',
    background: '#0f172a', border: '1px solid #374151',
    borderRadius: '8px', color: '#fff', fontSize: '14px'
  };

  return (
    <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto', color: '#fff' }}>
      <h1 style={{ fontWeight: '800', marginBottom: '4px' }}>⚙️ Contest Management</h1>
      <p style={{ color: '#6b7280', marginBottom: '24px', fontSize: '14px' }}>
        Create and manage PCC contests - Admin only
      </p>

      {/* Create Form */}
      <div style={{
        background: '#1a1a2e', border: '1px solid #374151',
        borderRadius: '16px', padding: '24px', marginBottom: '28px'
      }}>
        <h3 style={{ margin: '0 0 20px', color: '#f5a623' }}>➕ Create New Contest</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '700' }}>TITLE *</label>
            <input style={{ ...inputStyle, marginTop: '6px' }}
              value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Weekend Aviator Championship" />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '700' }}>DESCRIPTION</label>
            <input style={{ ...inputStyle, marginTop: '6px' }}
              value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Short description shown to players" />
          </div>
          {[
            { key: 'game_id', label: 'GAME', type: 'select', options: GAME_OPTIONS },
            { key: 'status', label: 'STATUS', type: 'select', options: STATUS_OPTIONS },
            { key: 'entry_fee_pcc', label: 'ENTRY FEE (PCC)', type: 'number' },
            { key: 'prize_pool_pcc', label: 'PRIZE POOL (PCC)', type: 'number' },
            { key: 'max_entries', label: 'MAX ENTRIES', type: 'number' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ color: '#9ca3af', fontSize: '12px', fontWeight: '700' }}>{field.label}</label>
              {field.type === 'select' ? (
                <select style={{ ...inputStyle, marginTop: '6px' }}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: e.target.value })}>
                  {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              ) : (
                <input type="number" style={{ ...inputStyle, marginTop: '6px' }}
                  value={form[field.key]}
                  onChange={e => setForm({ ...form, [field.key]: Number(e.target.value) })} />
              )}
            </div>
          ))}
        </div>
        <button onClick={handleCreate} disabled={creating} style={{
          marginTop: '20px', padding: '12px 28px',
          background: creating ? '#374151' : '#f5a623',
          color: creating ? '#6b7280' : '#000',
          border: 'none', borderRadius: '10px',
          fontWeight: '800', cursor: 'pointer', fontSize: '15px'
        }}>
          {creating ? 'Creating...' : '🚀 Create Contest'}
        </button>
      </div>

      {/* Existing Contests Table */}
      <h3 style={{ margin: '0 0 16px', color: '#fff' }}>All Contests ({contests.length})</h3>
      {loading ? (
        <p style={{ color: '#6b7280' }}>Loading...</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: '#0f172a' }}>
                {['Title', 'Game', 'Status', 'Entry', 'Prize Pool', 'Entries'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    color: '#6b7280', fontWeight: '700',
                    textTransform: 'uppercase', fontSize: '11px',
                    borderBottom: '1px solid #374151'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {contests.map((c, i) => (
                <tr key={c.id} style={{ background: i % 2 === 0 ? 'transparent' : '#ffffff05' }}>
                  <td style={{ padding: '12px 14px', color: '#e5e7eb', fontWeight: '600' }}>{c.title}</td>
                  <td style={{ padding: '12px 14px', color: '#9ca3af', textTransform: 'capitalize' }}>{c.game_id}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      background: c.status === 'live' ? '#064e3b' : c.status === 'upcoming' ? '#431407' : '#1f2937',
                      color: c.status === 'live' ? '#6ee7b7' : c.status === 'upcoming' ? '#fbbf24' : '#6b7280',
                      borderRadius: '20px', padding: '3px 10px', fontSize: '11px', fontWeight: '700'
                    }}>{c.status}</span>
                  </td>
                  <td style={{ padding: '12px 14px', color: '#f5a623', fontWeight: '700' }}>
                    {c.entry_fee_pcc > 0 ? `${c.entry_fee_pcc} PCC` : 'FREE'}
                  </td>
                  <td style={{ padding: '12px 14px', color: '#22c55e', fontWeight: '700' }}>
                    {c.prize_pool_pcc} PCC
                  </td>
                  <td style={{ padding: '12px 14px', color: '#9ca3af' }}>
                    {c.current_entries}/{c.max_entries || '∞'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
