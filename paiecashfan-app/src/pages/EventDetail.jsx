import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Globe2,
  Trophy,
  ExternalLink,
} from 'lucide-react';

import { useApi } from '@/hooks/useApi';
import { Skeleton } from '@/components/ui/Skeleton';

function formatDate(date) {
  if (!date) return null;

  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function EventDetail() {
  const { slug } = useParams();

  const { data, loading, error } = useApi(
    `/api/v2/events/${slug}`,
    { fallback: null }
  );

  const event = data?.data;

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16 space-y-5">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-24 text-center">
        <Trophy size={40} className="mx-auto text-bone-500 mb-4" />

        <h1 className="font-display text-2xl font-bold text-bone-50">
          Événement introuvable
        </h1>

        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 text-sm text-emerald-400"
        >
          <ArrowLeft size={15} />
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-10 md:py-16">
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-semibold text-bone-400 hover:text-bone-100 mb-8"
      >
        <ArrowLeft size={14} />
        Retour
      </Link>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        {event.image_url && (
          <div className="h-56 md:h-80 bg-ink-800">
            <img
              src={event.image_url}
              alt={event.name}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-10">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            <div className="h-20 w-20 shrink-0 rounded-2xl border border-white/10 bg-white/5 grid place-items-center overflow-hidden">
              {event.logo_url ? (
                <img
                  src={event.logo_url}
                  alt={event.name}
                  className="h-full w-full object-contain p-3"
                />
              ) : (
                <Trophy size={30} className="text-gold-400" />
              )}
            </div>

            <div className="flex-1">
              {event.short_name && (
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400 mb-2">
                  {event.short_name}
                </p>
              )}

              <h1 className="font-display text-3xl md:text-5xl font-black text-bone-50">
                {event.name}
              </h1>

              <div className="mt-5 flex flex-wrap gap-4 text-sm text-bone-300">
                {event.start_date && (
                  <span className="inline-flex items-center gap-2">
                    <Calendar size={15} />
                    {formatDate(event.start_date)}
                    {event.end_date && (
                      <> — {formatDate(event.end_date)}</>
                    )}
                  </span>
                )}

                {event.location_name && (
                  <span className="inline-flex items-center gap-2">
                    <MapPin size={15} />
                    {event.location_name}
                  </span>
                )}

                {event.sport && (
                  <span className="inline-flex items-center gap-2">
                    <Globe2 size={15} />
                    {event.sport}
                  </span>
                )}
              </div>
            </div>
          </div>

          {event.description && (
            <p className="mt-8 max-w-4xl leading-7 text-bone-300">
              {event.description}
            </p>
          )}

          {Array.isArray(event.host_countries) &&
            event.host_countries.length > 0 && (
              <div className="mt-8">
                <p className="text-xs uppercase tracking-wider text-bone-500 mb-3">
                  Pays hôtes
                </p>

                <div className="flex flex-wrap gap-2">
                  {event.host_countries.map((country) => (
                    <span
                      key={country}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-bone-200"
                    >
                      {country}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {event.organizer && (
            <div className="mt-8 text-sm text-bone-400">
              Organisateur :{' '}
              <span className="font-semibold text-bone-200">
                {event.organizer}
              </span>
            </div>
          )}

          {event.source_url && (
            <a
              href={event.source_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 mt-8 h-10 px-4 rounded-xl border border-white/10 text-xs font-semibold text-bone-200 hover:border-emerald-500/30 hover:text-emerald-400 transition-colors"
            >
              <ExternalLink size={14} />
              Source officielle
            </a>
          )}
        </div>
      </section>
    </div>
  );
}