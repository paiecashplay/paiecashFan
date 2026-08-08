import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket, ShoppingBag, History, Gift, Gamepad2, Scale, Users, BarChart3, Heart,
  User, Lock, Settings, Wallet, KeyRound, ArrowRight, Camera, Loader2, Check, Trash2,
  Link2, Unlink, LogOut, Trophy, ChevronRight, Bell, Globe, UserPlus, Share2, Copy, Search, Send, X,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { useImageUpload } from '@/hooks/useImageUpload';
import { MesGains } from '@/components/account/MesGains';
import { MaModeration } from '@/components/fanclub/MaModeration';
import { OrderCard, TicketModal, PccHistory, BingoCards, FavoriteClubs } from '@/pages/MonCompte';
import { FanCard, FanPageHeader, FanSectionTitle, FanEmpty, FanError, FanRowsSkeleton } from '@/components/fan/ui';

const fmt = (n) => Number(n || 0).toLocaleString('fr-FR');

// ══ Mes billets & commandes ══════════════════════════════════
export function FanCommandes() {
  const { profile, user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [err, setErr] = useState(false);
  const [filter, setFilter] = useState('all');
  const [ticket, setTicket] = useState(null);

  function load() {
    setErr(false); setOrders(null);
    apiFetch('/api/v2/me/orders').then((j) => setOrders(j.data?.orders || [])).catch(() => { setErr(true); setOrders([]); });
  }
  useEffect(() => { load(); }, []);

  const list = (orders || []).filter((o) =>
    filter === 'all' ? true : filter === 'tickets' ? o.kind === 'ticketing' : o.kind !== 'ticketing');

  return (
    <div>
      <FanPageHeader icon={Ticket} title="Mes billets & commandes" subtitle="Tes achats boutique et billetterie." />
      <FanFilters value={filter} onChange={setFilter} options={[['all', 'Tout'], ['orders', 'Commandes'], ['tickets', 'Billets']]} />
      <div className="mt-5">
        {orders === null ? <FanRowsSkeleton rows={3} />
          : err ? <FanCard className="p-6"><FanError onRetry={load} /></FanCard>
          : list.length === 0 ? (
            <FanCard><FanEmpty icon={Ticket} title="Tu n'as encore aucune commande." hint="Découvre la boutique et la billetterie de tes clubs." action="Voir la billetterie" actionTo="/billetterie" /></FanCard>
          ) : (
            <div className="space-y-3">
              {list.map((o) => <OrderCard key={o.id} order={o} onViewTicket={() => setTicket(o)} />)}
            </div>
          )}
      </div>
      {ticket && <TicketModal order={ticket} buyer={profile?.display_name || user?.email} onClose={() => setTicket(null)} />}
    </div>
  );
}

// ══ Historique PCC ═══════════════════════════════════════════
export function FanPccPage() {
  const [history, setHistory] = useState(null);
  const [pcc, setPcc] = useState(null);
  const [err, setErr] = useState(false);

  function load() {
    setErr(false); setHistory(null);
    apiFetch('/api/v2/me/pcc-history').then((j) => setHistory(j.data?.transactions || [])).catch(() => { setErr(true); setHistory([]); });
    apiFetch('/api/v2/me/pcc').then((j) => setPcc(j.data)).catch(() => setPcc(null));
  }
  useEffect(() => { load(); }, []);

  return (
    <div>
      <FanPageHeader icon={History} title="Historique PCC" subtitle="Tes paiements et transactions PaieCashCoin.">
        <div className="pcc-gold-card px-5 py-3 text-right">
          <div className="relative z-[1]">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gold-400/80">Solde disponible</p>
            <p className="font-display text-xl font-black tabular-nums text-[#fde68a] [text-shadow:0_0_14px_rgba(251,191,36,0.3)]">{pcc?.walletReady && pcc?.balance != null ? `${fmt(pcc.balance)} PCC` : '—'}</p>
          </div>
        </div>
      </FanPageHeader>
      {history === null ? <FanRowsSkeleton rows={4} />
        : err ? <FanCard className="p-6"><FanError onRetry={load} /></FanCard>
        : <PccHistory loading={false} transactions={history} />}
    </div>
  );
}

// ══ Mes gains ════════════════════════════════════════════════
export function FanGainsPage() {
  return (
    <div>
      <FanPageHeader icon={Gift} title="Mes gains" subtitle="Tes lots gagnés et leur suivi de remise." />
      <MesGains />
    </div>
  );
}

// ══ Activités & défis (Sport Bingo) ══════════════════════════
export function FanActivitesPage() {
  const [cards, setCards] = useState(null);
  const [err, setErr] = useState(false);
  function load() { setErr(false); setCards(null); apiFetch('/api/v2/bingo/me/cards').then((j) => setCards(j.data?.cards || [])).catch(() => { setErr(true); setCards([]); }); }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <FanPageHeader icon={Gamepad2} title="Activités & défis" subtitle="Tes grilles Sport Bingo et jeux.">
        <Link to="/tombola/sport-bingo"><Button variant="primary" size="sm"><Gamepad2 size={14} /> Jouer</Button></Link>
      </FanPageHeader>
      {err ? <FanCard className="p-6"><FanError onRetry={load} /></FanCard> : <BingoCards loading={cards === null} cards={cards || []} />}
    </div>
  );
}

