// BO du club — réservé au club_admin, verrouillé sur SON club (profile.club_id).
// Réutilise les onglets de l'éditeur super_admin (Joueurs / Palmarès /
// Boutique / Billetterie) + un formulaire d'infos allégé (pas de slug / statut
// / fédération : réservés au super_admin).
import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Info, Users, Trophy, ShoppingBag, Ticket, Upload, Save,
  Loader2, Check, X, ExternalLink
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';
import { PlayersTab, TrophiesTab, ProductsTab, TicketingTab } from '@/pages/admin/AdminClubEdit';
import { cn } from '@/lib/cn';

const TABS = [
  { id: 'info',      label: 'Infos',       icon: Info },
  { id: 'players',   label: 'Joueurs',     icon: Users },
  { id: 'trophies',  label: 'Palmarès',    icon: Trophy },
  { id: 'products',  label: 'Boutique',    icon: ShoppingBag },
  { id: 'ticketing', label: 'Billetterie', icon: Ticket },
];

export function MonClubBO() {
  const { profile, loading: authLoading } = useAuth();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('info');
  const [toast, setToast] = useState(null);

  const clubId = profile?.club_id;
  const showToast = (msg, ok = true) => { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); };

  useEffect(() => {
    if (!clubId) { setLoading(false); return; }
    apiFetch(`/api/v2/admin/clubs-crud/clubs/${clubId}`)
      .then((j) => setClub(j.data?.club || null))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [clubId]);

  if (authLoading) return null;
  // Pas club_admin ou pas de club rattaché → retour onboarding.
  if (profile?.role !== 'club_admin' || !clubId) return <Navigate to="/mon-club" replace />;

  return (
    <div className="relative min-h-[calc(100vh-80px)] py-8 sm:py-10">
      <Container className="max-w-4xl px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-bone-400 hover:text-bone-100 mb-6 transition-colors">
          <ArrowLeft size={14} /> Retour au site
        </Link>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            {club?.logo_url && <img src={club.logo_url} alt="" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl object-contain bg-white/5 border border-white/10" />}
            <div>
              <h1 className="font-display text-xl sm:text-2xl font-black text-bone-50 break-words">{club?.name || 'Mon club'}</h1>
              <p className="text-xs text-bone-400 mt-0.5">
                {club?.status === 'active'
                  ? <span className="text-emerald-400 font-semibold">● En ligne</span>
                  : <span className="text-amber-400 font-semibold">● Brouillon (en attente de validation)</span>}
              </p>
            </div>
          </div>
          {club?.status === 'active' && club?.slug && (
            <a href={`/clubs/${club.slug}`} target="_blank" rel="noreferrer"
              className="inline-flex min-h-10 w-full sm:w-auto items-center justify-center gap-2 px-4 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-bone-200 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors">
              <ExternalLink size={13} /> Voir ma page
            </a>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-xl border border-white/8 bg-ink-800/40 p-1 pb-2 w-full sm:w-fit mb-6">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setTab(id)}
              className={cn('flex shrink-0 items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap',
                tab === id ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'text-bone-400 hover:text-bone-200')}>
              <Icon size={13} /> {label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={26} className="text-emerald-400 animate-spin" /></div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
              {tab === 'info' && <ClubInfoForm club={club} onSaved={(c) => { setClub(c); showToast('Infos sauvegardées'); }} />}
              {tab === 'players'   && <PlayersTab   tenantId={clubId} showToast={showToast} />}
              {tab === 'trophies'  && <TrophiesTab  tenantId={clubId} showToast={showToast} />}
              {tab === 'products'  && <ProductsTab  tenantId={clubId} showToast={showToast} />}
              {tab === 'ticketing' && <TicketingTab tenantId={clubId} club={club} showToast={showToast} />}
            </motion.div>
          </AnimatePresence>
        )}

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
              className={cn('fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold shadow-xl',
                toast.ok ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-red-500/15 border-red-500/30 text-red-400')}>
              {toast.ok ? <Check size={14} /> : <X size={14} />} {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </div>
  );
}

// ─── Formulaire d'infos allégé (club_admin) ──────────────────────────
function ClubInfoForm({ club, onSaved }) {
  const { uploadImage, uploading } = useImageUpload();
  const logoRef = useRef();
  const stadeRef = useRef();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: club?.name || '', city: club?.city || '', country: club?.country || '',
    stadium: club?.stadium || '', founded_year: club?.founded_year || '',
    coach: club?.coach || '', president: club?.president || '',
    motto: club?.motto || '', motto_color: club?.motto_color || '',
    primary_color: club?.primary_color || '#10b981',
    logo_url: club?.logo_url || '', stadium_image_url: club?.stadium_image_url || '',
  });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function upload(file, folder, key) {
    if (!file) return;
    const url = await uploadImage(file, folder);
    if (url) setForm((f) => ({ ...f, [key]: url }));
  }

  async function save() {
    setSaving(true);
    try {
      const json = await apiFetch(`/api/v2/admin/clubs-crud/clubs/${club.id}`, { method: 'PUT', body: JSON.stringify(form) });
      if (!json.success) throw new Error(json.error);
      onSaved(json.data.club);
    } catch (e) { alert('Erreur : ' + e.message); }
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-ink-800/40 p-5 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nom du club"><input value={form.name} onChange={set('name')} className={inp} /></Field>
        <Field label="Ville"><input value={form.city} onChange={set('city')} className={inp} /></Field>
        <Field label="Pays"><input value={form.country} onChange={set('country')} className={inp} /></Field>
        <Field label="Stade"><input value={form.stadium} onChange={set('stadium')} className={inp} /></Field>
        <Field label="Année de fondation"><input type="number" value={form.founded_year} onChange={set('founded_year')} className={inp} /></Field>
        <Field label="Entraîneur"><input value={form.coach} onChange={set('coach')} className={inp} /></Field>
        <Field label="Président"><input value={form.president} onChange={set('president')} className={inp} /></Field>
        <Field label="Devise"><input value={form.motto} onChange={set('motto')} placeholder="Ex : Ici c'est Paris" className={inp} /></Field>
        <Field label="Couleur principale">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(form.primary_color) ? form.primary_color : '#10b981'} onChange={set('primary_color')} className="h-11 w-14 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
            <input value={form.primary_color} onChange={set('primary_color')} className={cn(inp, 'flex-1')} />
          </div>
        </Field>
        <Field label="Couleur de la devise">
          <input value={form.motto_color} onChange={set('motto_color')} placeholder="#FFFFFF" className={inp} />
        </Field>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <UploadField label="Logo du club" preview={form.logo_url} square inputRef={logoRef}
          onPick={(f) => upload(f, 'logos', 'logo_url')} uploading={uploading} onUrl={set('logo_url')} value={form.logo_url} />
        <UploadField label="Photo du stade (hero)" preview={form.stadium_image_url} inputRef={stadeRef}
          onPick={(f) => upload(f, 'stades', 'stadium_image_url')} uploading={uploading} onUrl={set('stadium_image_url')} value={form.stadium_image_url} />
      </div>

      <button onClick={save} disabled={saving || uploading || !form.name}
        className="flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 px-6 rounded-xl bg-gradient-hero text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-40">
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Sauvegarder
      </button>
    </div>
  );
}

const inp = 'w-full h-10 px-3 rounded-xl border border-white/10 bg-ink-900/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40';
function Field({ label, children }) {
  return <div><label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">{label}</label>{children}</div>;
}
function UploadField({ label, preview, square, inputRef, onPick, uploading, onUrl, value }) {
  return (
    <div>
      <label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">{label}</label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        {preview && <img src={preview} alt="" className={cn('object-cover bg-white/5 border border-white/10 mx-auto sm:mx-0 shrink-0', square ? 'h-14 w-14 rounded-xl object-contain' : 'h-14 w-20 rounded-xl')} />}
        <div className="flex-1 space-y-2">
          <input value={value} onChange={onUrl} placeholder="https://… ou upload" className={inp} />
          <input type="file" accept="image/*" ref={inputRef} onChange={(e) => onPick(e.target.files?.[0])} className="hidden" />
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 text-xs text-bone-400 hover:text-emerald-400 transition-colors">
            <Upload size={13} /> {uploading ? 'Upload…' : 'Uploader'}
          </button>
        </div>
      </div>
    </div>
  );
}
