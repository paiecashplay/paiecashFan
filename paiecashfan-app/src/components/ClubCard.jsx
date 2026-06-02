import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { slugify } from '@/lib/slugify';

const MotionLink = motion(Link);

export function ClubCard({ club, index = 0 }) {
  return (
    <MotionLink
      to={`/clubs/${slugify(club.name)}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: (index % 12) * 0.04, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
      className={cn(
        'group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md',
        'p-5 md:p-6 transition-all duration-300',
        'hover:border-white/20 hover:bg-white/[0.06]'
      )}
      style={{
        '--club-color': club.primaryColor
      }}
    >
      {/* Glow accent au survol */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${club.primaryColor}33, transparent 70%)`
        }}
      />

      <div className="relative flex flex-col items-center text-center gap-3">
        <div
          className="relative h-16 w-16 md:h-20 md:w-20 rounded-2xl bg-white/5 ring-1 ring-white/10 grid place-items-center overflow-hidden transition-transform duration-300 group-hover:scale-110"
          style={{ '--ring': `${club.primaryColor}66` }}
        >
          {club.logo ? (
            <img
              src={club.logo}
              alt=""
              className="h-12 w-12 md:h-14 md:w-14 object-contain"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          ) : (
            <span
              className="font-display text-2xl font-black text-bone-50"
              style={{ color: club.primaryColor }}
            >
              {club.name.charAt(0)}
            </span>
          )}
        </div>

        <div className="space-y-0.5">
          <div className="font-display text-sm md:text-base font-bold text-bone-50 leading-tight line-clamp-2">
            {club.name}
          </div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-bone-400 font-semibold">
            {club.city}
          </div>
        </div>
      </div>

      <div
        className="absolute top-3 right-3 h-6 w-6 rounded-full grid place-items-center text-bone-400 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-hidden
      >
        <ArrowUpRight size={14} />
      </div>
    </MotionLink>
  );
}
