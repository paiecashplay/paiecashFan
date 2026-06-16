// BO Super Admin — Création / édition complète d'un club
// Tabs : Infos générales | Joueurs | Palmarès | Boutique
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Upload, Plus, Trash2, Star,
  Info, Users, Trophy, ShoppingBag, Loader2, Check, X
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/cn';

const TABS = [
  { id: 'info',     label: 'Infos',     icon: Info       },
  { id: 'players',  label: 'Joueurs',   icon: Users      },
  { id: 'trophies', label: 'Palmarès',  icon: Trophy     },
  { id: 'products', label: 'Boutique',  icon: ShoppingBag},
];

// Doivent correspondre EXACTEMENT à la contrainte players_position_check en DB
const POSITIONS  = ['Gardien de but','Défenseur','Milieu de terrain','Attaquant'];
const SCOPES     = ['domestic','european','world'];
const SCOPE_FR   = { domestic: 'National', european: 'Europe', world: 'Monde' };
const CATEGORIES = ['jersey','hoodie','tshirt','accessory','shoes','home','other'];

// Formats d'image acceptés (affiché sous les inputs + attribut accept)
const IMG_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml';
const IMG_HINT   = 'JPG, PNG, WEBP, AVIF, GIF ou SVG · 10 Mo max';

// ─── Composant principal ──────────────────────────────────────
export function AdminClubEdit() {
  const { id } = useParams();           // undefined = création
  const isNew   = !id;
  const navigate = useNavigate();

  const [tab,     setTab]     = useState('info');
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState(null);   // { msg, ok }
  const [club,    setClub]    = useState(null);    // données chargées
  const [loading, setLoading] = useState(!isNew);

  // Charge le club si mode édition
  useEffect(() => {
    if (isNew) return;
    apiFetch(`/api/v2/marketplace/clubs/${id}`)
      .then((json) => {
        if (json.success) setClub(json.data.club);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  function showToast(msg, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 size={28} className="text-emerald-400 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/admin/clubs')}
          className="h-9 w-9 rounded-xl border border-white/10 bg-white/5 text-bone-400 hover:text-bone-100 grid place-items-center transition-colors">
          <ArrowLeft size={15} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-black text-bone-50">
            {isNew ? 'Nouveau club' : club?.name || 'Éditer le club'}
          </h1>
          <p className="text-sm text-bone-400">{isNew ? 'Créer un tenant' : `Slug : ${club?.slug}`}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/8 bg-ink-800/40 p-1 w-fit">
        {TABS.map(({ id: tid, label, icon: Icon }) => (
          <button key={tid} onClick={() => setTab(tid)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all',
              tab === tid
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                : 'text-bone-400 hover:text-bone-200'
            )}>
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
          {tab === 'info' && (
            <InfoTab
              club={club}
              clubId={id}
              isNew={isNew}
              onSaved={(c) => {
                setClub(c);
                showToast(isNew ? 'Club créé !' : 'Infos sauvegardées');
                if (isNew) navigate(`/admin/clubs/${c.id}/edit`, { replace: true });
              }}
              setSaving={setSaving}
              saving={saving}
            />
          )}
          {tab === 'players' && !isNew && (
            <PlayersTab tenantId={id} showToast={showToast} />
          )}
          {tab === 'trophies' && !isNew && (
            <TrophiesTab tenantId={id} showToast={showToast} />
          )}
          {tab === 'products' && !isNew && (
            <ProductsTab tenantId={id} showToast={showToast} />
          )}
          {tab !== 'info' && isNew && (
            <div className="py-12 text-center text-sm text-bone-500">
              Sauvegarde d'abord les infos générales pour débloquer cet onglet.
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Toast global */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className={cn(
              'fixed bottom-6 right-6 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold shadow-xl',
              toast.ok
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-red-500/15 border-red-500/30 text-red-400'
            )}>
            {toast.ok ? <Check size={14} /> : <X size={14} />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB : INFOS GÉNÉRALES
// ═══════════════════════════════════════════════════════════════
function InfoTab({ club, clubId, isNew, onSaved, saving, setSaving }) {
  const { uploadImage, uploading } = useImageUpload();
  const logoRef    = useRef();
  const stadiumRef = useRef();

  const [form, setForm] = useState({
    name:          club?.name          || '',
    slug:          club?.slug          || '',
    country:       club?.country       || '',
    city:          club?.city          || '',
    sport:         club?.sport         || 'football',
    primary_color: club?.primary_color || '#10b981',
    logo_url:      club?.logo_url      || '',
    stadium:       club?.stadium       || '',
    stadium_image_url: club?.stadium_image_url || '',
    founded_year:  club?.founded_year  || '',
    motto:         club?.motto         || '',
    coach:         club?.coach         || '',
    president:     club?.president     || '',
    is_federation_hub: club?.is_federation_hub || false,
  });

  function set(k) { return (e) => setForm((f) => ({ ...f, [k]: e.target.value })); }
  function autoSlug(name) {
    return name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, 'logos');
    if (url) setForm((f) => ({ ...f, logo_url: url }));
  }

  async function handleStadiumUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, 'stades');
    if (url) setForm((f) => ({ ...f, stadium_image_url: url }));
  }

  async function save() {
    setSaving(true);
    try {
      const url    = isNew ? '/api/v2/admin/clubs-crud/clubs' : `/api/v2/admin/clubs-crud/clubs/${clubId}`;
      const method = isNew ? 'POST' : 'PUT';
      const json   = await apiFetch(url, { method, body: JSON.stringify(form) });
      if (!json.success) throw new Error(json.error);
      onSaved(json.data.club);
    } catch (err) {
      alert('Erreur : ' + err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Nom */}
        <Field label="Nom du club *">
          <input value={form.name} onChange={(e) => {
            const n = e.target.value;
            // Auto-slug uniquement en création et si le slug n'a pas été modifié manuellement
            setForm((f) => ({ ...f, name: n, slug: isNew && !f._slugEdited ? autoSlug(n) : f.slug }));
          }} placeholder="Ex : Olympique Lyonnais" className={input()} />
        </Field>

        {/* Slug */}
        <Field label="Slug (URL) *">
          <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value, _slugEdited: true }))} placeholder="olympique-lyonnais" className={input()} />
        </Field>

        {/* Pays */}
        <Field label="Pays">
          <input value={form.country} onChange={set('country')} placeholder="France" className={input()} />
        </Field>

        {/* Ville */}
        <Field label="Ville">
          <input value={form.city} onChange={set('city')} placeholder="Lyon" className={input()} />
        </Field>

        {/* Stade */}
        <Field label="Stade">
          <input value={form.stadium} onChange={set('stadium')} placeholder="Groupama Stadium" className={input()} />
        </Field>

        {/* Année de fondation */}
        <Field label="Année de fondation">
          <input type="number" value={form.founded_year} onChange={set('founded_year')} placeholder="1950" className={input()} />
        </Field>

        {/* Coach */}
        <Field label="Entraîneur">
          <input value={form.coach} onChange={set('coach')} placeholder="Nom de l'entraîneur" className={input()} />
        </Field>

        {/* Président */}
        <Field label="Président">
          <input value={form.president} onChange={set('president')} placeholder="Nom du président" className={input()} />
        </Field>

        {/* Devise */}
        <Field label="Devise / Motto">
          <input value={form.motto} onChange={set('motto')} placeholder="Ex : Droit au But" className={input()} />
        </Field>

        {/* Couleur principale */}
        <Field label="Couleur principale">
          <div className="flex gap-3 items-center">
            <input
              type="color"
              value={/^#[0-9a-fA-F]{6}$/.test(form.primary_color) ? form.primary_color : '#10b981'}
              onChange={set('primary_color')}
              className="h-11 w-14 rounded-lg border border-white/10 bg-transparent cursor-pointer"
            />
            <input value={form.primary_color} onChange={set('primary_color')} placeholder="#10b981" className={cn(input(), 'flex-1')} />
          </div>
        </Field>
      </div>

      {/* Logo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Logo du club">
          <div className="flex gap-3 items-start">
            {form.logo_url && (
              <img src={form.logo_url} alt="logo" className="h-14 w-14 rounded-xl object-contain bg-white/5 border border-white/10 shrink-0" />
            )}
            <div className="flex-1 space-y-2">
              <input value={form.logo_url} onChange={set('logo_url')} placeholder="https://… ou upload ci-dessous" className={input()} />
              <input type="file" accept={IMG_ACCEPT} ref={logoRef} onChange={handleLogoUpload} className="hidden" />
              <button type="button" onClick={() => logoRef.current?.click()} disabled={uploading}
                className="flex items-center gap-2 text-xs text-bone-400 hover:text-emerald-400 transition-colors">
                <Upload size={13} /> {uploading ? 'Upload…' : 'Uploader un logo'}
              </button>
              <p className="text-[10px] text-bone-600">{IMG_HINT}</p>
            </div>
          </div>
        </Field>

        {/* Photo stade */}
        <Field label="Photo du stade">
          <div className="space-y-2">
            <input value={form.stadium_image_url || ''} onChange={set('stadium_image_url')} placeholder="https://… ou upload ci-dessous" className={input()} />
            <input type="file" accept={IMG_ACCEPT} ref={stadiumRef} onChange={handleStadiumUpload} className="hidden" />
            <button type="button" onClick={() => stadiumRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 text-xs text-bone-400 hover:text-emerald-400 transition-colors">
              <Upload size={13} /> {uploading ? 'Upload…' : 'Uploader une photo'}
            </button>
            <p className="text-[10px] text-bone-600">{IMG_HINT}</p>
          </div>
        </Field>
      </div>

      {/* Fédération hub */}
      <label className="flex items-center gap-3 cursor-pointer w-fit">
        <input type="checkbox" checked={form.is_federation_hub} onChange={(e) => setForm((f) => ({ ...f, is_federation_hub: e.target.checked }))}
          className="h-4 w-4 rounded border border-white/20 bg-ink-800 accent-emerald-400" />
        <span className="text-sm text-bone-200">C'est une fédération (page hub avec grille de clubs)</span>
      </label>

      {/* Save */}
      <button onClick={save} disabled={saving || uploading || !form.name || !form.slug}
        className="flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-hero text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-40">
        {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        {saving ? 'Sauvegarde…' : isNew ? 'Créer le club' : 'Sauvegarder'}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB : JOUEURS
// ═══════════════════════════════════════════════════════════════
function PlayersTab({ tenantId, showToast }) {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editRow, setEditRow] = useState(null);  // { mode:'new'|id, form }

  async function load() {
    setLoading(true);
    const json = await apiFetch(`/api/v2/admin/clubs-crud/clubs/${tenantId}/players`);
    setPlayers(json.data?.players || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [tenantId]);

  async function savePlayer(form) {
    const isNew = !form.id;
    const url  = isNew ? `/api/v2/admin/clubs-crud/clubs/${tenantId}/players` : `/api/v2/admin/clubs-crud/players/${form.id}`;
    const json = await apiFetch(url, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(form) });
    if (!json.success) throw new Error(json.error);
    showToast(isNew ? 'Joueur ajouté' : 'Joueur mis à jour');
    setEditRow(null);
    load();
  }

  async function deletePlayer(id) {
    if (!confirm('Supprimer ce joueur ?')) return;
    await apiFetch(`/api/v2/admin/clubs-crud/players/${id}`, { method: 'DELETE' });
    showToast('Joueur supprimé');
    load();
  }

  const blankPlayer = { full_name: '', jersey_number: '', position: 'Milieu de terrain', country: '', image_url: '', is_star_player: false, stats: { goals: 0, assists: 0 } };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-bone-400">{players.length} joueurs</p>
        <button onClick={() => setEditRow({ id: null, ...blankPlayer })}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 transition-colors">
          <Plus size={13} /> Ajouter un joueur
        </button>
      </div>

      {/* Formulaire inline */}
      <AnimatePresence>
        {editRow !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <PlayerForm
              initial={editRow}
              tenantId={tenantId}
              onSave={savePlayer}
              onCancel={() => setEditRow(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Liste */}
      {loading ? <SkeletonRows n={5} /> : (
        <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
          {players.length === 0 ? (
            <p className="py-12 text-center text-sm text-bone-500">Aucun joueur. Ajoutez-en un ci-dessus.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-bone-500">
                  <th className="text-left px-4 py-3">#</th>
                  <th className="text-left px-4 py-3">Nom</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Poste</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Pays</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {players.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-mono text-xs text-bone-400">{p.shirt_number ?? p.jersey_number ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {p.image_url && <img src={p.image_url} alt="" className="h-7 w-7 rounded-full object-cover bg-white/5" />}
                        <span className="font-semibold text-bone-100">{p.full_name}</span>
                        {p.is_star_player && <Star size={11} className="text-amber-400 fill-amber-400" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-bone-400 hidden md:table-cell">{p.position || '—'}</td>
                    <td className="px-4 py-3 text-xs text-bone-400 hidden md:table-cell">{p.country || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setEditRow({ ...p, jersey_number: p.shirt_number, country: p.nationality_code })} className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-bone-100 grid place-items-center transition-colors">
                          <Info size={12} />
                        </button>
                        <button onClick={() => deletePlayer(p.id)} className="h-7 w-7 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 grid place-items-center transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function PlayerForm({ initial, tenantId, onSave, onCancel }) {
  const { uploadImage, uploading } = useImageUpload();
  const imgRef = useRef();
  const [form, setForm] = useState({ ...initial });
  const [saving, setSaving] = useState(false);

  function set(k) { return (e) => setForm((f) => ({ ...f, [k]: e.target.value })); }

  async function handleImgUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, 'joueurs');
    if (url) setForm((f) => ({ ...f, image_url: url }));
  }

  async function submit() {
    if (!form.full_name) return;
    setSaving(true);
    try {
      await onSave({ ...form, stats: { goals: Number(form.stats?.goals || 0), assists: Number(form.stats?.assists || 0) } });
    } catch (e) { alert(e.message); }
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
      <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{form.id ? 'Modifier le joueur' : 'Nouveau joueur'}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Nom complet *" cls="col-span-2">
          <input value={form.full_name} onChange={set('full_name')} placeholder="Pierre Kalulu" className={input()} />
        </Field>
        <Field label="N°">
          <input type="number" value={form.jersey_number} onChange={set('jersey_number')} placeholder="5" className={input()} />
        </Field>
        <Field label="Poste">
          <select value={form.position} onChange={set('position')} className={input()}>
            {POSITIONS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </Field>
        <Field label="Pays">
          <input value={form.country} onChange={set('country')} placeholder="France" className={input()} />
        </Field>
        <Field label="Buts (stats)">
          <input type="number" value={form.stats?.goals || 0} onChange={(e) => setForm((f) => ({ ...f, stats: { ...f.stats, goals: e.target.value } }))} className={input()} />
        </Field>
        <Field label="Passes dé. (stats)">
          <input type="number" value={form.stats?.assists || 0} onChange={(e) => setForm((f) => ({ ...f, stats: { ...f.stats, assists: e.target.value } }))} className={input()} />
        </Field>
      </div>

      {/* Photo */}
      <div className="flex items-center gap-4">
        {form.image_url && <img src={form.image_url} alt="" className="h-14 w-14 rounded-xl object-cover bg-white/5 border border-white/10" />}
        <div className="space-y-1 flex-1">
          <input value={form.image_url} onChange={set('image_url')} placeholder="URL photo ou upload" className={input()} />
          <input type="file" accept={IMG_ACCEPT} ref={imgRef} onChange={handleImgUpload} className="hidden" />
          <button type="button" onClick={() => imgRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 text-xs text-bone-400 hover:text-emerald-400 transition-colors">
            <Upload size={12} /> {uploading ? 'Upload…' : 'Uploader une photo'}
          </button>
          <p className="text-[10px] text-bone-600">{IMG_HINT}</p>
        </div>
      </div>

      {/* Star player */}
      <label className="flex items-center gap-3 cursor-pointer w-fit">
        <input type="checkbox" checked={form.is_star_player} onChange={(e) => setForm((f) => ({ ...f, is_star_player: e.target.checked }))} className="accent-amber-400" />
        <Star size={13} className="text-amber-400" />
        <span className="text-xs text-bone-200">Joueur vedette (star player)</span>
      </label>

      <div className="flex gap-3">
        <button onClick={submit} disabled={saving || !form.full_name}
          className="flex items-center gap-2 h-9 px-5 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 disabled:opacity-40 transition-colors">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Sauvegarder
        </button>
        <button onClick={onCancel} className="h-9 px-4 rounded-xl border border-white/10 text-xs text-bone-400 hover:text-bone-100 transition-colors">
          Annuler
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB : PALMARÈS
// ═══════════════════════════════════════════════════════════════
function TrophiesTab({ tenantId, showToast }) {
  const [trophies, setTrophies] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editRow,  setEditRow]  = useState(null);

  async function load() {
    setLoading(true);
    const json = await apiFetch(`/api/v2/admin/clubs-crud/clubs/${tenantId}/trophies`);
    setTrophies(json.data?.trophies || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [tenantId]);

  async function saveTrophy(form) {
    const isNew = !form.id;
    const url   = isNew ? `/api/v2/admin/clubs-crud/clubs/${tenantId}/trophies` : `/api/v2/admin/clubs-crud/trophies/${form.id}`;
    const json  = await apiFetch(url, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(form) });
    if (!json.success) throw new Error(json.error);
    showToast(isNew ? 'Trophée ajouté' : 'Trophée mis à jour');
    setEditRow(null);
    load();
  }

  async function deleteTrophy(id) {
    if (!confirm('Supprimer ce trophée ?')) return;
    await apiFetch(`/api/v2/admin/clubs-crud/trophies/${id}`, { method: 'DELETE' });
    showToast('Trophée supprimé');
    load();
  }

  const blank = { label: '', count: 1, scope: 'domestic', years_text: '' };
  const total = trophies.reduce((s, t) => s + (t.count || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-bone-400">{trophies.length} trophées · <span className="text-emerald-400 font-bold">{total} titres au total</span></p>
        <button onClick={() => setEditRow(blank)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 transition-colors">
          <Plus size={13} /> Ajouter un trophée
        </button>
      </div>

      <AnimatePresence>
        {editRow !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <TrophyForm initial={editRow} onSave={saveTrophy} onCancel={() => setEditRow(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? <SkeletonRows n={4} /> : (
        <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
          {trophies.length === 0 ? (
            <p className="py-12 text-center text-sm text-bone-500">Aucun trophée. Ajoutez-en un ci-dessus.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-bone-500">
                  <th className="text-left px-4 py-3">Trophée</th>
                  <th className="text-left px-4 py-3">Qté</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Scope</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Années</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {trophies.map((t) => (
                  <tr key={t.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 font-semibold text-bone-100">🏆 {t.label}</td>
                    <td className="px-4 py-3 text-amber-400 font-bold">×{t.count}</td>
                    <td className="px-4 py-3 text-xs text-bone-400 hidden md:table-cell">{SCOPE_FR[t.scope] || t.scope}</td>
                    <td className="px-4 py-3 text-xs text-bone-500 hidden md:table-cell">{t.years_text || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => setEditRow(t)} className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-bone-100 grid place-items-center">
                          <Info size={12} />
                        </button>
                        <button onClick={() => deleteTrophy(t.id)} className="h-7 w-7 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 grid place-items-center">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function TrophyForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({ ...initial });
  const [saving, setSaving] = useState(false);
  function set(k) { return (e) => setForm((f) => ({ ...f, [k]: e.target.value })); }

  async function submit() {
    if (!form.label) return;
    setSaving(true);
    try { await onSave({ ...form, count: Number(form.count) }); }
    catch (e) { alert(e.message); }
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 space-y-4">
      <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">{form.id ? 'Modifier' : 'Nouveau trophée'}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Nom du trophée *" cls="col-span-2">
          <input value={form.label} onChange={set('label')} placeholder="Ligue 1" className={input()} />
        </Field>
        <Field label="Nombre de fois">
          <input type="number" min="1" value={form.count} onChange={set('count')} className={input()} />
        </Field>
        <Field label="Scope">
          <select value={form.scope} onChange={set('scope')} className={input()}>
            {SCOPES.map((s) => <option key={s} value={s}>{SCOPE_FR[s]}</option>)}
          </select>
        </Field>
        <Field label="Années (ex: 2002, 2005)" cls="col-span-2 md:col-span-4">
          <input value={form.years_text} onChange={set('years_text')} placeholder="2002, 2005, 2020" className={input()} />
        </Field>
      </div>
      <div className="flex gap-3">
        <button onClick={submit} disabled={saving || !form.label}
          className="flex items-center gap-2 h-9 px-5 rounded-xl bg-amber-500/15 border border-amber-500/20 text-xs font-bold text-amber-400 hover:bg-amber-500/25 disabled:opacity-40 transition-colors">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Sauvegarder
        </button>
        <button onClick={onCancel} className="h-9 px-4 rounded-xl border border-white/10 text-xs text-bone-400 hover:text-bone-100 transition-colors">Annuler</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// TAB : BOUTIQUE
// ═══════════════════════════════════════════════════════════════
function ProductsTab({ tenantId, showToast }) {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [editRow,  setEditRow]  = useState(null);

  async function load() {
    setLoading(true);
    const json = await apiFetch(`/api/v2/admin/clubs-crud/clubs/${tenantId}/products`);
    setProducts(json.data?.products || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [tenantId]);

  async function saveProduct(form) {
    const isNew = !form.id;
    const url   = isNew ? `/api/v2/admin/clubs-crud/clubs/${tenantId}/products` : `/api/v2/admin/clubs-crud/products/${form.id}`;
    const body  = { ...form, images: form.images_list?.filter(Boolean) || [], sizes: form.sizes_raw?.split(',').map((s) => s.trim()).filter(Boolean) || [] };
    const json  = await apiFetch(url, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(body) });
    if (!json.success) throw new Error(json.error);
    showToast(isNew ? 'Produit ajouté' : 'Produit mis à jour');
    setEditRow(null);
    load();
  }

  async function deleteProduct(id) {
    if (!confirm('Supprimer ce produit ?')) return;
    await apiFetch(`/api/v2/admin/clubs-crud/products/${id}`, { method: 'DELETE' });
    showToast('Produit supprimé');
    load();
  }

  const blank = { name: '', description: '', eur_price: '', pcc_price: '', category_slug: 'jersey', display_order: products.length, status: 'active', images_list: [''], sizes_raw: 'S,M,L,XL' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-bone-400">{products.length} produits</p>
        <button onClick={() => setEditRow(blank)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 transition-colors">
          <Plus size={13} /> Ajouter un produit
        </button>
      </div>

      <AnimatePresence>
        {editRow !== null && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <ProductForm initial={editRow} onSave={saveProduct} onCancel={() => setEditRow(null)} />
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? <SkeletonRows n={4} /> : (
        <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
          {products.length === 0 ? (
            <p className="py-12 text-center text-sm text-bone-500">Aucun produit. Ajoutez-en un ci-dessus.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-bone-500">
                  <th className="text-left px-4 py-3">Produit</th>
                  <th className="text-left px-4 py-3">Prix EUR</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Prix PCC</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Catégorie</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const img = Array.isArray(p.images) ? p.images[0] : null;
                  return (
                    <tr key={p.id} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {img ? <img src={img} alt="" className="h-9 w-9 rounded-lg object-cover bg-white/5" /> : <div className="h-9 w-9 rounded-lg bg-white/5 grid place-items-center text-bone-600"><ShoppingBag size={14} /></div>}
                          <span className="font-semibold text-bone-100">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-bone-200">{p.eur_price != null ? `${p.eur_price} €` : '—'}</td>
                      <td className="px-4 py-3 text-xs font-mono text-emerald-400 hidden md:table-cell">{p.pcc_price != null ? `${p.pcc_price} PCC` : '—'}</td>
                      <td className="px-4 py-3 text-xs text-bone-400 hidden md:table-cell">{p.category_slug || '—'}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                          <button onClick={() => setEditRow({ ...p, images_list: p.images || [''], sizes_raw: (p.sizes || []).join(', ') })} className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-bone-100 grid place-items-center">
                            <Info size={12} />
                          </button>
                          <button onClick={() => deleteProduct(p.id)} className="h-7 w-7 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 grid place-items-center">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

function ProductForm({ initial, onSave, onCancel }) {
  const { uploadImage, uploading } = useImageUpload();
  const imgRef = useRef();
  const [form, setForm] = useState({ ...initial, images_list: initial.images_list || [''] });
  const [saving, setSaving] = useState(false);
  function set(k) { return (e) => setForm((f) => ({ ...f, [k]: e.target.value })); }

  async function handleImgUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, 'produits');
    if (url) setForm((f) => ({ ...f, images_list: [url, ...f.images_list.slice(1)] }));
  }

  async function submit() {
    if (!form.name) return;
    setSaving(true);
    try { await onSave(form); }
    catch (e) { alert(e.message); }
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5 space-y-4">
      <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{form.id ? 'Modifier le produit' : 'Nouveau produit'}</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Nom du produit *" cls="col-span-2">
          <input value={form.name} onChange={set('name')} placeholder="Maillot domicile 2025" className={input()} />
        </Field>
        <Field label="Catégorie">
          <select value={form.category_slug} onChange={set('category_slug')} className={input()}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Ordre d'affichage">
          <input type="number" value={form.display_order} onChange={set('display_order')} className={input()} />
        </Field>
        <Field label="Prix EUR">
          <input type="number" step="0.01" value={form.eur_price} onChange={set('eur_price')} placeholder="89.99" className={input()} />
        </Field>
        <Field label="Prix PCC *">
          <input type="number" value={form.pcc_price} onChange={set('pcc_price')} placeholder="900" className={cn(input(), (!form.pcc_price || Number(form.pcc_price) <= 0) && 'border-amber-500/40')} />
        </Field>
        <Field label="Tailles (séparées par virgule)" cls="col-span-2">
          <input value={form.sizes_raw} onChange={set('sizes_raw')} placeholder="S,M,L,XL,XXL" className={input()} />
        </Field>
        <Field label="Description" cls="col-span-2 md:col-span-4">
          <textarea value={form.description} onChange={set('description')} rows={2} placeholder="Description courte du produit" className={cn(input(), 'resize-none')} />
        </Field>
      </div>

      {/* Image principale */}
      <div className="flex items-center gap-4">
        {form.images_list[0] && <img src={form.images_list[0]} alt="" className="h-14 w-14 rounded-xl object-cover bg-white/5 border border-white/10" />}
        <div className="flex-1 space-y-1">
          <input value={form.images_list[0] || ''} onChange={(e) => setForm((f) => { const l = [...f.images_list]; l[0] = e.target.value; return { ...f, images_list: l }; })} placeholder="URL image principale" className={input()} />
          <input type="file" accept={IMG_ACCEPT} ref={imgRef} onChange={handleImgUpload} className="hidden" />
          <button type="button" onClick={() => imgRef.current?.click()} disabled={uploading} className="flex items-center gap-1.5 text-xs text-bone-400 hover:text-emerald-400 transition-colors">
            <Upload size={12} /> {uploading ? 'Upload…' : 'Uploader une image'}
          </button>
          <p className="text-[10px] text-bone-600">{IMG_HINT}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={submit} disabled={saving || !form.name || !form.pcc_price || Number(form.pcc_price) <= 0}
          className="flex items-center gap-2 h-9 px-5 rounded-xl bg-cyan-500/15 border border-cyan-500/20 text-xs font-bold text-cyan-400 hover:bg-cyan-500/25 disabled:opacity-40 transition-colors">
          {saving ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Sauvegarder
        </button>
        <button onClick={onCancel} className="h-9 px-4 rounded-xl border border-white/10 text-xs text-bone-400 hover:text-bone-100 transition-colors">Annuler</button>
        {(!form.pcc_price || Number(form.pcc_price) <= 0) && (
          <span className="text-[11px] text-amber-400/80">Prix PCC requis</span>
        )}
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────
function Field({ label, children, cls = '' }) {
  return (
    <div className={cls}>
      <label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}
function input() { return 'w-full h-10 px-3 rounded-xl border border-white/10 bg-ink-900/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40 transition-colors'; }
function SkeletonRows({ n }) {
  return <div className="space-y-2 p-4">{Array.from({ length: n }).map((_, i) => <div key={i} className="h-12 rounded-xl bg-white/5 animate-pulse" />)}</div>;
}
