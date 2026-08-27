// BO Super Admin — Édition complète d'une fédération
// 1) Infos du hero (logo, photo, couleurs, devise, président…)
// 2) Clubs membres : liste + ajouter un club (fédération pré-remplie)
//    + créer le hub automatiquement
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Upload, Loader2, Check, X, Globe, Plus, Pencil,
  Star, ExternalLink, Download, Trash2, Users, Shield, ShoppingBag
} from 'lucide-react';
import { ProductsTab } from '@/pages/admin/AdminClubEdit';
import { apiFetch } from '@/lib/api';
import { useImageUpload } from '@/hooks/useImageUpload';
import { cn } from '@/lib/cn';

const CONFEDERATIONS = ['CAF', 'UEFA', 'CONMEBOL', 'CONCACAF', 'AFC', 'OFC'];
const IMG_ACCEPT = 'image/jpeg,image/png,image/webp,image/avif,image/gif,image/svg+xml';
const IMG_HINT   = 'JPG, PNG, WEBP, AVIF, GIF ou SVG · 10 Mo max';
const inputCls = () => 'w-full h-10 px-3 rounded-xl border border-white/10 bg-ink-900/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40 transition-colors';

// Genres pour les équipes nationales (pour le sélecteur de rattachement)
const GENDER_LABELS_NATIONAL_TEAMS = {
  male: 'Masculine',
  female: 'Féminine',
};

// Formats d'âge pour les équipes nationales (U23, U20, U17…)
const DEFAULT_CATEGORIES_NATIONAL_TEAMS = {
  senior: 'Senior',
  U23: 'U23',
  U20: 'U20',
  U17: 'U17',
};

