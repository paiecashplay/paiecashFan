import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, Grid3x3, Users, Star, Crown, Medal } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { compFor, FMT, MATCHES } from '@/components/bingo/EditionCard';

const fmtDate = (s) => { try { return new Date(s).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }); } catch { return s; } };

export function BingoResults() {
  const { user } = useAuth();
  const [editions, setEditions] = useState(null);
  const [myCards, setMyCards] = useState([]);
  useEffect(() => { apiFetch('/api/v2/bingo/results').then((j) => setEditions(j.data?.editions || [])).catch(() => setEditions([])); }, []);
  useEffect(() => { if (user) apiFetch('/api/v2/bingo/me/cards').then((j) => setMyCards(j.data?.cards || [])).catch(() => {}); }, [user]);
  const myByEd = useMemo(() => Object.fromEntries(myCards.map((c) => [c.edition_id, c])), [myCards]);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(245,158,11,0.12),transparent_38%)]" />
      <Container className="relative py-10 md:py-14">
        <Link to="/tombola/sport-bingo" className="inline-flex items-center gap-2 text-sm text-bone-400 hover:text-bone-100"><ArrowLeft size={16} /> Retour au Sport Bingo</Link>

        <div className="mt-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gold-400/10 border border-gold-400/30 text-gold-400"><Trophy size={24} /></div>
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-black uppercase tracking-tight text-bone-50 leading-none">Résultats</h1>
            <p className="mt-1 text-sm text-bone-400">Les éditions terminées et leurs meilleurs scores.</p>
          </div>
        </div>

        {editions === null ? (
          <div className="mt-8 space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />)}</div>
        ) : editions.length === 0 ? (
          <GlassCard className="mt-8 p-12 text-center">
            <Trophy className="mx-auto text-bone-600" size={40} />
            <p className="mt-4 text-sm text-bone-400">Aucune édition terminée pour le moment.</p>
            <Link to="/tombola/sport-bingo" className="mt-5 inline-flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-sm font-black uppercase tracking-wide text-ink-900 hover:bg-emerald-400 transition"><Grid3x3 size={15} /> Jouer une édition</Link>
          </GlassCard>
        ) : (
          <div className="mt-8 space-y-4">
            {editions.map((ed) => <ResultCard key={ed.id} ed={ed} myCard={myByEd[ed.id]} />)}
          </div>
        )}
      </Container>
    </div>
  );
}

function ResultCard({ ed, myCard }) {
  const comp = compFor(ed.slug, ed.title);
  const subtitle = ed.theme?.subtitle || ed.badge || '';
  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="grid md:grid-cols-[220px_1fr]">
        {/* Visuel */}
        <div className="relative h-36 md:h-full min-h-[140px] overflow-hidden">
          {ed.cover_url
            ? <img src={ed.cover_url} alt="" className="absolute inset-0 h-full w-full object-cover" />
            : <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 50% 30%, ${comp.glow}55, #0a0e14 72%)` }} />}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-ink-950 via-ink-950/40 to-transparent" />
          <span className="absolute top-3 left-3 rounded-md bg-white/15 px-2 py-1 text-[9px] font-black uppercase tracking-widest text-bone-100">Terminé</span>
        </div>

        {/* Infos + podium */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-display text-xl font-black uppercase text-bone-50">{ed.title}</h3>
              {subtitle && <p className="text-xs text-bone-400">{comp.emoji} {subtitle}</p>}
              <p className="mt-1 text-[11px] text-bone-500">{fmtDate(ed.ends_at)}</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="inline-flex items-center gap-1 text-bone-300"><Users size={13} className="text-bone-500" /> {ed.participants} joueur{ed.participants > 1 ? 's' : ''}</span>
              <span className="inline-flex items-center gap-1 text-bone-300"><Star size={13} className="text-gold-400" /> {ed.maxPoints} pts max</span>
              <span className="inline-flex items-center gap-1 text-bone-300"><Grid3x3 size={13} className="text-emerald-400" /> {FMT[ed.format] || '5×5'} · {MATCHES[ed.format] || 24}</span>
            </div>
          </div>

          {ed.top?.length > 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {ed.top.map((t) => {
                const Icon = t.rank === 1 ? Crown : Medal;
                const color = t.rank === 1 ? 'text-gold-400' : t.rank === 2 ? 'text-bone-300' : 'text-amber-600';
                return (
                  <div key={t.rank} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <Icon size={16} className={color} />
                    <div className="h-7 w-7 shrink-0 rounded-full bg-white/10 overflow-hidden grid place-items-center">
                      {t.avatar ? <img src={t.avatar} alt="" className="h-full w-full object-cover" /> : <span className="text-[10px] font-black text-bone-400">{(t.name || '?').charAt(0).toUpperCase()}</span>}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-bone-100 truncate">{t.name}</p>
                      <p className="text-[10px] text-emerald-400 font-black">{t.points} pts</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="mt-4 text-xs text-bone-500">Aucun score enregistré pour cette édition.</p>
          )}

          {/* Ton résultat (si tu as participé) */}
          {myCard && (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.06] px-4 py-2.5">
              <div className="flex items-center gap-2 min-w-0">
                <Star size={14} className="text-gold-400 shrink-0" />
                <span className="text-xs font-bold text-bone-200">Ton résultat :</span>
                {myCard.status === 'scored'
                  ? <span className="text-sm font-black text-emerald-400">{myCard.points_total} pts{myCard.rank ? ` · #${myCard.rank}/${myCard.participants}` : ''}</span>
                  : <span className="text-xs text-bone-400">En attente de notation</span>}
              </div>
              <Link to={`/bingo/${ed.slug}`} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 shrink-0">Voir ma grille</Link>
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
