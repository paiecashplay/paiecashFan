import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../App';
import { useWallet } from '../context/WalletContext';
import { useProfile } from '../hooks/useProfile';
import { Link } from 'react-router-dom';
import api, { supabase } from '../api';
import './ProfilePage.css';

/* ── Helpers ─────────────────────────────────────────────── */
function truncateAddr(addr, chars = 6) {
  if (!addr) return '-';
  return `${addr.slice(0, chars)}...${addr.slice(-4)}`;
}

function copyToClipboard(text, cb) {
  navigator.clipboard.writeText(text).then(cb).catch(() => { });
}

/* ── Sub-components ──────────────────────────────────────── */
function SourceBadge({ source }) {
  const labels = {
    custom: { text: '📷 Custom', cls: 'custom' },
    google: { text: '🔵 Google', cls: 'google' },
    generated: { text: '✨ Generated', cls: 'generated' },
  };
  const { text, cls } = labels[source] || labels.generated;
  return <span className={`profile-source-badge ${cls}`}>{text}</span>;
}

function ConfirmRemoveModal({ onConfirm, onCancel }) {
  return (
    <div className="profile-confirm-overlay" onClick={onCancel}>
      <motion.div
        className="profile-confirm-box"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🗑️</div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: 8 }}>
          Remove Profile Picture?
        </h3>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24, lineHeight: 1.5 }}>
          Your custom photo will be removed. We'll fall back to your Google image or a generated avatar.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '9px 22px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.15)',
              background: 'none', color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '9px 22px', borderRadius: 999, border: '1px solid rgba(255,82,82,0.3)',
              background: 'rgba(255,82,82,0.12)', color: '#ff5252', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function ProfilePage() {
  const { user, wallet, logout, updateProfile } = useAuth();
  const { balance } = useWallet();
  const {
    profileImage, imageSource, uploading, uploadError, fallbackImage,
    uploadImage, removeImage, customImage, regenerateAvatar,
  } = useProfile(user);

  const fileInputRef = useRef(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);

  const [editPrefs, setEditPrefs] = useState(false);
  const [prefsForm, setPrefsForm] = useState({ sport: '', team: '' });
  const [prefsLoading, setPrefsLoading] = useState(false);

  useEffect(() => {
    if (user?.country && user.country !== 'GLOBAL') {
      try {
        const p = JSON.parse(user.country);
        setPrefsForm({ sport: p.sport || '', team: p.team || '' });
      } catch (e) { }
    }
  }, [user]);

  const walletAddress = user?.walletAddress || wallet?.wallet_address;
  const walletId = user?.walletId || wallet?.circle_wallet_id;

  /* ── Handlers ──────────────────────────────────────────── */
  const handleFileSelect = useCallback(async (file) => {
    if (!file) return;
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = e => setPreviewSrc(e.target.result);
    reader.readAsDataURL(file);

    try {
      await uploadImage(file);

      // Also upload to server for public profile
      const formData = new FormData();
      formData.append('avatar', file);
      await api.uploadAvatar(formData);

      setUploadSuccess(true);
      setPreviewSrc(null);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch {
      setPreviewSrc(null);
    }
  }, [uploadImage]);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleCopyAddr = () => {
    if (!walletAddress) return;
    copyToClipboard(walletAddress, () => {
      setCopiedAddr(true);
      setTimeout(() => setCopiedAddr(false), 2000);
    });
  };

  const handleConfirmRemove = async () => {
    removeImage();
    setShowConfirm(false);
    try {
      // Fetch existing profile to preserve username
      const { data: profile } = await supabase.from('chat_profiles').select('username').eq('user_id', user.id).single();
      await api.updateChatProfile(profile?.username || user.name || 'User', null);
    } catch (e) { console.error(e); }
  };

  const handleRegenerate = async () => {
    regenerateAvatar();
    // After regeneration, sync the new Pravatar URL to the DB
    try {
      const newSeed = localStorage.getItem('pcc_avatar_seed');
      const newUrl = `https://i.pravatar.cc/250?u=${encodeURIComponent(newSeed)}`;
      const { data: profile } = await supabase.from('chat_profiles').select('username').eq('user_id', user.id).single();
      await api.updateChatProfile(profile?.username || user.name || 'User', newUrl);
    } catch (e) { console.error(e); }
  };

  const handleSavePrefs = async () => {
    setPrefsLoading(true);
    try {
      await updateProfile(prefsForm.sport, prefsForm.team);
      setEditPrefs(false);
    } catch (e) {
      console.error(e);
    }
    setPrefsLoading(false);
  };

  /* ── Stats ─────────────────────────────────────────────── */
  const stats = [
    { icon: '💰', value: balance !== null ? balance?.toLocaleString(undefined, { maximumFractionDigits: 2 }) : '-', label: 'PCC Balance' },
    { icon: '🎮', value: '-', label: 'Games Played' },
    { icon: '🏆', value: '-', label: 'Contests Won' },
    { icon: '🛒', value: '-', label: 'Orders' },
  ];

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <div className="profile-page">

      {/* ── Hero Card ─────────────────────────────────────── */}
      <motion.div
        className="profile-hero-card"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Banner */}
        <div className="profile-hero-banner">
          <div className="profile-banner-grid" />
          {/* Glowing orbs */}
          <div style={{
            position: 'absolute', top: '50%', left: '15%',
            width: 160, height: 160, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,230,118,0.15), transparent 70%)',
            transform: 'translateY(-50%)', pointerEvents: 'none',
          }} />
          <div style={{
            position: 'absolute', top: '30%', right: '20%',
            width: 120, height: 120, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,230,118,0.08), transparent 70%)',
            pointerEvents: 'none',
          }} />
        </div>

        {/* Body */}
        <div className="profile-hero-body">
          {/* Avatar + Info */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap' }}>

            {/* Avatar */}
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-ring">
                <div className="profile-avatar-inner">
                  <img
                    className="profile-avatar-img"
                    src={previewSrc || profileImage}
                    alt="Profile"
                    onError={e => { e.target.onerror = null; e.target.src = fallbackImage; }}
                  />
                </div>
                {/* Hover overlay */}
                <div
                  className="profile-avatar-overlay"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                  <span>Change</span>
                </div>
              </div>
              {/* Camera badge */}
              <button
                className="profile-avatar-badge"
                onClick={() => fileInputRef.current?.click()}
                title="Upload photo"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#060f0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
              </button>
            </div>

            {/* Info */}
            <div style={{ flex: 1, paddingBottom: 4 }}>
              <div className="profile-info-row">
                <div>
                  <div className="profile-name">{user?.name || 'Player'}</div>
                  <div className="profile-email-row">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                    {user?.email}
                  </div>
                  <SourceBadge source={imageSource} />
                </div>

                {/* Edit/Logout actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignSelf: 'flex-start' }}>
                  <Link
                    to="/history"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 999,
                      border: '1px solid rgba(0,230,118,0.2)',
                      background: 'rgba(0,230,118,0.06)',
                      color: '#00e676', fontSize: 12, fontWeight: 700,
                      textDecoration: 'none', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,230,118,0.13)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,230,118,0.06)'; }}
                  >
                    📜 History
                  </Link>
                  <button
                    onClick={logout}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 999,
                      border: '1px solid rgba(255,82,82,0.2)',
                      background: 'rgba(255,82,82,0.06)',
                      color: '#ff5252', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,82,82,0.14)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,82,82,0.06)'; }}
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>

              {/* Avatar controls */}
              <div className="profile-avatar-controls" style={{ marginTop: 14 }}>
                <button
                  className="profile-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? <span className="profile-spinner-ring" /> : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                  )}
                  {uploading ? 'Uploading…' : customImage ? 'Change Photo' : 'Upload Photo'}
                </button>

                {customImage && (
                  <button
                    className="profile-remove-btn"
                    onClick={() => setShowConfirm(true)}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                    </svg>
                    Remove
                  </button>
                )}

                {imageSource === 'generated' && (
                  <button
                    className="profile-remove-btn"
                    style={{
                      border: '1px solid rgba(0,230,118,0.3)',
                      background: 'rgba(0,230,118,0.1)',
                      color: '#00e676'
                    }}
                    onClick={handleRegenerate}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1 4 1 10 7 10"></polyline><polyline points="23 20 23 14 17 14"></polyline><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
                    </svg>
                    Regenerate
                  </button>
                )}
              </div>

              <p className="profile-upload-hint">JPG, PNG, GIF or WebP · max 5MB</p>

              {/* Feedback messages */}
              <AnimatePresence>
                {uploadSuccess && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ fontSize: 12, color: '#00e676', marginTop: 6, fontWeight: 600 }}
                  >
                    ✓ Profile picture updated!
                  </motion.p>
                )}
                {uploadError && (
                  <motion.p
                    initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    style={{ fontSize: 12, color: '#ff5252', marginTop: 6, fontWeight: 600 }}
                  >
                    ⚠ {uploadError}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Drag & Drop Zone (hidden file input) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleInputChange}
          />

          {/* Drop zone */}
          <div
            className={`profile-drop-zone ${dragging ? 'dragging' : ''}`}
            style={{ marginTop: 20 }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="profile-drop-zone-icon">📸</div>
            <p>Drag & drop a photo here, or <span style={{ color: '#00e676', fontWeight: 600 }}>click to browse</span></p>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Grid ──────────────────────────────────────── */}
      <motion.div
        className="profile-stats-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
      >
        {stats.map((s, i) => (
          <div className="profile-stat-card" key={i}>
            <div className="profile-stat-icon">{s.icon}</div>
            <div className="profile-stat-value">{s.value}</div>
            <div className="profile-stat-label">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* ── Info Cards ──────────────────────────────────────── */}
      <motion.div
        className="profile-cards-grid"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Account Info */}
        <div className="profile-info-card">
          <div className="profile-info-card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
            Account Info
          </div>
          {[
            { label: 'Name', value: user?.name || '-', highlight: false },
            { label: 'Email', value: user?.email || '-', highlight: false },
            { label: 'User ID', value: user?.id ? `#${user.id}` : '-', highlight: false },
            { label: 'Member Since', value: user?.created_at ? new Date(user.created_at).getFullYear() : '-', highlight: false },
          ].map(item => (
            <div className="profile-info-row-item" key={item.label}>
              <span className="profile-info-label">{item.label}</span>
              <span className={`profile-info-value ${item.highlight ? 'highlight' : ''}`} title={item.value}>
                {item.value}
              </span>
            </div>
          ))}
        </div>

        {/* Wallet Info */}
        <div className="profile-info-card">
          <div className="profile-info-card-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
            Wallet Details
          </div>

          <div className="profile-info-row-item">
            <span className="profile-info-label">PCC Balance</span>
            <span className="profile-info-value highlight">
              {balance !== null ? `${balance?.toLocaleString(undefined, { maximumFractionDigits: 2 })} PCC` : '-'}
            </span>
          </div>

          <div className="profile-info-row-item">
            <span className="profile-info-label">Network</span>
            <span className="profile-info-value">Polygon Amoy</span>
          </div>

          <div className="profile-info-row-item">
            <span className="profile-info-label">Wallet ID</span>
            <span className="profile-info-value" title={walletId}>
              {walletId ? truncateAddr(walletId, 8) : '-'}
            </span>
          </div>

          <div className="profile-info-row-item">
            <span className="profile-info-label">Address</span>
            <button
              className="profile-wallet-addr"
              onClick={handleCopyAddr}
              title="Click to copy"
            >
              {walletAddress ? truncateAddr(walletAddress) : '-'}
              {walletAddress && (
                copiedAddr ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                )
              )}
            </button>
          </div>
        </div>

        {/* Preferences Info */}
        <div className="profile-info-card">
          <div className="profile-info-card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              Preferences
            </div>
            {!editPrefs ? (
              <button
                onClick={() => setEditPrefs(true)}
                style={{ fontSize: 11, background: 'none', border: '1px solid rgba(0,230,118,0.4)', color: '#00e676', padding: '2px 8px', borderRadius: 999, cursor: 'pointer' }}
              >
                Edit
              </button>
            ) : (
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setEditPrefs(false)}
                  style={{ fontSize: 11, background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.7)', padding: '2px 8px', borderRadius: 999, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrefs}
                  disabled={prefsLoading}
                  style={{ fontSize: 11, background: '#00e676', border: 'none', color: '#060f0a', padding: '2px 8px', borderRadius: 999, cursor: 'pointer', fontWeight: 'bold' }}
                >
                  {prefsLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            )}
          </div>

          {!editPrefs ? (
            <>
              <div className="profile-info-row-item">
                <span className="profile-info-label">Favorite Sport</span>
                <span className="profile-info-value highlight">{prefsForm.sport || '-'}</span>
              </div>
              <div className="profile-info-row-item">
                <span className="profile-info-label">Favorite Team</span>
                <span className="profile-info-value highlight">{prefsForm.team || '-'}</span>
              </div>
            </>
          ) : (
            <>
              <div className="profile-info-row-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
                <span className="profile-info-label">Favorite Sport</span>
                <input
                  type="text"
                  value={prefsForm.sport}
                  onChange={e => setPrefsForm(p => ({ ...p, sport: e.target.value }))}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: 13 }}
                />
              </div>
              <div className="profile-info-row-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 6, marginTop: 10 }}>
                <span className="profile-info-label">Favorite Team</span>
                <input
                  type="text"
                  value={prefsForm.team}
                  onChange={e => setPrefsForm(p => ({ ...p, team: e.target.value }))}
                  style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '6px 10px', borderRadius: 6, fontSize: 13 }}
                />
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* ── Confirm Remove Modal ─────────────────────────────── */}
      <AnimatePresence>
        {showConfirm && (
          <ConfirmRemoveModal
            onConfirm={handleConfirmRemove}
            onCancel={() => setShowConfirm(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
