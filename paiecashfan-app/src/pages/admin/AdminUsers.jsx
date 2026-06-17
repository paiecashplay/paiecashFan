// BO Super Admin — Gestion des utilisateurs
// Affiche tous les profils, permet de changer le rôle (fan / club_admin / super_admin)
// et de valider ou rejeter les demandes d'accès club_admin (role_request = 'club_admin').
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, Check, X, Shield, User, Crown, UserPlus, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { apiFetch } from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';

const ROLES = ['fan', 'club_admin', 'super_admin'];
const ROLE_META = {
  fan:         { label: 'Fan',         color: 'text-bone-400   bg-white/5      border-white/10',     icon: User   },
  club_admin:  { label: 'Club Admin',  color: 'text-cyan-400   bg-cyan-500/10  border-cyan-500/20',  icon: Shield },
  super_admin: { label: 'Super Admin', color: 'text-amber-400  bg-amber-500/10 border-amber-500/20', icon: Crown  },
};

export function AdminUsers() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [filter, setFilter]     = useState('all');    // all | fan | club_admin | pending
  const [saving, setSaving]     = useState(null);     // userId en cours de save
  const [toast, setToast]       = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, username, avatar_url, role, role_request, club_id, created_at')
      .order('created_at', { ascending: false });
    if (!error) setProfiles(data || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function changeRole(userId, newRole) {
    setSaving(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole, role_request: null })
      .eq('id', userId);
    if (!error) {
      setProfiles((prev) => prev.map((p) =>
        p.id === userId ? { ...p, role: newRole, role_request: null } : p
      ));
      showToast('Rôle mis à jour');
    }
    setSaving(null);
  }

  async function approveRoleRequest(userId) {
    const profile = profiles.find((p) => p.id === userId);
    if (!profile?.role_request) return;
    await changeRole(userId, profile.role_request);
  }

  async function rejectRoleRequest(userId) {
    setSaving(userId);
    const { error } = await supabase
      .from('profiles')
      .update({ role_request: null })
      .eq('id', userId);
    if (!error) {
      setProfiles((prev) => prev.map((p) =>
        p.id === userId ? { ...p, role_request: null } : p
      ));
      showToast('Demande refusée');
    }
    setSaving(null);
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  const filtered = profiles.filter((p) => {
    const matchSearch = !search ||
      (p.display_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.username || '').toLowerCase().includes(search.toLowerCase()) ||
      p.id.includes(search);
    const matchFilter =
      filter === 'all'      ? true :
      filter === 'pending'  ? Boolean(p.role_request) :
      p.role === filter;
    return matchSearch && matchFilter;
  });

  const pendingCount = profiles.filter((p) => p.role_request).length;

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-black text-bone-50">Utilisateurs</h1>
          <p className="text-sm text-bone-400 mt-1">{profiles.length} comptes enregistrés</p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
              {pendingCount} demande{pendingCount > 1 ? 's' : ''} en attente
            </div>
          )}
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 transition-colors"
          >
            <UserPlus size={14} /> Créer un utilisateur
          </button>
        </div>
      </div>

      {/* Filtres + recherche */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-500" />
          <input
            type="text"
            placeholder="Nom, username, ID…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-white/10 bg-ink-800/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'fan', 'club_admin', 'super_admin', 'pending'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-bold border transition-all',
                filter === f
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'text-bone-400 border-white/10 hover:border-white/20 hover:text-bone-200'
              )}
            >
              {f === 'all' ? 'Tous' : f === 'pending' ? `⏳ En attente${pendingCount ? ` (${pendingCount})` : ''}` : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-bone-500">Aucun utilisateur trouvé</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-bone-500">
                <th className="text-left px-5 py-3 font-semibold">Utilisateur</th>
                <th className="text-left px-5 py-3 font-semibold hidden md:table-cell">Inscrit le</th>
                <th className="text-left px-5 py-3 font-semibold">Rôle actuel</th>
                <th className="text-left px-5 py-3 font-semibold">Demande</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <UserRow
                  key={p.id}
                  profile={p}
                  saving={saving === p.id}
                  onChangeRole={(role) => changeRole(p.id, role)}
                  onApprove={() => approveRoleRequest(p.id)}
                  onReject={() => rejectRoleRequest(p.id)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modale création utilisateur */}
      <AnimatePresence>
        {createOpen && (
          <CreateUserModal
            onClose={() => setCreateOpen(false)}
            onCreated={(label) => { setCreateOpen(false); showToast(label); load(); }}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-sm font-semibold text-emerald-400 shadow-lg"
          >
            ✓ {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Modale de création d'un compte (email + mot de passe + rôle) ──────
function CreateUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ email: '', password: '', display_name: '', role: 'club_admin' });
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  function genPassword() {
    // Mot de passe aléatoire lisible de 12 caractères
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let p = '';
    const arr = new Uint32Array(12);
    crypto.getRandomValues(arr);
    for (let i = 0; i < 12; i++) p += chars[arr[i] % chars.length];
    setForm((f) => ({ ...f, password: p }));
    setShowPwd(true);
  }

  async function submit() {
    setError('');
    if (!form.email || !form.password) { setError('Email et mot de passe requis'); return; }
    if (form.password.length < 8) { setError('Mot de passe : 8 caractères minimum'); return; }
    setSubmitting(true);
    try {
      const json = await apiFetch('/api/v2/admin/users/create', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      if (!json.success) throw new Error(json.error);
      onCreated(`Compte créé : ${form.email}`);
    } catch (e) {
      setError(e.message || 'Échec de la création');
    } finally {
      setSubmitting(false);
    }
  }

  const inputCls = 'w-full h-10 px-3 rounded-xl border border-white/10 bg-ink-900/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40 transition-colors';

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-900/80 backdrop-blur"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-ink-800 p-6 shadow-2xl space-y-4"
      >
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-emerald-500/15 border border-emerald-500/20 grid place-items-center text-emerald-400">
            <UserPlus size={16} />
          </div>
          <div>
            <h3 className="font-display font-bold text-bone-50">Nouveau collaborateur</h3>
            <p className="text-xs text-bone-400">Le compte est actif immédiatement (sans email de validation)</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">Nom affiché</label>
            <input value={form.display_name} onChange={set('display_name')} placeholder="Ex : Marie Dupont" className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">Email *</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="collaborateur@email.com" className={inputCls} />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">Mot de passe *</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  placeholder="8 caractères minimum"
                  className={cn(inputCls, 'pr-10')}
                />
                <button type="button" onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-bone-500 hover:text-bone-200">
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <button type="button" onClick={genPassword}
                className="shrink-0 h-10 px-3 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-bone-300 hover:text-emerald-400 transition-colors">
                Générer
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">Rôle</label>
            <select value={form.role} onChange={set('role')} className={inputCls}>
              <option value="club_admin">Club Admin — gère les clubs</option>
              <option value="super_admin">Super Admin — accès total</option>
              <option value="fan">Fan — utilisateur simple</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-1">
          <button onClick={onClose} disabled={submitting}
            className="h-9 px-4 rounded-xl border border-white/10 text-sm text-bone-300 hover:text-bone-50 transition-colors disabled:opacity-50">
            Annuler
          </button>
          <button onClick={submit} disabled={submitting}
            className="flex items-center gap-2 h-9 px-5 rounded-xl bg-gradient-hero text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-50">
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {submitting ? 'Création…' : 'Créer le compte'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function UserRow({ profile, saving, onChangeRole, onApprove, onReject }) {
  const [open, setOpen] = useState(false);
  const { role, role_request } = profile;
  const meta = ROLE_META[role] || ROLE_META.fan;
  const Icon = meta.icon;

  return (
    <tr className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
      {/* Nom */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500/30 to-cyan-500/30 grid place-items-center text-xs font-black text-bone-100 shrink-0">
            {(profile.display_name || '?')[0].toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-bone-100 leading-tight">{profile.display_name || '—'}</p>
            <p className="text-[10px] text-bone-500 font-mono">{profile.id.slice(0, 8)}…</p>
          </div>
        </div>
      </td>

      {/* Date */}
      <td className="px-5 py-3.5 text-xs text-bone-500 hidden md:table-cell">
        {new Date(profile.created_at).toLocaleDateString('fr-FR')}
      </td>

      {/* Rôle actuel */}
      <td className="px-5 py-3.5">
        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold', meta.color)}>
          <Icon size={11} />
          {meta.label}
        </span>
      </td>

      {/* Demande de rôle */}
      <td className="px-5 py-3.5">
        {role_request ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-amber-500/30 bg-amber-500/10 text-[11px] font-bold text-amber-400">
            ⏳ {ROLE_META[role_request]?.label || role_request}
          </span>
        ) : (
          <span className="text-[10px] text-bone-600">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-2 justify-end">
          {/* Approuver / refuser demande */}
          {role_request && (
            <>
              <button
                onClick={onApprove}
                disabled={saving}
                title="Approuver"
                className="h-7 w-7 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/25 grid place-items-center transition-colors disabled:opacity-40"
              >
                {saving ? <span className="h-3 w-3 rounded-full border border-emerald-400 border-t-transparent animate-spin" /> : <Check size={13} />}
              </button>
              <button
                onClick={onReject}
                disabled={saving}
                title="Refuser"
                className="h-7 w-7 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 grid place-items-center transition-colors disabled:opacity-40"
              >
                <X size={13} />
              </button>
            </>
          )}

          {/* Dropdown changement de rôle */}
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-1 h-7 px-2.5 rounded-lg border border-white/10 bg-white/5 text-[11px] text-bone-300 hover:text-bone-50 hover:border-white/20 transition-colors"
            >
              Rôle <ChevronDown size={11} className={cn('transition-transform', open && 'rotate-180')} />
            </button>
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.1 }}
                  className="absolute right-0 mt-1 w-36 rounded-xl border border-white/10 bg-ink-800 shadow-xl z-20 overflow-hidden"
                >
                  {ROLES.map((r) => {
                    const m = ROLE_META[r];
                    const RIcon = m.icon;
                    return (
                      <button
                        key={r}
                        onClick={() => { onChangeRole(r); setOpen(false); }}
                        disabled={saving || r === role}
                        className={cn(
                          'w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold transition-colors',
                          r === role
                            ? 'text-emerald-400 bg-emerald-500/10'
                            : 'text-bone-300 hover:text-bone-50 hover:bg-white/5'
                        )}
                      >
                        <RIcon size={12} />
                        {m.label}
                        {r === role && <Check size={11} className="ml-auto" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </td>
    </tr>
  );
}
