import { motion } from 'framer-motion';
import { Calendar, MapPin, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

function formatDate(iso) {
  if (!iso) return 'Date à venir';

  try {
    const d = new Date(iso);

    return d.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function EventCard({ event, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      whileHover={{ y: -3 }}
    >
      <Link
        to={`/events/${event.slug}`}
        className="group relative flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 md:p-6 transition-colors hover:border-gold-500/40 hover:bg-white/[0.06]"
      >
        <div className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gold-500/10 text-2xl ring-1 ring-gold-500/30">
          {event.logo_url ? (
            <img
              src={event.logo_url}
              alt={event.short_name || event.name}
              className="h-full w-full object-contain p-2"
            />
          ) : (
            <span>🏆</span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-display text-lg font-bold text-bone-50">
            {event.short_name || event.name}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-bone-300 font-mono">
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={12} />
              {formatDate(event.start_date)}
            </span>

            {event.location_name && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={12} />
                {event.location_name}
              </span>
            )}
          </div>
        </div>

        <ArrowUpRight
          size={16}
          className="text-bone-400 opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </Link>
    </motion.div>
  );
}