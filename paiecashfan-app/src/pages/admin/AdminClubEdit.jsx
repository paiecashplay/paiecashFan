// BO Super Admin — Création / édition complète d'un club
// Tabs : Infos générales | Joueurs | Palmarès | Boutique
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Upload, Plus, Trash2, Star,
  Info, Users, Trophy, ShoppingBag, Loader2, Check, X, Download, Pencil, Search
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ImportFromFootball } from '@/components/admin/ImportFromFootball';
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
// Slugs FR alignés sur product_categories en base
const CATEGORIES = [
  { slug: 'maillot',    label: 'Maillot' },
  { slug: 'sweat',      label: 'Sweat' },
  { slug: 't-shirt',    label: 'T-Shirt' },
  { slug: 'accessoire', label: 'Accessoire' },
  { slug: 'chaussures', label: 'Chaussures' },
  { slug: 'maison',     label: 'Maison' },
  { slug: 'autre',      label: 'Autre' },
];

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
  const [importOpen, setImportOpen] = useState(false);
  const [dataKey, setDataKey] = useState(0);       // force le reload des onglets après import

  // Charge le club si mode édition
  function loadClub() {
    if (isNew) return;
    apiFetch(`/api/v2/marketplace/clubs/${id}`)
      .then((json) => {
        if (json.success) setClub(json.data.club);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }
  useEffect(() => { loadClub(); }, [id]);

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
        <div className="flex-1">
          <h1 className="font-display text-2xl font-black text-bone-50">
            {isNew ? 'Nouveau club' : club?.name || 'Éditer le club'}
          </h1>
          <p className="text-sm text-bone-400">{isNew ? 'Créer un tenant' : `Slug : ${club?.slug}`}</p>
        </div>
        {!isNew && (
          <button onClick={() => setImportOpen(true)}
            className="flex items-center gap-2 h-9 px-4 rounded-xl border border-white/10 bg-white/5 text-xs font-bold text-bone-200 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors">
            <Download size={14} /> Importer depuis API-Football
          </button>
        )}
      </div>

      {/* Import API-Football (ce club) */}
      <AnimatePresence>
        {importOpen && (
          <ImportFromFootball
            tenantId={id}
            onClose={() => setImportOpen(false)}
            onImported={() => { loadClub(); setDataKey((k) => k + 1); }}
          />
        )}
      </AnimatePresence>

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
            <PlayersTab key={dataKey} tenantId={id} showToast={showToast} />
          )}
          {tab === 'trophies' && !isNew && (
            <TrophiesTab key={dataKey} tenantId={id} showToast={showToast} />
          )}
          {tab === 'products' && !isNew && (
            <ProductsTab key={dataKey} tenantId={id} showToast={showToast} />
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
  const [search, setSearch]   = useState('');

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

  const q = search.toLowerCase().trim();
  const filtered = !q ? players : players.filter((p) =>
    [p.full_name, p.position, p.nationality_code, p.country, String(p.shirt_number ?? '')]
      .some((v) => (v || '').toLowerCase().includes(q)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-bone-400 shrink-0">{players.length} joueurs</p>
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un joueur (nom, poste, n°)…" />
        <button onClick={() => setEditRow({ id: null, ...blankPlayer })}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 transition-colors shrink-0">
          <Plus size={13} /> Ajouter un joueur
        </button>
      </div>

      {/* Formulaire en modale centrée */}
      <AnimatePresence>
        {editRow !== null && (
          <FormModal onClose={() => setEditRow(null)}>
            <PlayerForm
              initial={editRow}
              tenantId={tenantId}
              onSave={savePlayer}
              onCancel={() => setEditRow(null)}
            />
          </FormModal>
        )}
      </AnimatePresence>

      {/* Liste */}
      {loading ? <SkeletonRows n={5} /> : (
        <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
          {players.length === 0 ? (
            <p className="py-12 text-center text-sm text-bone-500">Aucun joueur. Ajoutez-en un.</p>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-bone-500">Aucun joueur pour « {search} ».</p>
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
                {filtered.map((p) => (
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
                    <td className="px-4 py-3 text-xs text-bone-400 hidden md:table-cell">{p.nationality_code || p.country || '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        <button title="Modifier" onClick={() => setEditRow({ ...p, jersey_number: p.shirt_number, country: p.nationality_code })} className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-emerald-400 grid place-items-center transition-colors">
                          <Pencil size={12} />
                        </button>
                        <button title="Supprimer" onClick={() => deletePlayer(p.id)} className="h-7 w-7 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 grid place-items-center transition-colors">
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
    <div className="rounded-2xl border border-white/10 bg-ink-800 shadow-2xl p-5 space-y-4">
      {/* En-tête fiche : photo + nom + fermer */}
      <div className="flex items-center gap-3 -m-1 mb-1">
        <div className="h-12 w-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 grid place-items-center shrink-0">
          {form.image_url
            ? <img src={form.image_url} alt="" className="h-full w-full object-cover" />
            : <Users size={18} className="text-bone-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{form.id ? 'Modifier le joueur' : 'Nouveau joueur'}</h3>
          <p className="text-sm font-semibold text-bone-100 truncate">{form.full_name || 'Sans nom'}{form.jersey_number ? ` · #${form.jersey_number}` : ''}</p>
        </div>
        <button onClick={onCancel} className="h-8 w-8 rounded-lg border border-white/10 text-bone-400 hover:text-bone-100 grid place-items-center shrink-0">
          <X size={14} />
        </button>
      </div>
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
  const [fmSlug,   setFmSlug]   = useState('');
  const [importing, setImporting] = useState(false);

  async function load() {
    setLoading(true);
    const json = await apiFetch(`/api/v2/admin/clubs-crud/clubs/${tenantId}/trophies`);
    setTrophies(json.data?.trophies || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [tenantId]);

  async function importFromFootmercato() {
    const slug = fmSlug.trim();
    if (!slug) { showToast('Renseigne le slug Foot Mercato (ex: ol)', false); return; }
    setImporting(true);
    try {
      const json = await apiFetch('/api/v2/admin/clubs-crud/import-trophies-footmercato', {
        method: 'POST', body: JSON.stringify({ tenantId, slug })
      });
      if (!json.success) throw new Error(json.error);
      const { added, skipped, found } = json.data;
      showToast(`Palmarès : ${added} ajouté(s)${skipped ? `, ${skipped} déjà présent(s)` : ''} sur ${found}`);
      setFmSlug('');
      load();
    } catch (e) {
      showToast('Import échoué : ' + e.message, false);
    } finally {
      setImporting(false);
    }
  }

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

      {/* Import palmarès depuis Foot Mercato */}
      <div className="rounded-xl border border-white/8 bg-white/[0.02] p-3 flex items-center gap-2 flex-wrap">
        <Download size={14} className="text-bone-400 shrink-0" />
        <span className="text-xs text-bone-300 font-semibold">Importer le palmarès depuis Foot Mercato</span>
        <input
          value={fmSlug}
          onChange={(e) => setFmSlug(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') importFromFootmercato(); }}
          placeholder="slug (ex: ol, psg, om)"
          className="h-8 px-3 rounded-lg border border-white/10 bg-ink-900/60 text-xs text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40 w-40"
        />
        <button onClick={importFromFootmercato} disabled={importing}
          className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-bone-200 hover:text-emerald-400 hover:border-emerald-500/30 disabled:opacity-40 transition-colors">
          {importing ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
          Importer
        </button>
        <span className="text-[10px] text-bone-600 w-full">N'ajoute que les trophées manquants · slug = fin de l'URL footmercato.net/club/<b>ol</b>/palmares</span>
      </div>

      <AnimatePresence>
        {editRow !== null && (
          <FormModal onClose={() => setEditRow(null)}>
            <TrophyForm initial={editRow} onSave={saveTrophy} onCancel={() => setEditRow(null)} />
          </FormModal>
        )}
      </AnimatePresence>

      {loading ? <SkeletonRows n={4} /> : (
        <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
          {trophies.length === 0 ? (
            <p className="py-12 text-center text-sm text-bone-500">Aucun trophée. Ajoutez-en un.</p>
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
                        <button title="Modifier" onClick={() => setEditRow(t)} className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-emerald-400 grid place-items-center">
                          <Pencil size={12} />
                        </button>
                        <button title="Supprimer" onClick={() => deleteTrophy(t.id)} className="h-7 w-7 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 grid place-items-center">
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
    <div className="rounded-2xl border border-white/10 bg-ink-800 shadow-2xl p-5 space-y-4">
      <div className="flex items-center gap-3 mb-1">
        <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 grid place-items-center text-amber-400 shrink-0">
          <Trophy size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-amber-400 uppercase tracking-widest">{form.id ? 'Modifier le trophée' : 'Nouveau trophée'}</h3>
          <p className="text-sm font-semibold text-bone-100 truncate">{form.label || 'Sans nom'}{form.count ? ` · ×${form.count}` : ''}</p>
        </div>
        <button onClick={onCancel} className="h-8 w-8 rounded-lg border border-white/10 text-bone-400 hover:text-bone-100 grid place-items-center shrink-0">
          <X size={14} />
        </button>
      </div>
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
  const [search,   setSearch]   = useState('');

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

  const blank = { name: '', description: '', eur_price: '', pcc_price: '', category_slug: 'maillot', display_order: products.length, status: 'active', images_list: [''], sizes_raw: 'S,M,L,XL' };

  const q = search.toLowerCase().trim();
  const filtered = !q ? products : products.filter((p) =>
    [p.name, p.category_slug, p.description].some((v) => (v || '').toLowerCase().includes(q)));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-sm text-bone-400 shrink-0">{products.length} produits</p>
        <SearchBar value={search} onChange={setSearch} placeholder="Rechercher un produit (nom, catégorie)…" />
        <button onClick={() => setEditRow(blank)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/20 text-xs font-bold text-emerald-400 hover:bg-emerald-500/25 transition-colors shrink-0">
          <Plus size={13} /> Ajouter un produit
        </button>
      </div>

      <AnimatePresence>
        {editRow !== null && (
          <FormModal onClose={() => setEditRow(null)}>
            <ProductForm initial={editRow} onSave={saveProduct} onCancel={() => setEditRow(null)} />
          </FormModal>
        )}
      </AnimatePresence>

      {loading ? <SkeletonRows n={4} /> : (
        <div className="rounded-2xl border border-white/8 bg-ink-800/40 overflow-hidden">
          {products.length === 0 ? (
            <p className="py-12 text-center text-sm text-bone-500">Aucun produit. Ajoutez-en un.</p>
          ) : filtered.length === 0 ? (
            <p className="py-12 text-center text-sm text-bone-500">Aucun produit pour « {search} ».</p>
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
                {filtered.map((p) => {
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
                          <button title="Modifier" onClick={() => setEditRow({ ...p, images_list: p.images || [''], sizes_raw: (p.sizes || []).join(', ') })} className="h-7 w-7 rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-emerald-400 grid place-items-center">
                            <Pencil size={12} />
                          </button>
                          <button title="Supprimer" onClick={() => deleteProduct(p.id)} className="h-7 w-7 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 grid place-items-center">
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
  const [form, setForm] = useState({ ...initial, images_list: (initial.images_list?.length ? initial.images_list : ['']) });
  const [saving, setSaving] = useState(false);
  function set(k) { return (e) => setForm((f) => ({ ...f, [k]: e.target.value })); }

  // Upload vers un slot précis (remplace l'image de ce slot)
  async function handleUpload(file, idx) {
    if (!file) return;
    const url = await uploadImage(file, 'produits');
    if (!url) return;
    setForm((f) => {
      const l = [...f.images_list];
      l[idx] = url;
      return { ...f, images_list: l };
    });
  }
  function setImageUrl(idx, val) {
    setForm((f) => { const l = [...f.images_list]; l[idx] = val; return { ...f, images_list: l }; });
  }
  function addImageSlot() {
    setForm((f) => ({ ...f, images_list: [...f.images_list, ''] }));
  }
  function removeImage(idx) {
    setForm((f) => {
      const l = f.images_list.filter((_, i) => i !== idx);
      return { ...f, images_list: l.length ? l : [''] };
    });
  }

  async function submit() {
    if (!form.name) return;
    setSaving(true);
    try { await onSave(form); }
    catch (e) { alert(e.message); }
    setSaving(false);
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-ink-800 shadow-2xl p-5 space-y-4">
      {/* En-tête fiche produit : visuel + nom + fermer */}
      <div className="flex items-center gap-3 mb-1">
        <div className="h-12 w-12 rounded-xl overflow-hidden bg-white/5 border border-white/10 grid place-items-center shrink-0">
          {form.images_list?.[0]
            ? <img src={form.images_list[0]} alt="" className="h-full w-full object-cover" />
            : <ShoppingBag size={18} className="text-bone-600" />}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest">{form.id ? 'Modifier le produit' : 'Nouveau produit'}</h3>
          <p className="text-sm font-semibold text-bone-100 truncate">{form.name || 'Sans nom'}{form.pcc_price ? ` · ${form.pcc_price} PCC` : ''}</p>
        </div>
        <button onClick={onCancel} className="h-8 w-8 rounded-lg border border-white/10 text-bone-400 hover:text-bone-100 grid place-items-center shrink-0">
          <X size={14} />
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Field label="Nom du produit *" cls="col-span-2">
          <input value={form.name} onChange={set('name')} placeholder="Maillot domicile 2025" className={input()} />
        </Field>
        <Field label="Catégorie">
          <select value={form.category_slug} onChange={set('category_slug')} className={input()}>
            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.label}</option>)}
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

      {/* Photos du produit (plusieurs vues : face, dos, porté…) */}
      <div className="space-y-2">
        <label className="block text-[11px] font-semibold text-bone-400 uppercase tracking-wider">
          Photos du produit
          <span className="ml-2 normal-case tracking-normal text-bone-600">la 1ʳᵉ est l'image principale · ajoutez face/dos/porté pour le slider</span>
        </label>

        {form.images_list.map((url, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <div className="h-12 w-12 shrink-0 rounded-lg border border-white/10 bg-white/5 overflow-hidden grid place-items-center">
              {url
                ? <img src={url} alt="" className="h-full w-full object-cover" />
                : <span className="text-[9px] font-bold text-bone-600">{idx === 0 ? 'PRINC' : idx + 1}</span>}
            </div>
            <input
              value={url}
              onChange={(e) => setImageUrl(idx, e.target.value)}
              placeholder={idx === 0 ? 'URL image principale' : `URL image ${idx + 1}`}
              className={cn(input(), 'flex-1')}
            />
            <label className="shrink-0 h-10 w-10 rounded-xl border border-white/10 bg-white/5 text-bone-300 hover:text-emerald-400 transition-colors grid place-items-center cursor-pointer" title="Uploader cette image">
              <Upload size={13} />
              <input type="file" accept={IMG_ACCEPT} className="hidden" onChange={(e) => handleUpload(e.target.files?.[0], idx)} />
            </label>
            {form.images_list.length > 1 && (
              <button type="button" onClick={() => removeImage(idx)} title="Retirer"
                className="shrink-0 h-10 w-10 rounded-xl border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/15 grid place-items-center">
                <Trash2 size={13} />
              </button>
            )}
          </div>
        ))}

        <div className="flex items-center gap-3">
          <button type="button" onClick={addImageSlot}
            className="flex items-center gap-1.5 text-xs text-bone-400 hover:text-emerald-400 transition-colors">
            <Plus size={13} /> Ajouter une photo
          </button>
          {uploading && (
            <span className="inline-flex items-center gap-1 text-[11px] text-bone-500">
              <Loader2 size={11} className="animate-spin" /> Upload…
            </span>
          )}
        </div>
        <p className="text-[10px] text-bone-600">{IMG_HINT}</p>
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

// Modale centrée réutilisable : plafonnée à 90vh avec scroll interne, ferme
// au clic backdrop ou Échap. Plus besoin de scroller pour voir le formulaire.
function FormModal({ onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4 bg-ink-900/80 backdrop-blur overflow-y-auto"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.97, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97 }}
        className="w-full max-w-2xl my-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// Barre de recherche compacte pour filtrer une liste
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative flex-1 min-w-[180px]">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-500" />
      {value && (
        <button onClick={() => onChange('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-bone-500 hover:text-bone-200">
          <X size={13} />
        </button>
      )}
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 rounded-xl border border-white/10 bg-ink-900/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40"
      />
    </div>
  );
}
