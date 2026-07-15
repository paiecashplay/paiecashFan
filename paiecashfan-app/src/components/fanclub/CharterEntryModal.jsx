import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldAlert, Loader2, Check, ArrowLeft, FileText, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// Charte d'entrée dans le salon officiel des supporters d'un club.
// Version « renforcée » (ton + rappel de l'équipe favorite) quand le fan
// n'a PAS ce club en favori. Le salon n'est jamais qualifié de « privé ».
export function CharterEntryModal({ access, busy, onAccept, onClose }) {
  const [showRules, setShowRules] = useState(false);
  const clubName = access?.clubName || 'ce club';
  const favoriteClubName = access?.favoriteClubName;
  const external = !access?.isFavorite;   // fan extérieur → charte renforcée
  const backSlug = access?.favoriteClubSlug;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/80 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg rounded-3xl border border-white/10 bg-ink-950 p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start gap-3">
          <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl border ${external ? 'border-gold-400/30 bg-gold-400/10 text-gold-400' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'}`}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <p className={`text-[10px] uppercase tracking-[0.28em] font-black ${external ? 'text-gold-400' : 'text-emerald-400'}`}>Charte du salon</p>
            <h3 className="mt-1 font-display text-xl font-black uppercase text-bone-50 leading-tight">
              {external ? `Tu entres dans le salon des supporters de ${clubName}` : `Bienvenue dans le salon des supporters de ${clubName}`}
            </h3>
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm text-bone-300">
          {external && favoriteClubName && (
            <p>
              Ton équipe favorite est <b className="text-bone-100">{favoriteClubName}</b>. Tu es le bienvenu pour échanger,
              mais ce salon est avant tout l'espace de la communauté <b className="text-bone-100">{clubName}</b>.
            </p>
          )}
          {external && !favoriteClubName && (
            <p>Tu es le bienvenu pour échanger, mais ce salon est avant tout l'espace de la communauté <b className="text-bone-100">{clubName}</b>.</p>
          )}
          <p>
            Les <b className="text-bone-100">insultes</b>, <b className="text-bone-100">propos racistes ou discriminatoires</b>,
            <b className="text-bone-100"> menaces</b>, <b className="text-bone-100">harcèlement</b>, <b className="text-bone-100">provocations répétées</b>,
            <b className="text-bone-100"> spam</b> et <b className="text-bone-100">divulgation de données personnelles</b> sont interdits.
          </p>
        </div>

        {/* Décision automatisée : le supporter DOIT en être informé avant
            d'accepter (RGPD art. 22 / DSA). D'où le bump de version de la
            charte : les anciens acceptants doivent la revalider. */}
        <div className="mt-4 rounded-2xl border border-violet-500/25 bg-violet-500/[0.07] p-4">
          <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-widest font-black text-violet-300">
            <Sparkles size={12} /> Modération automatique
          </p>
          <p className="mt-2 text-sm text-bone-200">
            Chaque message est analysé par une <b className="text-bone-50">intelligence artificielle</b> avant
            publication. Les propos <b className="text-bone-50">racistes, haineux, sexuels, menaçants</b> ou
            contenant des <b className="text-bone-50">données personnelles</b> sont
            <b className="text-violet-200"> bloqués automatiquement</b> : ils ne sont jamais publiés,
            et un modérateur en est informé.
          </p>
          <p className="mt-2 text-xs text-bone-400">
            Chambrer, râler sur l'arbitre ou critiquer un joueur reste <b className="text-bone-300">totalement libre</b> —
            c'est le foot. 😉 Seuls les propos qui blessent une personne sont bloqués.
          </p>
          <p className="mt-2 text-[11px] text-bone-500">
            Une décision automatique peut se tromper : elle est toujours révisable par un humain,
            et tu peux la contester. Aucune exclusion définitive n'est jamais prononcée par l'IA.
          </p>
        </div>

        {showRules && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-bone-400 space-y-2">
            <p className="font-bold text-bone-200">Règles du salon</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Respecte les autres supporters, y compris ceux des équipes adverses.</li>
              <li>Pas d'insulte, de racisme, de discrimination, de menace ni de harcèlement.</li>
              <li>Pas de spam, de publicité, ni de provocation répétée.</li>
              <li>Ne partage jamais de données personnelles (les tiennes ou celles d'autrui).</li>
              <li>Un message signalé est examiné par un modérateur ; les abus peuvent entraîner un avertissement, une suspension ou une exclusion.</li>
              <li>Tu peux signaler tout message, publication ou commentaire via le bouton 🚩.</li>
              <li>Les messages sont analysés automatiquement avant publication : les propos racistes, haineux, sexuels, menaçants ou contenant des données personnelles sont bloqués et ne sont jamais publiés.</li>
              <li>Bloquer plusieurs messages d'affilée entraîne une mise en lecture seule temporaire, le temps qu'un modérateur relise.</li>
              <li>Une décision automatique est toujours révisable par un humain : aucune exclusion définitive n'est prononcée par l'IA seule.</li>
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <Button variant="primary" size="md" className="w-full" onClick={onAccept} disabled={busy}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} J'accepte et j'entre
          </Button>
          <div className="flex gap-2">
            {external && backSlug && (
              <Link to={`/clubs/${backSlug}/fan-club`} className="flex-1">
                <Button variant="ghost" size="md" className="w-full"><ArrowLeft size={14} /> Retourner au salon de mon club</Button>
              </Link>
            )}
            <button onClick={() => setShowRules((v) => !v)} className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-4 py-2 text-xs font-bold text-bone-300 hover:text-bone-100">
              <FileText size={13} /> {showRules ? 'Masquer la charte' : 'Consulter la charte'}
            </button>
          </div>
          {onClose && <button onClick={onClose} className="mt-1 text-[11px] text-bone-500 hover:text-bone-300">Plus tard (lecture seule)</button>}
        </div>
      </motion.div>
    </div>
  );
}