// Défini au niveau module (PAS dans le composant) : sinon il est recréé à
// chaque rendu → React démonte/remonte les inputs → perte du focus à chaque
// frappe. C'était la cause du « il faut recliquer entre chaque lettre ».
function Field({ label, children, cls = '' }) {
  return (
    <div className={cls}>
      <label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

export function AdminFederationEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [fed, setFed] = useState(null);
  const [members, setMembers] = useState([]);
  const [toast, setToast] = useState(null);
  const [tab, setTab] = useState('info');

  const [nationalTeams, setNationalTeams] = useState({
    men: [],
    women: [],
    youth: [],
  });

  const [teamsLoading, setTeamsLoading] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [teamPlayers, setTeamPlayers] = useState([]);
  const [playersLoading, setPlayersLoading] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);

  const playersSectionRef = useRef(null);

  async function loadNationalTeams() {
    setTeamsLoading(true);

    try {
      const json = await apiFetch(
        `/api/v2/admin/clubs-crud/federations/${id}/national-teams`
      );

      if (!json.success) {
        throw new Error(json.error);
      }

      setNationalTeams(
        json.data?.nationalTeams || {
          men: [],
          women: [],
          youth: [],
        }
      );
    } catch (e) {
      showToast(
        'Erreur sélections : ' + e.message,
        false
      );
    } finally {
      setTeamsLoading(false);
    }
  }

  async function saveNationalTeam(teamId, form) {
    try {
      const json = await apiFetch(
        `/api/v2/admin/clubs-crud/federations/${id}/national-teams/${teamId}`,
        {
          method: 'PUT',
          body: JSON.stringify(form),
        }
      );

      if (!json.success) {
        throw new Error(json.error);
      }

      showToast('Sélection mise à jour');
      setEditingTeam(null);

      setSelectedTeam(null);
      setTeamPlayers([]);
      setEditingPlayer(null);

      await loadNationalTeams();
    } catch (e) {
      showToast('Erreur : ' + e.message, false);
    }
  }

  async function deleteNationalTeam(team) {
    const confirmed = confirm(`Supprimer la sélection « ${team.name} » ?`);

    if (!confirmed) return;

    try {
      const json = await apiFetch(
        `/api/v2/admin/clubs-crud/federations/${id}/national-teams/${team.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!json.success) {
        throw new Error(json.error);
      }

      // Si on regardait justement l'effectif de cette sélection
      if (
        selectedTeam &&
        String(selectedTeam.id) === String(team.id)
      ) {
        setSelectedTeam(null);
        setTeamPlayers([]);
        setEditingPlayer(null);
      }

      showToast('Sélection supprimée');

      await loadNationalTeams();
    } catch (e) {
      showToast(
        'Erreur : ' + e.message,
        false
      );
    }
  }

  async function addNationalTeam(form) {
    try {
      const body = {
        name: form.displayName,
        gender: form.gender,
        group: form.group,
        category: form.category,
        logo: form.logo,
        enabled: form.enabled,
        displayOrder: form.displayOrder,
      };

      const json = await apiFetch(
        `/api/v2/admin/clubs-crud/federations/${id}/national-teams`,
        {
          method: 'POST',
          body: JSON.stringify(body),
        }
      );

      if (!json.success) {
        throw new Error(json.error);
      }

      const createdTeam = json.data?.team;

      showToast('Sélection ajoutée');
      setEditingTeam(null);

      await loadNationalTeams();

      // Afficher l'effectif uniquement si la création a réussi
      if (createdTeam) {
        setSelectedTeam(createdTeam);
        setTeamPlayers([]);
        setEditingPlayer(null);
      }

    } catch (e) {
      showToast(
        'Erreur : ' + e.message,
        false
      );
    }
  }

  async function loadTeamPlayers(team) {
    setSelectedTeam(team);
    setPlayersLoading(true);

    try {
      const json = await apiFetch(
        `/api/v2/admin/clubs-crud/federations/${id}/national-teams/${team.id}/players`
      );

      if (!json.success) {
        throw new Error(json.error);
      }

      setTeamPlayers(json.data?.players || []);

      setTimeout(() => {
        playersSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);

    } catch (e) {
      showToast(
        'Erreur effectif : ' + e.message,
        false
      );

      setTeamPlayers([]);
    } finally {
      setPlayersLoading(false);
    }
  }

  async function savePlayer(playerId, form) {
    try {
      const json = await apiFetch(
        `/api/v2/admin/clubs-crud/federations/${id}/national-teams/${selectedTeam.id}/players/${playerId}`,
        {
          method: 'PUT',
          body: JSON.stringify(form),
        }
      );

      if (!json.success) {
        throw new Error(json.error);
      }

      showToast('Joueur mis à jour');
      setEditingPlayer(null);

      await loadTeamPlayers(selectedTeam);
    } catch (e) {
      showToast(
        'Erreur : ' + e.message,
        false
      );
    }
  }

  async function deletePlayer(player) {
    const confirmed = confirm(
      `Supprimer « ${player.name} » de cette sélection ?`
    );

    if (!confirmed) return;

    try {
      const json = await apiFetch(
        `/api/v2/admin/clubs-crud/federations/${id}/national-teams/${selectedTeam.id}/players/${player.id}`,
        {
          method: 'DELETE',
        }
      );

      if (!json.success) {
        throw new Error(json.error);
      }

      showToast('Joueur supprimé');

      await loadTeamPlayers(selectedTeam);
    } catch (e) {
      showToast(
        'Erreur : ' + e.message,
        false
      );
    }
  }

  async function addManualPlayer(form) {
    try {
      const json = await apiFetch(
        `/api/v2/admin/clubs-crud/federations/${id}/national-teams/${selectedTeam.id}/players`,
        {
          method: 'POST',
          body: JSON.stringify(form),
        }
      );

      if (!json.success) {
        throw new Error(json.error);
      }

      showToast('Joueur ajouté');
      setEditingPlayer(null);

      await loadTeamPlayers(selectedTeam);
    } catch (e) {
      showToast(
        'Erreur : ' + e.message,
        false
      );
    }
  }

  

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

  useEffect(() => {
    if (tab === 'national-teams') {
      loadNationalTeams();
    }
  }, [tab]);

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

      <div className="flex w-fit gap-1 rounded-xl border border-white/8 bg-ink-800/40 p-1">
        <button
          onClick={() => setTab('info')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all',
            tab === 'info'
              ? 'border border-emerald-500/20 bg-emerald-500/15 text-emerald-400'
              : 'text-bone-400 hover:text-bone-200'
          )}
        >
          <Globe size={13} />
          Infos
        </button>

        <button
          onClick={() => setTab('members')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all',
            tab === 'members'
              ? 'border border-emerald-500/20 bg-emerald-500/15 text-emerald-400'
              : 'text-bone-400 hover:text-bone-200'
          )}
        >
          <Star size={13} />
          Clubs membres
        </button>

        <button
          onClick={() => setTab('products')}
          disabled={!hub}
          title={!hub ? 'Créez d’abord le hub de cette fédération' : 'Gérer la boutique'}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all',
            'disabled:cursor-not-allowed disabled:opacity-40',
            tab === 'products'
              ? 'border border-emerald-500/20 bg-emerald-500/15 text-emerald-400'
              : 'text-bone-400 hover:text-bone-200'
          )}
        >
          <ShoppingBag size={13} />
          Boutique
        </button>

        <button
          onClick={() => setTab('national-teams')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all',
            tab === 'national-teams'
              ? 'border border-emerald-500/20 bg-emerald-500/15 text-emerald-400'
              : 'text-bone-400 hover:text-bone-200'
          )}>
          <Users size={13} />
          Sélections nationales
        </button>
      </div>

      {tab === 'info' && (
        <FederationInfoForm
          fed={fed}
          onSaved={(f) => {
            setFed(f);
            showToast('Fédération sauvegardée');
          }}
        />
      )}

     {tab === 'members' && (
      <MembersSection
        fed={fed}
        members={members}
        hub={hub}
        navigate={navigate}
        onCreateHub={async () => {
          try {
            const json = await apiFetch(
              `/api/v2/admin/clubs-crud/federations/${fed.id}/create-hub`,
              { method: 'POST' }
            );

            if (!json.success) throw new Error(json.error);

            showToast(
              json.data.created
                ? 'Hub créé'
                : 'Hub déjà existant'
            );

            loadAll();
          } catch (e) {
            showToast('Erreur : ' + e.message, false);
          }
        }}
        onImportClubs={async () => {
          const json = await apiFetch(
            `/api/v2/admin/clubs-crud/federations/${fed.id}/import-clubs`,
            { method: 'POST' }
          );

          if (!json.success) throw new Error(json.error);

          const { added, skipped, found } = json.data;

          showToast(
            `${added} club(s) importé(s)${
              skipped ? `, ${skipped} déjà présent(s)` : ''
            } sur ${found}`
          );

          loadAll();
          return json.data;
        }}
        onDeleteClub={async (club) => {
          const json = await apiFetch(
            `/api/v2/admin/clubs-crud/clubs/${club.id}`,
            { method: 'DELETE' }
          );

          if (!json.success) throw new Error(json.error);

          showToast(`« ${club.name} » supprimé`);

          setMembers((ms) =>
            ms.filter((m) => m.id !== club.id)
          );
        }}
      />
     )}

    {tab === 'national-teams' && (
      <NationalTeamsAdminSection
        teams={nationalTeams}
        loading={teamsLoading}

        onEditTeam={setEditingTeam}

        onAddTeam={() =>
          setEditingTeam({
            mode: 'create',
            name: '',
            gender: 'male',
            group: 'men',
            category: 'senior',
            logo: '',
            enabled: true,
            displayOrder: 0,
          })
        }

        onDeleteTeam={deleteNationalTeam}

        onRefreshTeams={loadNationalTeams}

        onOpenPlayers={loadTeamPlayers}

        selectedTeam={selectedTeam}

        players={teamPlayers}
        playersLoading={playersLoading}

        onEditPlayer={setEditingPlayer}
        onDeletePlayer={deletePlayer}

        onAddPlayer={() =>
          setEditingPlayer({
            mode: 'create',
            name: '',
            number: '',
            position: '',
            photo: '',
          })
        }
        onClosePlayers={() => {
          setSelectedTeam(null);
          setTeamPlayers([]);
          setEditingPlayer(null);
        }}
        playersSectionRef={playersSectionRef}
      />
    )}

    {tab === 'products' && hub && (
        <ProductsTab
          tenantId={hub.id}
          showToast={showToast}
        />
      )}

      {editingTeam && (
        <NationalTeamEditModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onSave={(form) => {
            if (editingTeam.mode === 'create') {
              return addNationalTeam(form);
            }

            return saveNationalTeam(
              editingTeam.id,
              form
            );
          }}
        />
      )}

      {editingPlayer && selectedTeam && (
        <PlayerEditModal
          player={editingPlayer}
          onClose={() => setEditingPlayer(null)}
          onSave={(form) => {
            if (editingPlayer.mode === 'create') {
              return addManualPlayer(form);
            }

            return savePlayer(
              editingPlayer.id,
              form
            );
          }}
        />
      )}

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
    acronym: fed.metadata?.acronym || '',
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
      // Le sigle (FECAFOOT…) est stocké dans metadata.acronym pour la recherche.
      // On préserve le reste du metadata existant.
      const { acronym, ...rest } = form;
      const body = { ...rest, metadata: { ...(fed.metadata || {}), acronym: acronym.trim().toUpperCase() } };
      const json = await apiFetch(`/api/v2/admin/clubs-crud/federations/${fed.id}`, { method: 'PUT', body: JSON.stringify(body) });
      if (!json.success) throw new Error(json.error);
      onSaved(json.data.federation);
    } catch (e) { alert('Erreur : ' + e.message); }
    setSaving(false);
  }

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
        <Field label="Sigle / acronyme (recherche)"><input value={form.acronym} onChange={set('acronym')} placeholder="FECAFOOT" className={inputCls()} /></Field>
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

function NationalTeamsAdminSection({
  teams,
  loading,
  onEditTeam,
  onAddTeam,
  onDeleteTeam,
  onRefreshTeams,

  onOpenPlayers,
  selectedTeam,

  players,
  playersLoading,

  onEditPlayer,
  onDeletePlayer,
  onAddPlayer,
  onClosePlayers,
  playersSectionRef
}) {
  const allTeams = [
    ...(teams?.men || []),
    ...(teams?.women || []),
    ...(teams?.youth || []),
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/8 bg-ink-800/40 p-5">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Sélections nationales
            </h2>

            <p className="mt-1 text-xs text-bone-400">
              {allTeams.length} sélection
              {allTeams.length > 1 ? 's' : ''} détectée
              {allTeams.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onAddTeam}
              className="flex h-9 items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/15 px-4 text-xs font-bold text-emerald-400"
            >
              <Plus size={13} />
              Ajouter une sélection
            </button>

            <button
              type="button"
              onClick={onRefreshTeams}
              disabled={loading}
              className="flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 text-xs font-bold text-bone-300 hover:text-emerald-400 disabled:opacity-50"
            >
              {loading ? (
                <Loader2
                  size={13}
                  className="animate-spin"
                />
              ) : (
                <Download size={13} />
              )}

              {loading
                ? 'Actualisation…'
                : 'Actualiser depuis API-Football'}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-sm text-bone-500">
            <Loader2
              size={20}
              className="mx-auto mb-3 animate-spin"
            />

            Chargement des sélections…
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {allTeams.map((team) => (
              <div
                key={team.id}
                className="rounded-xl border border-white/8 bg-white/[0.02] p-4"
              >
                <div className="flex items-start gap-3">
                  {team.logo ? (
                    <img
                      src={team.logo}
                      alt=""
                      className="h-12 w-12 shrink-0 object-contain"
                    />
                  ) : (
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-white/5">
                      <Shield size={18} />
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-bone-100">
                      {team.name}
                    </p>

                    <p className="mt-1 text-[10px] uppercase tracking-wider text-bone-500">
                      {DEFAULT_CATEGORIES_NATIONAL_TEAMS[team.category] || team.category}
                      {' · '}
                      {GENDER_LABELS_NATIONAL_TEAMS[team.gender] || team.gender}
                    </p>  
                  </div>

                  <span
                    className={cn(
                      'rounded-full border px-2 py-1 text-[9px] font-bold uppercase',
                      team.enabled === false
                        ? 'border-red-500/20 bg-red-500/10 text-red-400'
                        : 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                    )}
                  >
                    {team.enabled === false
                      ? 'Masquée'
                      : 'Active'}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => onEditTeam(team)}
                    className="flex h-8 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-bone-300 hover:text-emerald-400"
                  >
                    <Pencil size={12} />
                    Modifier
                  </button>

                  <button
                    onClick={() => onOpenPlayers(team)}
                    className="flex h-8 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-xs font-bold text-bone-300 hover:text-emerald-400"
                  >
                    <Users size={12} />
                    Effectif
                  </button>

                  <button
                    onClick={() => onDeleteTeam(team)}
                    className="flex h-8 items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/5 px-3 text-xs font-bold text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 size={12} />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedTeam && (
        <div ref={playersSectionRef} className="scroll-mt-6 rounded-2xl border border-white/8 bg-ink-800/40 p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                Effectif
              </h2>

              <p className="mt-1 text-sm font-semibold text-bone-100">
                {selectedTeam.name}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onAddPlayer}
                className="flex h-9 items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/15 px-4 text-xs font-bold text-emerald-400"
              >
                <Plus size={13} />
                Ajouter un joueur
              </button>

              <button
                type="button"
                onClick={onClosePlayers}
                title="Fermer l'effectif"
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-bone-400 hover:bg-white/10 hover:text-white">
                <X size={14} />
              </button>
            </div>
          </div>

          {playersLoading ? (
  <div className="py-10 text-center">
    <Loader2
      size={20}
      className="mx-auto animate-spin text-emerald-400"
    />
  </div>
            ) : players.length === 0 ? (
              /* Aucun joueur */
              <div className="rounded-xl border border-dashed border-white/10 py-10 text-center">
                <Users
                  size={28}
                  className="mx-auto mb-3 text-bone-500"
                />

                <p className="text-sm font-semibold text-bone-200">
                  Aucun joueur dans cette sélection
                </p>

                <p className="mt-1 text-xs text-bone-500">
                  Commencez par ajouter un joueur à l'effectif.
                </p>

                <button
                  type="button"
                  onClick={onAddPlayer}
                  className="mt-4 inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/15 px-4 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20"
                >
                  <Plus size={13} />
                  Ajouter le premier joueur
                </button>
              </div>
            ) : (
              /* Effectif */
              <div className="overflow-hidden rounded-xl border border-white/8">
                <table className="w-full text-sm">
                  <thead className="border-b border-white/8">
                    <tr className="text-left text-[10px] uppercase tracking-widest text-bone-500">
                      <th className="px-4 py-3 font-bold">
                        Joueur
                      </th>

                      <th className="px-4 py-3 font-bold">
                        N°
                      </th>

                      <th className="px-4 py-3 font-bold">
                        Poste
                      </th>

                      <th className="px-4 py-3 font-bold text-right">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {players.map((player) => (
                      <tr
                        key={player.id}
                        className="border-b border-white/5 last:border-0"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {player.photo ? (
                              <img
                                src={player.photo}
                                alt={player.name}
                                className="h-9 w-9 rounded-full object-cover"
                              />
                            ) : (
                              <div className="grid h-9 w-9 place-items-center rounded-full bg-white/5">
                                <Users
                                  size={14}
                                  className="text-bone-500"
                                />
                              </div>
                            )}

                            <p className="font-semibold text-bone-100">
                              {player.name}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-xs text-bone-400">
                          {player.number ?? '—'}
                        </td>

                        <td className="px-4 py-3 text-xs text-bone-400">
                          {player.position || '—'}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                onEditPlayer({
                                  ...player,
                                  mode: 'edit',
                                })
                              }
                              title="Modifier le joueur"
                              className="grid h-7 w-7 place-items-center rounded-lg border border-white/10 bg-white/5 text-bone-400 hover:text-emerald-400"
                            >
                              <Pencil size={12} />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                onDeletePlayer(player)
                              }
                              title="Supprimer le joueur"
                              className="grid h-7 w-7 place-items-center rounded-lg border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
}

function NationalTeamEditModal({team, onClose, onSave}) {
  const { uploadImage, uploading } = useImageUpload();
  const logoRef = useRef();

  const [saving, setSaving] = useState(false);

  const isNew = team.mode === 'create';

  const [form, setForm] = useState({
    displayName:
      team.displayName ||
      team.name ||
      '',

    gender:
      team.gender ||
      'male',

    group:
      team.group ||
      (
        team.category !== 'senior'
          ? 'youth' : team.gender === 'female' ? 'women' : 'men'
      ),

    category:
      team.category ||
      'senior',

    logo:
      team.logo ||
      '',

    enabled:
      team.enabled !== false,

    displayOrder:
      team.displayOrder ?? 0,
  });

  const isCustomCategory = !!form.category && !Object.hasOwn(DEFAULT_CATEGORIES_NATIONAL_TEAMS, form.category);

  async function uploadLogo(file) {
    if (!file) return;

    const url = await uploadImage(
      file,
      'federations/national-teams'
    );

    if (url) {
      setForm((prev) => ({
        ...prev,
        logo: url,
      }));
    }
  }

  const set = (key) => (e) => {
    const value =
      e.target.type === 'checkbox'
        ? e.target.checked
        : e.target.value;

    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  async function submit() {
    setSaving(true);

    await onSave({
      ...form,
      displayOrder:
        Number(form.displayOrder) || 0,
    });

    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="font-display text-xl font-black text-bone-50">
              {isNew
                ? 'Ajouter une sélection'
                : 'Modifier la sélection'}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-bone-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <Field label="Nom affiché*">
            <input
              value={form.displayName}
              onChange={set('displayName')}
              className={inputCls()}
              placeholder="Ex : Les Bleus"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Genre">
                  <select
                    value={form.gender}
                    onChange={(e) => {
                      const gender = e.target.value;

                      setForm((prev) => ({
                        ...prev,
                        gender,
                        group:
                          prev.category === 'senior' ? gender === 'female' ? 'women' : 'men' : prev.group,
                      }));
                    }}
                    className={inputCls()}
                  >
                    <option value="male">
                      Masculine
                    </option>

                    <option value="female">
                      Féminine
                    </option>
                  </select>
            </Field>

            <Field label="Groupe d'affichage">
                  <select
                    value={form.group}
                    onChange={set('group')}
                    className={inputCls()}
                  >
                    <option value="men">
                      Sélections masculines
                    </option>

                    <option value="women">
                      Sélections féminines
                    </option>

                    <option value="youth">
                      Sélections jeunes
                    </option>
                  </select>
            </Field>
          </div>
            <Field label="Catégorie">
              <select
                value={
                  isCustomCategory || form.category === '' ? '__custom__' : form.category
                }
                onChange={(e) => {
                  const value = e.target.value;

                  setForm((prev) => {
                    const category =
                      value === '__custom__'
                        ? ''
                        : value;

                    let group = prev.group;

                    if (category === 'senior') {
                      group =
                        prev.gender === 'female'
                          ? 'women'
                          : 'men';
                    } else if (
                      ['U23', 'U20', 'U17'].includes(category)
                    ) {
                      group = 'youth';
                    }

                    return {
                      ...prev,
                      category,
                      group,
                    };
                  });
                }}
                className={inputCls()}>
                <option value="senior">Senior</option>
                <option value="U23">U23</option>
                <option value="U20">U20</option>
                <option value="U17">U17</option>
                <option value="__custom__">
                  Autre catégorie…
                </option>
              </select>

              {(isCustomCategory || form.category === '') && (
                <input
                  value={form.category}
                  onChange={set('category')}
                  placeholder="Ex : U15, U18, Olympique, A'…"
                  className={cn(inputCls(), 'mt-2')}
                />
              )}
            </Field>
          
          <Field label="Logo de la sélection">
            <div className="flex items-start gap-3">
              {form.logo && (
                <img
                  src={form.logo}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl border border-white/10 bg-white/5 object-contain"
                />
              )}

              <div className="flex-1 space-y-2">
                <input
                  value={form.logo}
                  onChange={set('logo')}
                  className={inputCls()}
                  placeholder="https://… ou upload"
                />

                <input
                  ref={logoRef}
                  type="file"
                  accept={IMG_ACCEPT}
                  className="hidden"
                  onChange={(e) =>
                    uploadLogo(e.target.files?.[0])
                  }
                />

                <button
                  type="button"
                  onClick={() => logoRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 text-xs text-bone-400 hover:text-emerald-400"
                >
                  {uploading ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Upload size={13} />
                  )}

                  {uploading
                    ? 'Upload…'
                    : 'Importer un logo'}
                </button>

                <p className="text-[10px] text-bone-600">
                  {IMG_HINT}
                </p>
              </div>
            </div>
          </Field>
          <Field label="Ordre d'affichage">
            <input
              type="number"
              value={form.displayOrder}
              onChange={set('displayOrder')}
              className={inputCls()}
            />
          </Field>

          <label className="flex items-center gap-3 text-sm text-bone-200">
            <input
              type="checkbox"
              checked={form.enabled}
              onChange={set('enabled')}
            />

            Afficher cette sélection
          </label>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 p-5">
          <button
            onClick={onClose}
            className="h-10 rounded-xl border border-white/10 px-4 text-xs font-bold text-bone-300"
          >
            Annuler
          </button>

          <button
            onClick={submit}
            disabled={saving}
            className="flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-xs font-bold text-ink-900 disabled:opacity-50"
          >
            {saving && (
              <Loader2
                size={13}
                className="animate-spin"
              />
            )}

            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerEditModal({player, onClose, onSave}) {
  const { uploadImage, uploading } = useImageUpload();
  const photoRef = useRef();
  const isNew = player.mode === 'create';

  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: player.name || '',
    number: player.number ?? '',
    position: player.position || '',
    photo: player.photo || '',
  });

  async function uploadPhoto(file) {
    if (!file) return;

    const url = await uploadImage(
      file,
      'federations/national-teams/players'
    );

    if (url) {
      setForm((prev) => ({
        ...prev,
        photo: url,
      }));
    }
  }

  const set = (key) => (e) =>
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));

  async function submit() {
    if (!form.name.trim()) return;

    setSaving(true);

    await onSave({
      name: form.name.trim(),
      number:
        form.number === ''
          ? null
          : Number(form.number),
      position: form.position || null,
      photo: form.photo || null,
    });

    setSaving(false);
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div>
            <h2 className="font-display text-xl font-black text-bone-50">
              {isNew
                ? 'Ajouter un joueur'
                : 'Modifier le joueur'}
            </h2>

            {!isNew && (
              <p className="mt-1 text-xs text-bone-500">
                {player.source === 'manual'
                  ? 'Joueur manuel'
                  : 'API-Football'}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-bone-400 hover:text-white"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <Field label="Nom Complet*">
            <input
              value={form.name}
              onChange={set('name')}
              className={inputCls()}
              placeholder="Ex : André Dupond"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Numéro">
              <input
                type="number"
                value={form.number}
                onChange={set('number')}
                className={inputCls()}
                placeholder="10"
              />
            </Field>

            <Field label="Poste">
              <select
                value={form.position}
                onChange={set('position')}
                className={inputCls()}
              >
                <option value="">
                  Non renseigné
                </option>

                <option value="Goalkeeper">
                  Gardien
                </option>

                <option value="Defender">
                  Défenseur
                </option>

                <option value="Midfielder">
                  Milieu
                </option>

                <option value="Attacker">
                  Attaquant
                </option>
              </select>
            </Field>
          </div>

          <Field label="Photo du joueur">
            <div className="flex items-start gap-3">
              {form.photo && (
                <img
                  src={form.photo}
                  alt=""
                  className="h-16 w-16 shrink-0 rounded-xl border border-white/10 bg-white/5 object-cover"
                />
              )}

              <div className="flex-1 space-y-2">
                <input
                  value={form.photo}
                  onChange={set('photo')}
                  className={inputCls()}
                  placeholder="https://… ou upload"
                />

                <input
                  ref={photoRef}
                  type="file"
                  accept={IMG_ACCEPT}
                  className="hidden"
                  onChange={(e) =>
                    uploadPhoto(e.target.files?.[0])
                  }
                />

                <button
                  type="button"
                  onClick={() => photoRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2 text-xs text-bone-400 hover:text-emerald-400"
                >
                  {uploading ? (
                    <Loader2
                      size={13}
                      className="animate-spin"
                    />
                  ) : (
                    <Upload size={13} />
                  )}

                  {uploading
                    ? 'Upload…'
                    : 'Importer une photo'}
                </button>

                <p className="text-[10px] text-bone-600">
                  {IMG_HINT}
                </p>
              </div>
            </div>
          </Field>
        </div>

        <div className="flex justify-end gap-3 border-t border-white/10 p-5">
          <button
            onClick={onClose}
            className="h-10 rounded-xl border border-white/10 px-4 text-xs font-bold text-bone-300"
          >
            Annuler
          </button>

          <button
            onClick={submit}
            disabled={saving || uploading || !form.name.trim()}
            className="flex h-10 items-center gap-2 rounded-xl bg-emerald-500 px-4 text-xs font-bold text-ink-900 disabled:opacity-50"
          >
            {saving && (
              <Loader2
                size={13}
                className="animate-spin"
              />
            )}

            {isNew ? 'Ajouter' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}