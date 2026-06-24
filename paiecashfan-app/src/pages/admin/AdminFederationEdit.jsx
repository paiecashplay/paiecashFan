// BO Super Admin — Édition complète d'une fédération
// 1) Infos du hero (logo, photo, couleurs, devise, président…)
// 2) Clubs membres : liste + ajouter un club (fédération pré-remplie)
//    + créer le hub automatiquement
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Upload, Loader2, Check, X, Globe, Plus, Pencil,
  Star, ExternalLink, Download, Trash2
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/cn';

const CONFEDERATIONS = ['CAF', 'UEFA', 'CONMEBOL', 'CONCACAF', 'AFC', 'OFC'];
const IMG_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml';
const IMG_HINT   = 'JPG, PNG, WEBP, AVIF, GIF ou SVG · 10 Mo max';
const inputCls = () => 'w-full h-10 px-3 rounded-xl border border-white/10 bg-ink-900/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40 transition-colors';

export function AdminFederationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fed, setFed] = useState(null);
  const [members, setMembers] = useState([]);
  const [toast, setToast] = useState(null);

  function showToast(msg, ok = true) { setToast({ msg, ok }); setTimeout(() => setToast(null), 3000); }

  async function loadAll() {
    const [fJson, mJson] = await Promise.all([
      apiFetch(`/api/v2/admin/clubs-crud/federations/${id}`).catch(() => null),
      apiFetch(`/api/v2/admin/clubs-crud/federations/${id}/members`).catch(() => null),
    ]);
    if (fJson?.success) setFed(fJson.data.federation);
    if (mJson?.success) setMembers(mJson.data.members || []);
    setLoading(false);
  }
  useEffect(() => { loadAll(); }, [id]);

  if (loading) return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 size={28} className="text-emerald-400 animate-spin" /></div>;
  if (!fed) return <div className="py-12 text-center text-sm text-bone-500">Fédération introuvable.</div>;

  const hub = members.find((m) => m.is_federation_hub);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/federations')}
          className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-bone-400 hover:text-bone-100 grid place-items-center transition-colors">
          <ArrowLeft size={15} />
        </button>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-black text-bone-50">{fed.flag_emoji ? `${fed.flag_emoji} ` : ''}{fed.name}</h1>
          <p className="text-sm text-bone-400">Slug : {fed.slug} · {fed.confederation_code}</p>
        </div>
        {hub && (
          <a href={`/federations/${fed.slug}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-2 h-9 px-4 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-bone-200 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors">
            <ExternalLink size={13} /> Voir la page
          </a>
        )}
      </div>

      {/* ─── Infos hero ─────────────────────────────────────────── */}
      <FederationInfoForm fed={fed} onSaved={(f) => { setFed(f); showToast('Fédération sauvegardée'); }} />

      {/* ─── Clubs membres ──────────────────────────────────────── */}
      <MembersSection
        fed={fed}
        members={members}
        hub={hub}
        navigate={navigate}
        onCreateHub={async () => {
          try {
            const json = await apiFetch(`/api/v2/admin/clubs-crud/federations/${fed.id}/create-hub`, { method: 'POST' });
            if (!json.success) throw new Error(json.error);
            showToast(json.data.created ? 'Hub créé' : 'Hub déjà existant');
            loadAll();
          } catch (e) { showToast('Erreur : ' + e.message, false); }
        }}
        onImportClubs={async () => {
          const json = await apiFetch(`/api/v2/admin/clubs-crud/federations/${fed.id}/import-clubs`, { method: 'POST' });
          if (!json.success) throw new Error(json.error);
          const { added, skipped, found } = json.data;
          showToast(`${added} club(s) importé(s)${skipped ? `, ${skipped} déjà présent(s)` : ''} sur ${found}`);
          loadAll();
          return json.data;
        }}
        onDeleteClub={async (club) => {
          const json = await apiFetch(`/api/v2/admin/clubs-crud/clubs/${club.id}`, { method: 'DELETE' });
          if (!json.success) throw new Error(json.error);
          showToast(`« ${club.name} » supprimé`);
          setMembers((ms) => ms.filter((m) => m.id !== club.id));
        }}
      />

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className={cn('fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold shadow-xl',
              toast.ok ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400' : 'bg-red-500/15 border-red-500/30 text-red-400')}>
            {toast.ok ? <Check size={14} /> : <X size={14} />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Formulaire infos (hero) ──────────────────────────────────────────
function FederationInfoForm({ fed, onSaved }) {
  const { uploadImage, uploading } = useImageUpload();
  const logoRef = useRef();
  const photoRef = useRef();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: fed.name || '', country: fed.country || '', country_code: fed.country_code || '',
    confederation_code: fed.confederation_code || 'CAF', founded_year: fed.founded_year || '',
    president: fed.president || '', national_team_name: fed.national_team_name || '',
    primary_color: fed.primary_color || '#10b981', accent_color: fed.accent_color || '',
    flag_emoji: fed.flag_emoji || '', motto: fed.motto || '',
    logo_url: fed.logo_url || '', stadium_image_url: fed.stadium_image_url || '',
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
      const json = await apiFetch(`/api/v2/admin/clubs-crud/federations/${fed.id}`, { method: 'PUT', body: JSON.stringify(form) });
      if (!json.success) throw new Error(json.error);
      onSaved(json.data.federation);
    } catch (e) { alert('Erreur : ' + e.message); }
    setSaving(false);
  }

  const Field = ({ label, children, cls = '' }) => (
    <div className={cls}>
      <label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );

  return (
    <div className="rounded-2xl border border-white/8 bg-ink-800/40 p-5 space-y-5">
      <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Infos du hero</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nom *"><input value={form.name} onChange={set('name')} className={inputCls()} /></Field>
        <Field label="Pays"><input value={form.country} onChange={set('country')} className={inputCls()} /></Field>
        <Field label="Code pays *"><input value={form.country_code} onChange={set('country_code')} maxLength={3} placeholder="CM" className={inputCls()} /></Field>
        <Field label="Confédération">
          <select value={form.confederation_code} onChange={set('confederation_code')} className={inputCls()}>
            {CONFEDERATIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Année de fondation"><input type="number" value={form.founded_year} onChange={set('founded_year')} placeholder="1959" className={inputCls()} /></Field>
        <Field label="Président"><input value={form.president} onChange={set('president')} placeholder="Samuel Eto'o" className={inputCls()} /></Field>
        <Field label="Sélection nationale"><input value={form.national_team_name} onChange={set('national_team_name')} placeholder="Lions Indomptables" className={inputCls()} /></Field>
        <Field label="Devise"><input value={form.motto} onChange={set('motto')} placeholder="Ex : Fierté du Cameroun" className={inputCls()} /></Field>
        <Field label="Drapeau (emoji)"><input value={form.flag_emoji} onChange={set('flag_emoji')} placeholder="🇨🇲" className={inputCls()} /></Field>
        <Field label="Couleur principale">
          <div className="flex gap-3 items-center">
            <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(form.primary_color) ? form.primary_color : '#10b981'} onChange={set('primary_color')} className="h-11 w-14 rounded-lg border border-white/10 bg-transparent cursor-pointer" />
            <input value={form.primary_color} onChange={set('primary_color')} placeholder="#007A33" className={cn(inputCls(), 'flex-1')} />
          </div>
        </Field>
      </div>

      {/* Logo + photo hero */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Logo de la fédération">
          <div className="flex gap-3 items-start">
            {form.logo_url && <img src={form.logo_url} alt="" className="h-14 w-14 rounded-xl object-contain bg-white/5 border border-white/10 shrink-0" />}
            <div className="flex-1 space-y-2">
              <input value={form.logo_url} onChange={set('logo_url')} placeholder="https://… ou upload" className={inputCls()} />
              <input type="file" accept={IMG_ACCEPT} ref={logoRef} onChange={(e) => upload(e.target.files?.[0], 'federations', 'logo_url')} className="hidden" />
              <button type="button" onClick={() => logoRef.current?.click()} disabled={uploading} className="flex items-center gap-2 text-xs text-bone-400 hover:text-emerald-400 transition-colors">
                <Upload size={13} /> {uploading ? 'Upload…' : 'Uploader un logo'}
              </button>
              <p className="text-[10px] text-bone-600">{IMG_HINT}</p>
            </div>
          </div>
        </Field>

        <Field label="Photo du hero (stade / image d'accueil)">
          <div className="flex gap-3 items-start">
            {form.stadium_image_url && <img src={form.stadium_image_url} alt="" className="h-14 w-20 rounded-xl object-cover bg-white/5 border border-white/10 shrink-0" />}
            <div className="flex-1 space-y-2">
              <input value={form.stadium_image_url} onChange={set('stadium_image_url')} placeholder="https://… ou upload" className={inputCls()} />
              <input type="file" accept={IMG_ACCEPT} ref={photoRef} onChange={(e) => upload(e.target.files?.[0], 'federations', 'stadium_image_url')} className="hidden" />
              <button type="button" onClick={() => photoRef.current?.click()} disabled={uploading} className="flex items-center gap-2 text-xs text-bone-400 hover:text-emerald-400 transition-colors">
                <Upload size={13} /> {uploading ? 'Upload…' : 'Uploader une photo'}
              </button>
              <p className="text-[10px] text-bone-600">{IMG_HINT}</p>
            </div>
          </div>
        </Field>
      </div>

      <button onClick={save} disabled={saving || uploading || !form.name || !form.country_code}
        className="flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-hero text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-40">
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Sauvegarder
      </button>
    </div>
  );
}

// ── Section clubs membres ────────────────────────────────────────────
function MembersSection({ fed, members, hub, navigate, onCreateHub, onImportClubs, onDeleteClub }) {
  const clubs = members.filter((m) => !m.is_federation_hub);
  const [importing, setImporting] = useState(false);
  const [importErr, setImportErr] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  async function handleDelete(club) {
    if (!confirm(`Supprimer définitivement « ${club.name} » ?\n\nCette action est irréversible (joueurs, palmarès et produits liés seront aussi supprimés).`)) return;
    setDeletingId(club.id);
    try { await onDeleteClub(club); }
    catch (e) { alert('Erreur : ' + (e.message || 'Suppression échouée')); }
    setDeletingId(null);
  }

  async function handleImport() {
    if (!confirm(`Importer automatiquement les clubs de « ${fed.name} » depuis API-Football ?\n\nLes championnats du pays (${fed.country_code}) seront scannés. Les clubs déjà présents seront ignorés.`)) return;
    setImporting(true); setImportErr('');
    try { await onImportClubs(); }
    catch (e) { setImportErr(e.message || 'Import échoué'); }
    setImporting(false);
  }

  return (
    <div className="rounded-2xl border border-white/8 bg-ink-800/40 p-5 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Clubs membres</h2>
          <p className="text-xs text-bone-400 mt-1">{clubs.length} club{clubs.length > 1 ? 's' : ''} rattaché{clubs.length > 1 ? 's' : ''}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={handleImport} disabled={importing}
            className="flex items-center gap-2 h-9 px-4 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-bone-200 hover:text-emerald-400 hover:border-emerald-500/30 disabled:opacity-40 transition-colors">
            {importing ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Importer les clubs (API-Football)
          </button>
          {!hub && (
            <button onClick={onCreateHub}
              className="flex items-center gap-2 h-9 px-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-colors">
              <Globe size={13} /> Créer le hub
            </button>
          )}
          <button onClick={() => navigate(`/admin/clubs/new?federation=${fed.id}`)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 transition-colors">
            <Plus size={13} /> Ajouter un club
          </button>
        </div>
      </div>

      {importErr && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400">{importErr}</div>
      )}

      {/* Statut hub */}
      <div className={cn('rounded-xl border p-3 text-xs flex items-center gap-2',
        hub ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' : 'border-amber-500/20 bg-amber-500/5 text-amber-400')}>
        <Globe size={14} />
        {hub
          ? <span>Page fédération active → <a className="underline" href={`/federations/${fed.slug}`} target="_blank" rel="noreferrer">/federations/{fed.slug}</a></span>
          : <span>Aucun hub. Clique « Créer le hub » pour générer la page d'accueil de la fédération.</span>}
      </div>

      {clubs.length === 0 ? (
        <p className="py-8 text-center text-sm text-bone-500">Aucun club rattaché. Clique « Ajouter un club ».</p>
      ) : (
        <div className="rounded-xl border border-white/8 overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {clubs.map((c) => (
                <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.logo_url
                        ? <img src={c.logo_url} alt="" className="h-8 w-8 rounded-lg object-contain bg-white/5" />
                        : <div className="h-8 w-8 rounded-lg bg-white/5 grid place-items-center text-xs font-black text-bone-400">{c.name[0]}</div>}
                      <div>
                        <p className="font-semibold text-bone-100">{c.name}</p>
                        <p className="text-[10px] text-bone-500">{c.city || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button onClick={() => navigate(`/admin/clubs/${c.id}/edit`)} title="Éditer"
                        className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-emerald-400 grid place-items-center transition-colors">
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => handleDelete(c)} disabled={deletingId === c.id} title="Supprimer"
                        className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-red-400 hover:border-red-500/30 grid place-items-center transition-colors disabled:opacity-40">
                        {deletingId === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                      </button>
                    </div>
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
