import { motion } from 'framer-motion';
import { ArrowUpRight, User, Calendar, Award } from 'lucide-react';

// Card pour un membre national d'une fédération (ex: Algérie dans CAF).
// Reprend la structure de l'ancienne caf.html mais avec le design futuriste.
export function FederationMemberCard({ member, index = 0 }) {
  const primaryColor = member.colors?.[0] || '#10b981';
  const accentColor  = member.colors?.[1] || primaryColor;

  return (
    <motion.a
      href={`#${member.code}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.45, delay: (index % 12) * 0.03 }}
      whileHover={{ y: -3 }}
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 overflow-hidden transition-colors hover:border-white/20 hover:bg-white/[0.06]"
    >
      {/* Glow accent au survol, couleur du drapeau */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${primaryColor}22, transparent 70%)` }}
      />

      <div className="relative">
        {/* Header : code 2 lettres + nom + flag emoji + badge région */}
        <div className="flex items-start justify-between gap-2 mb-4">
          <div className="flex items-start gap-3 min-w-0">
            <span
              className="shrink-0 grid place-items-center h-10 w-10 rounded-xl font-display font-black text-sm bg-white/5 border border-white/10"
              style={{ color: primaryColor }}
            >
              {member.code?.slice(0, 2).toUpperCase() || '??'}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>{member.flag}</span>
                <h3 className="font-display font-bold text-base text-bone-50 truncate">
                  {member.nameFR || member.name}
                </h3>
              </div>
              <div className="mt-0.5 text-[10px] font-mono text-bone-400 tracking-wider">
                {member.code}
              </div>
            </div>
          </div>
          <RegionBadge region={member.region} />
        </div>

        {/* Logo de la fédération nationale */}
        {member.logo && (
          <div className="flex justify-center mb-4 h-16">
            <img
              src={member.logo}
              alt={member.federation}
              loading="lazy"
              className="h-full w-auto object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          </div>
        )}

        {/* Méta : président, fondation, FIFA */}
        <ul className="space-y-1.5 text-xs">
          {member.president && (
            <MetaRow icon={User} label="Président" value={member.president} />
          )}
          {member.founded && (
            <MetaRow icon={Calendar} label="Fondation" value={member.founded} />
          )}
          {member.fifaMember && (
            <MetaRow icon={Award} label="Membre FIFA" value={member.fifaMember} />
          )}
        </ul>

        {/* CTA discret en bas */}
        <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-semibold">
            Voir le détail
          </span>
          <ArrowUpRight
            size={14}
            className="text-bone-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
            style={{ color: primaryColor }}
          />
        </div>
      </div>
    </motion.a>
  );
}

function MetaRow({ icon: Icon, label, value }) {
  return (
    <li className="flex items-center justify-between gap-2 text-bone-400">
      <span className="inline-flex items-center gap-1.5">
        <Icon size={11} className="opacity-60" />
        <span>{label}</span>
      </span>
      <span className="text-bone-200 font-mono truncate max-w-[60%] text-right" title={String(value)}>
        {value}
      </span>
    </li>
  );
}

// Couleur de la pill par région CAF
const regionStyles = {
  'Afrique du Nord':    'bg-rose-500/15 text-rose-500 border-rose-500/30',
  'Afrique de l\'Ouest':'bg-gold-500/15 text-gold-400 border-gold-500/30',
  'Afrique Centrale':   'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  'Afrique de l\'Est':  'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
  'Afrique Australe':   'bg-pink-400/15 text-pink-400 border-pink-400/30'
};

function RegionBadge({ region }) {
  const cls = regionStyles[region] || 'bg-white/5 text-bone-300 border-white/10';
  return (
    <span className={`shrink-0 text-[9px] font-bold uppercase tracking-[0.14em] px-2 py-0.5 rounded-full border ${cls}`}>
      {region}
    </span>
  );
}
