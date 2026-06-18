import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const MotionLink = motion(Link);

export function FederationCard({ federation, index = 0 }) {
  return (
    <MotionLink
      to={`/federations/${federation.id}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -3, scale: 1.01 }}
      className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 transition-colors hover:border-white/20 hover:bg-white/[0.06]"
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          background: `radial-gradient(circle at 30% 0%, ${federation.primaryColor}33, transparent 70%)`
        }}
      />

      <div className="relative flex items-start gap-4">
        <span
          className="grid h-14 w-14 place-items-center rounded-2xl text-2xl ring-1"
          style={{
            background: `${federation.primaryColor}1A`,
            borderColor: `${federation.primaryColor}40`,
            color: federation.accent
          }}
        >
          {federation.flag}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span
              className="font-display text-xl md:text-2xl font-black tracking-tight"
              style={{ color: federation.primaryColor === '#000000' ? '#bbb' : federation.primaryColor }}
            >
              {federation.code}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-bone-400 font-semibold">
              {federation.region}
            </span>
          </div>
          <div className="mt-1 text-sm text-bone-200 line-clamp-2">{federation.shortName}</div>
          <div className="mt-3 text-xs font-mono text-bone-400">
            {federation.clubs} sélections
          </div>
        </div>

        <ArrowUpRight size={16} className="text-bone-400 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </MotionLink>
  );
}
