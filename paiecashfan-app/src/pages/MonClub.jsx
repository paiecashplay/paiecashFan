// Espace « Mon club » — onboarding d'un représentant de club.
// Selon le statut de la candidature :
//   • aucune / draft / rejected / more_info → wizard (choix club → docs → soumettre)
//   • submitted / under_review             → écran « vérification en cours »
//   • approved                             → accès au BO du club (Phase 4)
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Building2, Search, Upload, FileText, Check, X, Loader2,
  ShieldCheck, Clock, AlertTriangle, Trash2, Send, Plus
} from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { apiFetch } from '@/lib/api';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/cn';

const DOC_DEFS = [
  { type: 'kbis',     label: 'Kbis du club',                hint: 'Extrait Kbis / enregistrement officiel du club', required: true },
  { type: 'contract', label: 'Contrat PaieCashFan signé',   hint: 'Contrat signé entre le club et PaieCashFan',      required: true },
  { type: 'id',       label: 'Pièce d\'identité du représentant', hint: 'CNI ou passeport du représentant légal',   required: true },
  { type: 'other',    label: 'Autre document (optionnel)',  hint: 'Tout justificatif complémentaire',                required: false },
];

export function MonClub() {
  const { application, loading, reload } = useOnboarding();

  return (
    <div className="relative min-h-[calc(100vh-80px)] py-12">
      <Container className="max-w-3xl">
        <Link to="/" className="inline-flex items-center gap-2 text-xs text-bone-400 hover:text-bone-100 mb-8 transition-colors">
          <ArrowLeft size={14} /> Retour au site
        </Link>

        <div className="mb-8">
          <h1 className="font-display text-3xl font-black text-bone-50">Mon club</h1>
          <p className="text-sm text-bone-400 mt-1">Espace représentant de club</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 size={28} className="text-emerald-400 animate-spin" /></div>
        ) : (
          <OnboardingRouter application={application} reload={reload} />
        )}
      </Container>
    </div>
  );
}

function OnboardingRouter({ application, reload }) {
  const status = application?.status;

  if (status === 'submitted' || status === 'under_review') {
    return <PendingScreen application={application} />;
  }
  if (status === 'approved') {
    return <ApprovedScreen application={application} />;
  }
  // aucune / draft / rejected / more_info
  return <Wizard application={application} reload={reload} />;
}

// ─── Écran « vérification en cours » ──────────────────────────────────
function PendingScreen({ application }) {
  return (
    <Panel>
      <div className="text-center py-6">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 grid place-items-center text-amber-400 mb-4">
          <Clock size={26} />
        </div>
        <h2 className="font-display text-xl font-black text-bone-50">Vérification en cours</h2>
        <p className="mt-2 text-sm text-bone-400 max-w-md mx-auto">
          Ta candidature pour <strong className="text-bone-200">{application.club_name}</strong> a bien été soumise.
          Notre équipe vérifie tes documents. Tu recevras l'accès complet à ton back-office une fois validée.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 text-xs text-bone-500">
          <FileText size={13} /> {(application.documents || []).length} document(s) transmis
        </div>
      </div>
    </Panel>
  );
}

function ApprovedScreen({ application }) {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [going, setGoing] = useState(false);

  // Le rôle vient d'être mis à jour côté serveur → on rafraîchit le profil en
  // cache pour débloquer l'accès au BO (sinon le garde de route bloque).
  useEffect(() => { refreshProfile?.(); }, []); // eslint-disable-line

  async function goToBO() {
    setGoing(true);
    await refreshProfile?.();           // garantit role=club_admin + club_id à jour
    navigate('/mon-club/bo');
    setGoing(false);
  }

  return (
    <Panel>
      <div className="text-center py-6">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 grid place-items-center text-emerald-400 mb-4">
          <ShieldCheck size={26} />
        </div>
        <h2 className="font-display text-xl font-black text-bone-50">Candidature validée 🎉</h2>
        <p className="mt-2 text-sm text-bone-400 max-w-md mx-auto">
          Bienvenue ! Tu as désormais accès au back-office de <strong className="text-bone-200">{application.club_name}</strong>.
        </p>
        <button onClick={goToBO} disabled={going}
          className="mt-6 inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-hero text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-60">
          {going ? <Loader2 size={15} className="animate-spin" /> : null}
          Accéder à mon back-office
        </button>
        {profile && profile.role !== 'club_admin' && (
          <p className="mt-3 text-[11px] text-bone-500">Rôle actuel : {profile.role} — clique pour rafraîchir tes droits.</p>
        )}
      </div>
    </Panel>
  );
}