// ══ Ma modération ════════════════════════════════════════════
export function FanModerationPage() {
  return (
    <div>
      <FanPageHeader icon={Scale} title="Ma modération" subtitle="Tes contenus modérés, sanctions et recours." />
      <MaModeration />
    </div>
  );
}

// ══ Mes clubs / Favoris ══════════════════════════════════════
export function FanClubsPage() {
  return (
    <div>
      <FanPageHeader icon={Heart} title="Mes clubs" subtitle="Les clubs que tu suis. Définis ton club principal.">
        <Link to="/fan-club"><Button variant="outline" size="sm">Découvrir les clubs</Button></Link>
      </FanPageHeader>
      <div className="max-w-4xl"><FavoriteClubs /></div>
    </div>
  );
}

// ══ Mes amis — inviter (externe + interne) + liste ═══════════
export function FanAmisPage() {
  const [friends, setFriends] = useState(null);
  const [requests, setRequests] = useState(null);
  const [copied, setCopied] = useState(false);
  const [q, setQ] = useState('');
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [sent, setSent] = useState({}); // userId -> 'sent' | 'pending' | 'error'
  const [reqBusy, setReqBusy] = useState({});

  const inviteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://paiecashfan.com';
  const inviteMsg = `Rejoins-moi sur PaieCashFan pour suivre nos clubs et jouer au Sport Bingo ! ${inviteUrl}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(inviteMsg)}`;
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  function loadFriends() {
    setFriends(null);
    apiFetch('/api/v2/me/friends').then((j) => setFriends(j.data?.friends || [])).catch(() => setFriends([]));
  }
  function loadRequests() {
    apiFetch('/api/v2/me/friends/requests').then((j) => setRequests(j.data?.requests || [])).catch(() => setRequests([]));
  }
  useEffect(() => { loadFriends(); loadRequests(); }, []);

  async function copyLink() {
    try { await navigator.clipboard.writeText(inviteUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* noop */ }
  }
  function shareNative() {
    if (navigator.share) navigator.share({ title: 'PaieCashFan', text: inviteMsg, url: inviteUrl }).catch(() => {});
  }
  async function search(e) {
    e?.preventDefault();
    if (q.trim().length < 2) { setResults(null); return; }
    setSearching(true);
    try { const j = await apiFetch(`/api/v2/me/search-users?q=${encodeURIComponent(q.trim())}`); setResults(j.data?.users || []); }
    catch { setResults([]); }
    finally { setSearching(false); }
  }
  async function addFriend(id) {
    try { await apiFetch('/api/v2/me/friends/request', { method: 'POST', body: JSON.stringify({ receiverId: id }) }); setSent((s) => ({ ...s, [id]: 'sent' })); }
    catch (e) { setSent((s) => ({ ...s, [id]: e?.status === 409 ? 'pending' : 'error' })); }
  }
  async function respond(requestId, action) {
    setReqBusy((b) => ({ ...b, [requestId]: true }));
    try {
      await apiFetch(`/api/v2/me/friends/request/${requestId}`, { method: 'PATCH', body: JSON.stringify({ action }) });
      setRequests((r) => (r || []).filter((x) => x.id !== requestId));
      if (action === 'accept') loadFriends();
    } catch { /* noop */ }
    finally { setReqBusy((b) => ({ ...b, [requestId]: false })); }
  }

  return (
    <div className="max-w-4xl">
      <FanPageHeader icon={Users} title="Mes amis" subtitle="Invite tes amis et retrouve tes connexions." />

      {/* ── Inviter (externe) ── */}
      <FanCard className="p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-400"><UserPlus size={20} /></span>
          <div>
            <h2 className="text-base font-bold text-white">Inviter des amis</h2>
            <p className="text-[13px] text-white/50">Partage l'app pour jouer ensemble, ou ajoute un supporter déjà inscrit ci-dessous.</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <a href={waHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-bold text-[#04240f] transition hover:brightness-110">
            <WhatsAppIcon /> Partager sur WhatsApp
          </a>
          <button onClick={copyLink} className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]">
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />} {copied ? 'Lien copié !' : 'Copier le lien'}
          </button>
          {canShare && (
            <button onClick={shareNative} className="inline-flex items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/[0.08]">
              <Share2 size={16} /> Partager…
            </button>
          )}
        </div>
      </FanCard>

      {/* ── Demandes reçues ── */}
      {requests && requests.length > 0 && (
        <FanCard className="mt-5 p-6">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">Demandes reçues</h2>
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black text-emerald-400">{requests.length}</span>
          </div>
          <div className="mt-3 space-y-2">
            {requests.map((r) => {
              const nm = r.user.display_name || 'Supporter';
              return (
                <div key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                  <Avatar url={r.user.avatar_url} name={nm} size="h-9 w-9" rounded="rounded-lg" />
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{nm}</p>
                  <button onClick={() => respond(r.id, 'accept')} disabled={reqBusy[r.id]} className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-ink-950 transition hover:bg-emerald-400 disabled:opacity-50">
                    <Check size={13} /> Accepter
                  </button>
                  <button onClick={() => respond(r.id, 'decline')} disabled={reqBusy[r.id]} className="inline-flex items-center gap-1.5 rounded-lg border border-white/12 px-3 py-1.5 text-xs font-bold text-white/60 transition hover:text-red-300 disabled:opacity-50">
                    <X size={13} /> Décliner
                  </button>
                </div>
              );
            })}
          </div>
        </FanCard>
      )}

      {/* ── Ajouter un ami inscrit (interne) ── */}
      <FanCard className="mt-5 p-6">
        <h2 className="text-sm font-bold text-white">Ajouter un ami déjà inscrit</h2>
        <p className="mt-1 text-[12px] text-white/45">Recherche un supporter par son nom et envoie-lui une invitation.</p>
        <form onSubmit={search} className="mt-3 flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/35" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Nom d'utilisateur…" aria-label="Rechercher un supporter"
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 text-sm text-white outline-none focus:border-emerald-500/50" />
          </div>
          <Button variant="primary" size="md" type="submit" disabled={searching || q.trim().length < 2}>
            {searching ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />} Rechercher
          </Button>
        </form>
        {results !== null && (
          results.length === 0 ? (
            <p className="mt-4 text-sm text-white/45">Aucun supporter trouvé pour « {q} ».</p>
          ) : (
            <div className="mt-4 space-y-2">
              {results.map((u) => {
                const nm = u.username || u.display_name || u.name || 'Supporter';
                const st = sent[u.id];
                return (
                  <div key={u.id} className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
                    <Avatar url={u.avatar_url} name={nm} size="h-9 w-9" rounded="rounded-lg" />
                    <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{nm}</p>
                    {st === 'sent' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400"><Check size={13} /> Invitation envoyée</span>
                    ) : st === 'pending' ? (
                      <span className="text-[11px] font-bold text-amber-400">Déjà invité</span>
                    ) : st === 'error' ? (
                      <button onClick={() => addFriend(u.id)} className="text-[11px] font-bold text-white/50 transition hover:text-emerald-400">Réessayer</button>
                    ) : (
                      <button onClick={() => addFriend(u.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400 transition hover:bg-emerald-500/20">
                        <Send size={13} /> Inviter
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )
        )}
      </FanCard>

      {/* ── Liste d'amis ── */}
      <div className="mt-6">
        <FanSectionTitle>Mes amis</FanSectionTitle>
        <div className="mt-3">
          {friends === null ? <FanRowsSkeleton rows={2} />
            : friends.length === 0 ? (
              <FanCard><FanEmpty icon={Users} title="Pas encore d'amis" hint="Invite tes amis avec les boutons ci-dessus." /></FanCard>
            ) : (
              <FanCard className="divide-y divide-white/[0.05] overflow-hidden">
                {friends.map((fr) => {
                  const nm = fr.display_name || fr.name || fr.username || 'Supporter';
                  return (
                    <div key={fr.id || nm} className="flex items-center gap-3 px-5 py-3.5">
                      <Avatar url={fr.avatar_url} name={nm} size="h-10 w-10" rounded="rounded-xl" />
                      <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{nm}</p>
                      {fr.status && <span className="text-[11px] text-white/40">{fr.status}</span>}
                    </div>
                  );
                })}
              </FanCard>
            )}
        </div>
      </div>
    </div>
  );
}

// ══ Classements (Sport Bingo leaderboard, réel) ══════════════
export function FanClassementsPage() {
  const [rows, setRows] = useState(null);
  const [err, setErr] = useState(false);
  function load() {
    setErr(false); setRows(null);
    apiFetch('/api/v2/bingo/leaderboard').then((j) => setRows(j.data?.leaderboard || j.data?.entries || j.data || [])).catch(() => { setErr(true); setRows([]); });
  }
  useEffect(() => { load(); }, []);
  return (
    <div>
      <FanPageHeader icon={BarChart3} title="Classements" subtitle="Le classement Sport Bingo de la communauté." />
      {rows === null ? <FanRowsSkeleton rows={5} />
        : err ? <FanCard className="p-6"><FanError onRetry={load} /></FanCard>
        : rows.length === 0 ? (
          <FanCard><FanEmpty icon={Trophy} title="Aucun classement pour le moment" hint="Joue au Sport Bingo pour apparaître au classement." action="Jouer" actionTo="/tombola/sport-bingo" /></FanCard>
        ) : (
          <FanCard className="divide-y divide-white/[0.05] overflow-hidden">
            {rows.slice(0, 50).map((r, i) => {
              const rank = r.rank || i + 1;
              return (
                <div key={r.userId || i} className="flex items-center gap-3 px-5 py-3">
                  <span className={cn('grid h-8 w-8 shrink-0 place-items-center rounded-lg font-display text-sm font-black tabular-nums',
                    rank === 1 ? 'bg-gold-400/15 text-gold-400' : rank <= 3 ? 'bg-white/[0.06] text-white' : 'text-white/40')}>{rank}</span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500 to-cyan-400 text-xs font-black text-white">
                    {r.avatar ? <img src={r.avatar} alt="" className="h-full w-full object-cover" /> : (r.name || '?')[0].toUpperCase()}
                  </span>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{r.name || 'Supporter'}</p>
                  {r.bingos != null && <span className="text-[11px] text-white/40">{r.bingos} BINGO</span>}
                  <span className="font-display text-base font-black tabular-nums text-emerald-400">{fmt(r.points)} pts</span>
                </div>
              );
            })}
          </FanCard>
        )}
    </div>
  );
}

// ══ Profil & préférences ═════════════════════════════════════
export function FanProfilPage() {
  const { user, profile, updateProfile, getIdentities, linkGoogle, unlinkGoogle } = useAuth();
  const { uploadImage, uploading } = useImageUpload();
  const fileRef = useRef(null);
  const [name, setName] = useState(profile?.display_name || '');
  const [savingName, setSavingName] = useState(false);
  const [msg, setMsg] = useState('');
  const [identities, setIdentities] = useState(null);
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkErr, setLinkErr] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    getIdentities().then(setIdentities).catch(() => setIdentities([]));
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const initial = (profile?.display_name || user?.email || 'F')[0].toUpperCase();
  const googleLinked = Array.isArray(identities) && identities.some((i) => i.provider === 'google');
  const canUnlink = Array.isArray(identities) && identities.length > 1;

  async function onPickAvatar(e) {
    const file = e.target.files?.[0]; e.target.value = '';
    if (!file) return;
    try { const url = await uploadImage(file, 'avatars'); if (url) { await updateProfile({ avatar_url: url }); setMsg('Photo mise à jour.'); } } catch (err) { setMsg(err.message || 'Échec.'); }
  }
  async function saveName() {
    setSavingName(true); setMsg('');
    try { await updateProfile({ display_name: name.trim() }); setMsg('Profil enregistré.'); } catch (err) { setMsg(err.message || 'Erreur.'); } finally { setSavingName(false); }
  }
  async function link() {
    setLinkBusy(true); setLinkErr('');
    try { await linkGoogle(`${window.location.origin}/mon-compte/profil`); } catch (err) { setLinkErr(/manual linking.*disabl|not enabled/i.test(err?.message || '') ? 'Le linking manuel doit être activé dans Supabase.' : (err?.message || 'Impossible de lier Google.')); setLinkBusy(false); }
  }
  async function unlink() {
    setLinkBusy(true); setLinkErr('');
    try { await unlinkGoogle(); setIdentities(await getIdentities()); } catch (err) { setLinkErr(err?.message || 'Impossible de délier.'); } finally { setLinkBusy(false); }
  }

  return (
    <div className="max-w-3xl">
      <FanPageHeader icon={User} title="Profil & préférences" subtitle="Gère ton identité de supporter." />

      <FanCard className="p-6">
        <h2 className="text-sm font-bold text-white">Photo de profil</h2>
        <div className="mt-4 flex items-center gap-5">
          <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-400 text-2xl font-black text-white">
            {profile?.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initial}
          </span>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
            <Button variant="primary" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />} {profile?.avatar_url ? 'Changer' : 'Ajouter'}
            </Button>
            <p className="mt-2 text-[11px] text-white/40">JPG, PNG ou WebP — max 5 Mo.</p>
          </div>
        </div>
      </FanCard>

      <FanCard className="mt-5 p-6">
        <h2 className="text-sm font-bold text-white">Informations personnelles</h2>
        <div className="mt-4 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/70">Nom affiché</label>
            <div className="flex gap-2">
              <input value={name} onChange={(e) => setName(e.target.value)} className="h-11 flex-1 rounded-xl border border-white/[0.1] bg-white/[0.03] px-3 text-sm text-white outline-none focus:border-emerald-500/50" placeholder="Ton nom" />
              <Button variant="primary" size="md" onClick={saveName} disabled={savingName || !name.trim()}>{savingName ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Enregistrer</Button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/70">Email</label>
            <p className="text-sm text-white/80">{user?.email}</p>
          </div>
          {msg && <p className="text-xs text-emerald-400">{msg}</p>}
        </div>
      </FanCard>

      {/* Comptes connectés */}
      <FanCard className="mt-5 p-6">
        <h2 className="text-sm font-bold text-white">Comptes connectés</h2>
        <p className="mt-1 text-[12px] text-white/45">Connecte-toi aussi avec Google, en plus de ton email.</p>
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
          <div className="flex items-center gap-3">
            <GoogleG />
            <div>
              <p className="text-sm font-semibold text-white">Google</p>
              <p className="text-[11px] text-white/45">{identities === null ? 'Chargement…' : googleLinked ? 'Lié à ton compte' : 'Non lié'}</p>
            </div>
          </div>
          {identities !== null && (googleLinked ? (
            canUnlink ? (
              <button onClick={unlink} disabled={linkBusy} className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 hover:bg-red-500/20 disabled:opacity-50">
                {linkBusy ? <Loader2 size={13} className="animate-spin" /> : <Unlink size={13} />} Délier
              </button>
            ) : <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400"><Check size={13} /> Lié</span>
          ) : (
            <Button variant="primary" size="sm" onClick={link} disabled={linkBusy}>{linkBusy ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />} Lier Google</Button>
          ))}
        </div>
        {linkErr && <p className="mt-3 text-xs text-red-400">{linkErr}</p>}
      </FanCard>
    </div>
  );
}

// ══ Sécurité ═════════════════════════════════════════════════
export function FanSecuritePage() {
  const { signOut } = useAuth();
  return (
    <div className="max-w-3xl">
      <FanPageHeader icon={Lock} title="Sécurité" subtitle="Protège l'accès à ton compte." />
      <FanCard className="p-6">
        <h2 className="text-sm font-bold text-white">Mot de passe</h2>
        <Link to="/reset-password" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.03] px-4 py-3 text-sm text-white/80 transition hover:border-emerald-500/40">
          <KeyRound size={15} className="text-emerald-400" /> Changer mon mot de passe <ArrowRight size={14} className="text-white/40" />
        </Link>
      </FanCard>
      <FanCard className="mt-5 p-6">
        <h2 className="text-sm font-bold text-white">Session</h2>
        <button onClick={signOut} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.06] px-4 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-500/10">
          <LogOut size={15} /> Me déconnecter
        </button>
      </FanCard>
    </div>
  );
}

// ══ Paramètres (préférences — placeholders honnêtes) ═════════
export function FanParametresPage() {
  return (
    <div className="max-w-3xl">
      <FanPageHeader icon={Settings} title="Paramètres" subtitle="Tes préférences PaieCashFan." />
      <FanCard className="p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-emerald-400"><Bell size={18} /></span>
          <div>
            <p className="text-sm font-bold text-white">Notifications</p>
            <p className="text-[12px] text-white/45">Gère tes alertes (lives, tombolas, gains) — bientôt configurable ici.</p>
          </div>
        </div>
      </FanCard>
      <FanCard className="mt-5 p-6">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/[0.04] text-emerald-400"><Globe size={18} /></span>
          <div>
            <p className="text-sm font-bold text-white">Langue</p>
            <p className="text-[12px] text-white/45">Français — d'autres langues arriveront prochainement.</p>
          </div>
        </div>
      </FanCard>
    </div>
  );
}

// ── util ──────────────────────────────────────────────────────
function FanFilters({ value, onChange, options }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(([val, label]) => (
        <button key={val} onClick={() => onChange(val)} className={cn(
          'h-9 rounded-full border px-4 text-xs font-bold transition-colors',
          value === val ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-400' : 'border-white/10 bg-white/[0.03] text-white/50 hover:text-white',
        )}>{label}</button>
      ))}
    </div>
  );
}

// Avatar robuste : initiale en fond + image par-dessus (masquée si elle échoue,
// avec referrerPolicy no-referrer pour les avatars Google).
function Avatar({ url, name, size = 'h-9 w-9', rounded = 'rounded-lg' }) {
  const initial = (name || '?')[0].toUpperCase();
  return (
    <span className={cn('relative grid shrink-0 place-items-center overflow-hidden bg-gradient-to-br from-emerald-500 to-cyan-400 text-xs font-black text-white', size, rounded)}>
      {initial}
      {url && (
        <img src={url} alt="" referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.display = 'none'; }} className="absolute inset-0 h-full w-full object-cover" />
      )}
    </span>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 32 32" fill="currentColor" aria-hidden>
      <path d="M16.004 3C9.383 3 4 8.383 4 15.004c0 2.115.553 4.18 1.605 6.004L4 29l8.184-1.57a11.94 11.94 0 0 0 3.82.63h.001C22.621 28.06 28 22.677 28 16.056 28 9.435 22.625 3 16.004 3zm0 21.86h-.001a9.9 9.9 0 0 1-3.79-.75l-.271-.114-4.86.93.93-4.73-.177-.28a9.86 9.86 0 0 1-1.51-5.256c0-5.47 4.457-9.92 9.94-9.92 2.653 0 5.146 1.036 7.02 2.915a9.86 9.86 0 0 1 2.91 7.02c0 5.47-4.457 9.916-9.94 9.916zm5.45-7.43c-.298-.15-1.766-.872-2.04-.97-.274-.1-.474-.15-.673.15-.198.297-.772.97-.947 1.17-.174.198-.348.223-.646.074-.298-.15-1.26-.464-2.4-1.48-.887-.79-1.487-1.766-1.66-2.064-.174-.297-.019-.458.13-.606.134-.133.298-.347.446-.52.15-.174.198-.298.298-.497.099-.198.05-.372-.025-.52-.074-.15-.672-1.62-.92-2.22-.243-.583-.49-.504-.672-.513l-.573-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.48 1.065 2.876 1.213 3.075c.15.198 2.096 3.2 5.077 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.766-.722 2.015-1.42.248-.697.248-1.294.174-1.42-.074-.124-.272-.198-.57-.347z"/>
    </svg>
  );
}

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden className="shrink-0">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}
