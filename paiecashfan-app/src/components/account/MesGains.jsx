import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Truck, PackageCheck, Clock, MapPin, X, Loader2, ExternalLink, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';

// Statuts de remise → libellé + style.
const STATUS = {
  pending_address: { label: 'À compléter : ton adresse', color: 'text-amber-300', bg: 'border-amber-400/30 bg-amber-400/10', icon: MapPin },
  preparing:       { label: 'En préparation',            color: 'text-sky-300',   bg: 'border-sky-400/30 bg-sky-400/10',     icon: Clock },
  shipped:         { label: 'Expédié',                   color: 'text-emerald-300', bg: 'border-emerald-400/30 bg-emerald-400/10', icon: Truck },
  delivered:       { label: 'Livré',                     color: 'text-emerald-400', bg: 'border-emerald-400/30 bg-emerald-400/10', icon: PackageCheck },
  cancelled:       { label: 'Annulé',                    color: 'text-bone-400',  bg: 'border-white/10 bg-white/[0.03]',     icon: X },
};

// Onglet « Mes gains » : les lots gagnés du fan + le suivi de leur remise.
export function MesGains() {
  const [prizes, setPrizes] = useState(null);
  const [editing, setEditing] = useState(null);   // claim dont on saisit l'adresse

  const load = () => apiFetch('/api/v2/me/prizes')
    .then((j) => setPrizes(j.data?.prizes || []))
    .catch(() => setPrizes([]));

  useEffect(() => { load(); }, []);

  if (prizes === null) {
    return <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-28 w-full rounded-2xl bg-white/[0.03] animate-pulse" />)}</div>;
  }

  if (!prizes.length) {
    return (
      <GlassCard className="p-10 text-center">
        <Gift className="mx-auto text-bone-600" size={38} />
        <p className="mt-4 text-sm text-bone-400">Tu n'as pas encore gagné de lot. Tente ta chance aux tombolas !</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-3">
      {prizes.map((p) => <PrizeCard key={p.id} prize={p} onFillAddress={() => setEditing(p)} />)}
      {editing && (
        <AddressModal
          prize={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
    </div>
  );
}

function PrizeCard({ prize, onFillAddress }) {
  const st = STATUS[prize.status] || STATUS.preparing;
  const Icon = st.icon;
  const needsAddress = prize.status === 'pending_address';

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.24em] font-black text-emerald-400">
            {prize.gameType === 'tombola' ? 'Tombola' : prize.gameType}{prize.clubName ? ` · ${prize.clubName}` : ''}
          </p>
          <h3 className="mt-1 font-display text-lg font-black text-bone-50 truncate">🎁 {prize.prizeLabel || 'Lot gagné'}</h3>
        </div>
        <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-wider ${st.bg} ${st.color}`}>
          <Icon size={12} /> {st.label}
        </span>
      </div>

      {/* Suivi d'expédition */}
      {prize.status === 'shipped' && prize.trackingNumber && (
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-bone-300">
          <span className="text-bone-400">Suivi{prize.carrier ? ` (${prize.carrier})` : ''} : </span>
          <span className="font-mono text-bone-100">{prize.trackingNumber}</span>
          {prize.trackingUrl && (
            <a href={prize.trackingUrl} target="_blank" rel="noopener noreferrer" className="ml-2 inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
              Suivre <ExternalLink size={11} />
            </a>
          )}
        </div>
      )}

      {/* Adresse à renseigner */}
      {needsAddress && (
        <div className="mt-4 flex flex-col items-start gap-3 rounded-xl border border-amber-400/25 bg-amber-400/[0.07] p-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-amber-200">Renseigne ton adresse postale pour qu'on t'envoie ton lot.</p>
          <Button variant="primary" size="sm" onClick={onFillAddress}><MapPin size={13} /> Renseigner mon adresse</Button>
        </div>
      )}

      {/* Adresse enregistrée (modifiable tant que non expédié) */}
      {!needsAddress && prize.shipping?.address1 && ['preparing'].includes(prize.status) && (
        <div className="mt-3 flex items-center justify-between gap-3 text-xs text-bone-400">
          <span className="truncate"><MapPin size={12} className="inline mr-1" />{prize.shipping.address1}, {prize.shipping.postalCode} {prize.shipping.city}</span>
          <button onClick={onFillAddress} className="shrink-0 text-emerald-400 hover:text-emerald-300 font-bold">Modifier</button>
        </div>
      )}
    </GlassCard>
  );
}

function AddressModal({ prize, onClose, onSaved }) {
  const s = prize.shipping || {};
  const [form, setForm] = useState({
    name: s.name || '', phone: s.phone || '', address1: s.address1 || '', address2: s.address2 || '',
    postalCode: s.postalCode || '', city: s.city || '', country: s.country || 'France',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save() {
    setError('');
    if (!form.name || !form.address1 || !form.postalCode || !form.city) {
      setError('Nom, adresse, code postal et ville sont obligatoires.'); return;
    }
    setSaving(true);
    try {
      await apiFetch(`/api/v2/me/prizes/${prize.id}/address`, { method: 'POST', body: JSON.stringify(form) });
      onSaved();
    } catch (e) { setError(e?.message || 'Enregistrement impossible.'); setSaving(false); }
  }

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center bg-black/80 p-4" onClick={onClose}>
      <motion.div onClick={(e) => e.stopPropagation()} initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.28em] font-black text-emerald-400">Livraison du lot</p>
            <h3 className="mt-1 font-display text-lg font-black uppercase text-bone-50">Ton adresse postale</h3>
          </div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center rounded-lg border border-white/10 text-bone-400 hover:text-bone-100"><X size={15} /></button>
        </div>
        <p className="mt-2 text-xs text-bone-400">Pour recevoir « {prize.prizeLabel} ». Ces informations ne servent qu'à l'envoi de ton lot.</p>

        <div className="mt-4 space-y-2.5">
          <Field label="Nom complet *" value={form.name} onChange={set('name')} />
          <Field label="Adresse *" value={form.address1} onChange={set('address1')} />
          <Field label="Complément (optionnel)" value={form.address2} onChange={set('address2')} />
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Code postal *" value={form.postalCode} onChange={set('postalCode')} />
            <Field label="Ville *" value={form.city} onChange={set('city')} />
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Field label="Pays" value={form.country} onChange={set('country')} />
            <Field label="Téléphone (optionnel)" value={form.phone} onChange={set('phone')} />
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}

        <div className="mt-5 flex flex-col gap-2">
          <Button variant="primary" size="md" className="w-full" onClick={save} disabled={saving}>
            {saving ? <><Loader2 size={15} className="animate-spin" /> Enregistrement…</> : <><CheckCircle2 size={15} /> Valider mon adresse</>}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-bold">{label}</span>
      <input
        value={value} onChange={onChange}
        className="mt-1 w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2 text-sm text-bone-100 outline-none focus:border-emerald-400/50"
      />
    </label>
  );
}