// ─── Wizard ───────────────────────────────────────────────────────────
function Wizard({ application, reload }) {
  const [step, setStep] = useState(application?.tenant_id ? 2 : 1);
  const [toast, setToast] = useState('');
  const showToast = (m) => { setToast(m); setTimeout(() => setToast(''), 3000); };

  const steps = [
    { n: 1, label: 'Ton club' },
    { n: 2, label: 'Documents' },
    { n: 3, label: 'Soumettre' },
  ];

  return (
    <div className="space-y-6">
      {/* Bandeau refus / complément */}
      {application?.status === 'rejected' && (
        <Banner tone="red" icon={AlertTriangle}
          text={`Candidature refusée${application.review_notes ? ` : ${application.review_notes}` : ''}. Tu peux corriger et re-soumettre.`} />
      )}
      {application?.status === 'more_info' && (
        <Banner tone="amber" icon={AlertTriangle}
          text={`Informations complémentaires demandées${application.review_notes ? ` : ${application.review_notes}` : ''}.`} />
      )}

      {/* Étapes */}
      <div className="flex items-center gap-2">
        {steps.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <button
              onClick={() => { if (s.n === 1 || application?.tenant_id) setStep(s.n); }}
              className={cn(
                'inline-flex items-center gap-2 h-9 px-3 rounded-full text-xs font-bold transition-colors',
                step === s.n ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-white/5 text-bone-400 border border-white/10'
              )}
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[10px]">{s.n}</span>
              {s.label}
            </button>
            {i < steps.length - 1 && <span className="h-px w-4 bg-white/10" />}
          </div>
        ))}
      </div>

      {step === 1 && <StepClub application={application} reload={reload} onDone={() => setStep(2)} showToast={showToast} />}
      {step === 2 && <StepDocuments application={application} reload={reload} onBack={() => setStep(1)} onDone={() => setStep(3)} showToast={showToast} />}
      {step === 3 && <StepSubmit application={application} reload={reload} onBack={() => setStep(2)} showToast={showToast} />}

      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className="fixed bottom-6 right-6 px-4 py-2.5 rounded-xl bg-ink-800 border border-white/10 text-sm font-semibold text-bone-100 shadow-xl">
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Étape 1 : revendiquer un club existant OU en créer un
function StepClub({ application, reload, onDone, showToast }) {
  const [mode, setMode] = useState(application?.claim_type || 'existing');
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(
    application?.tenant?.id ? { id: application.tenant.id, label: application.tenant.name } : null
  );
  const [newClub, setNewClub] = useState({ club_name: application?.club_name || '', country: application?.country || '' });

  async function save() {
    setSaving(true);
    try {
      const body = mode === 'existing'
        ? { claim_type: 'existing', tenant_id: selected?.id }
        : { claim_type: 'new', club_name: newClub.club_name, country: newClub.country };
      const json = await apiFetch('/api/v2/onboarding/application', { method: 'POST', body: JSON.stringify(body) });
      if (!json.success) throw new Error(json.error);
      await reload();
      onDone();
    } catch (e) { showToast('Erreur : ' + e.message); }
    setSaving(false);
  }

  const canSave = mode === 'existing' ? !!selected : newClub.club_name.trim().length > 1;

  return (
    <Panel>
      <h2 className="font-display font-bold text-bone-50 mb-1">Quel club représentes-tu ?</h2>
      <p className="text-xs text-bone-400 mb-4">Revendique un club déjà référencé, ou crée-le s'il n'existe pas encore.</p>

      <div className="flex gap-2 mb-5">
        {[['existing', 'Club existant'], ['new', 'Nouveau club']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)}
            className={cn('flex-1 h-10 rounded-xl text-xs font-bold border transition-colors',
              mode === m ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-white/5 text-bone-400 border-white/10 hover:text-bone-200')}>
            {label}
          </button>
        ))}
      </div>

      {mode === 'existing' ? (
        <ClubSearchPicker selected={selected} onSelect={setSelected} />
      ) : (
        <div className="space-y-3">
          <Labeled label="Nom du club *">
            <input value={newClub.club_name} onChange={(e) => setNewClub((c) => ({ ...c, club_name: e.target.value }))}
              placeholder="Ex : AS Kaloum Star" className={inputCls} />
          </Labeled>
          <Labeled label="Pays">
            <input value={newClub.country} onChange={(e) => setNewClub((c) => ({ ...c, country: e.target.value }))}
              placeholder="Ex : Guinée" className={inputCls} />
          </Labeled>
          <p className="text-[11px] text-bone-500">Un brouillon de fiche club sera créé (invisible du public jusqu'à validation).</p>
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button onClick={save} disabled={!canSave || saving}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-hero text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-40">
          {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Continuer
        </button>
      </div>
    </Panel>
  );
}

function ClubSearchPicker({ selected, onSelect }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef(null);

  function onChange(v) {
    setQ(v);
    clearTimeout(timer.current);
    if (v.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const json = await apiFetch(`/api/v2/marketplace/search?q=${encodeURIComponent(v.trim())}`);
        setResults((json?.data?.results || []).filter((r) => r.type === 'club'));
      } catch { setResults([]); }
      setLoading(false);
    }, 250);
  }

  if (selected) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <Building2 size={16} className="text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold text-bone-100 truncate">{selected.label}</span>
        </div>
        <button onClick={() => onSelect(null)} className="text-bone-400 hover:text-red-400"><X size={15} /></button>
      </div>
    );
  }

  return (
    <div className="relative">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-500" />
      <input value={q} onChange={(e) => onChange(e.target.value)} placeholder="Rechercher ton club…"
        className={cn(inputCls, 'pl-9')} autoComplete="off" />
      {loading && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-bone-500 animate-spin" />}
      {results.length > 0 && (
        <div className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-white/10 bg-ink-800 shadow-xl overflow-hidden max-h-60 overflow-y-auto">
          {results.map((r) => (
            <button key={r.id} onClick={() => onSelect({ id: r.id.replace('club-', ''), label: r.label })}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors">
              {r.logo ? <img src={r.logo} alt="" className="h-7 w-7 rounded object-contain bg-white/5" /> : <Building2 size={16} className="text-bone-500" />}
              <div className="min-w-0">
                <div className="text-sm text-bone-100 truncate">{r.label}</div>
                <div className="text-[10px] text-bone-500 truncate">{r.sub}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Étape 2 : documents
function StepDocuments({ application, reload, onBack, onDone, showToast }) {
  const docs = application?.documents || [];
  const byType = (t) => docs.filter((d) => d.type === t);
  const requiredOk = ['kbis', 'contract', 'id'].every((t) => byType(t).length > 0);

  return (
    <Panel>
      <h2 className="font-display font-bold text-bone-50 mb-1">Documents justificatifs</h2>
      <p className="text-xs text-bone-400 mb-5">
        Ils restent <strong className="text-bone-300">confidentiels</strong> (stockage privé) et servent à valider ton statut de représentant.
      </p>

      <div className="space-y-4">
        {DOC_DEFS.map((def) => (
          <DocRow key={def.type} def={def} files={byType(def.type)} reload={reload} showToast={showToast} />
        ))}
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={onBack} className="h-11 px-5 rounded-xl border border-white/10 text-sm text-bone-300 hover:text-bone-50 transition-colors">Précédent</button>
        <button onClick={onDone} disabled={!requiredOk}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-hero text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-40">
          Continuer <Check size={15} />
        </button>
      </div>
      {!requiredOk && <p className="mt-2 text-[11px] text-amber-400/80 text-right">Kbis, contrat et pièce d'identité sont requis.</p>}
    </Panel>
  );
}

function DocRow({ def, files, reload, showToast }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);

  async function upload(file) {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const json = await apiFetch(`/api/v2/onboarding/application/documents?type=${def.type}`, { method: 'POST', body: fd });
      if (!json.success) throw new Error(json.error);
      await reload();
    } catch (e) { showToast('Erreur : ' + e.message); }
    setBusy(false);
  }

  async function remove(pathToDel) {
    setBusy(true);
    try {
      await apiFetch(`/api/v2/onboarding/application/documents?path=${encodeURIComponent(pathToDel)}`, { method: 'DELETE' });
      await reload();
    } catch (e) { showToast('Erreur : ' + e.message); }
    setBusy(false);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-ink-900/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-bone-100 flex items-center gap-2">
            {def.label} {def.required && <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400">Requis</span>}
          </div>
          <p className="text-[11px] text-bone-500 mt-0.5">{def.hint}</p>
        </div>
        <input ref={inputRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className="hidden"
          onChange={(e) => upload(e.target.files?.[0])} />
        <button onClick={() => inputRef.current?.click()} disabled={busy}
          className="shrink-0 inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-white/10 bg-white/5 text-xs font-bold text-bone-200 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors disabled:opacity-40">
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />} Ajouter
        </button>
      </div>

      {files.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {files.map((f) => (
            <li key={f.path} className="flex items-center gap-2 text-xs text-bone-300 bg-white/[0.03] rounded-lg px-3 py-2">
              <FileText size={13} className="text-emerald-400 shrink-0" />
              <span className="flex-1 truncate">{f.name}</span>
              <span className="text-[10px] text-bone-500">{Math.round((f.size || 0) / 1024)} Ko</span>
              <button onClick={() => remove(f.path)} className="text-bone-500 hover:text-red-400"><Trash2 size={13} /></button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Étape 3 : récap + soumettre
function StepSubmit({ application, reload, onBack, showToast }) {
  const [submitting, setSubmitting] = useState(false);
  const docs = application?.documents || [];

  async function submit() {
    setSubmitting(true);
    try {
      const json = await apiFetch('/api/v2/onboarding/application/submit', { method: 'POST' });
      if (!json.success) throw new Error(json.error);
      await reload();
      showToast('Candidature soumise ✅');
    } catch (e) { showToast('Erreur : ' + e.message); }
    setSubmitting(false);
  }

  return (
    <Panel>
      <h2 className="font-display font-bold text-bone-50 mb-4">Récapitulatif</h2>
      <dl className="space-y-3 text-sm">
        <Row label="Club"><span className="text-bone-100 font-semibold">{application?.club_name || '—'}</span></Row>
        <Row label="Type"><span className="text-bone-300">{application?.claim_type === 'existing' ? 'Club existant revendiqué' : 'Nouveau club'}</span></Row>
        <Row label="Documents"><span className="text-bone-300">{docs.length} fichier(s)</span></Row>
      </dl>

      <div className="mt-5 rounded-xl border border-white/10 bg-white/[0.03] p-4 text-xs text-bone-400">
        En soumettant, tu confirmes être habilité à représenter ce club. Notre équipe vérifiera tes documents avant de t'ouvrir l'accès complet au back-office.
      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={onBack} className="h-11 px-5 rounded-xl border border-white/10 text-sm text-bone-300 hover:text-bone-50 transition-colors">Précédent</button>
        <button onClick={submit} disabled={submitting}
          className="inline-flex items-center gap-2 h-11 px-6 rounded-xl bg-gradient-hero text-sm font-bold text-white hover:opacity-90 transition-all disabled:opacity-50">
          {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Soumettre ma candidature
        </button>
      </div>
    </Panel>
  );
}

// ─── petits helpers UI ────────────────────────────────────────────────
const inputCls = 'w-full h-10 px-3 rounded-xl border border-white/10 bg-ink-900/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/40';
function Panel({ children }) { return <div className="rounded-2xl border border-white/10 bg-ink-800/50 p-6">{children}</div>; }
function Labeled({ label, children }) { return <div><label className="block text-[11px] font-semibold text-bone-400 mb-1.5 uppercase tracking-wider">{label}</label>{children}</div>; }
function Row({ label, children }) { return <div className="flex items-center justify-between gap-4"><dt className="text-bone-500">{label}</dt><dd>{children}</dd></div>; }
function Banner({ tone, icon: Icon, text }) {
  const c = tone === 'red' ? 'border-red-500/20 bg-red-500/10 text-red-400' : 'border-amber-500/20 bg-amber-500/10 text-amber-400';
  return <div className={cn('flex items-start gap-2 rounded-xl border px-4 py-3 text-xs font-semibold', c)}><Icon size={15} className="shrink-0 mt-0.5" />{text}</div>;
}
