import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, Check, Loader2, User, Mail, KeyRound, ArrowRight, Trash2, ShieldCheck, Link2, Unlink
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';

const MAX_AVATAR_MB = 5;

export function Parametres() {
  const { user, profile, updateProfile, getIdentities, linkGoogle, unlinkGoogle } = useAuth();
  const { uploadImage, uploading } = useImageUpload();
  const fileRef = useRef(null);

  const [name, setName] = useState(profile?.display_name || '');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState('');
  const [avatarMsg, setAvatarMsg] = useState('');
  const [avatarErr, setAvatarErr] = useState('');

  // Comptes connectés (linking Google)
  const [identities, setIdentities] = useState(null); // null = en cours de chargement
  const [linkBusy, setLinkBusy] = useState(false);
  const [linkMsg, setLinkMsg] = useState('');
  const [linkErr, setLinkErr] = useState('');

  useEffect(() => {
    if (!user?.id) return undefined;
    let alive = true;
    getIdentities()
      .then((ids) => { if (alive) setIdentities(ids); })
      .catch(() => { if (alive) setIdentities([]); });
    return () => { alive = false; };
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const googleLinked = Array.isArray(identities) && identities.some((i) => i.provider === 'google');
  const canUnlink = Array.isArray(identities) && identities.length > 1;

  async function handleLinkGoogle() {
    setLinkBusy(true); setLinkErr(''); setLinkMsg('');
    try {
      await linkGoogle(); // redirige vers Google puis revient sur /parametres
    } catch (err) {
      const m = err?.message || '';
      setLinkErr(/manual linking.*disabl|not enabled/i.test(m)
        ? 'Le linking manuel doit être activé dans Supabase (Authentication → Sign In / Providers).'
        : (m || 'Impossible de lier Google.'));
      setLinkBusy(false);
    }
  }

  async function handleUnlinkGoogle() {
    setLinkBusy(true); setLinkErr(''); setLinkMsg('');
    try {
      await unlinkGoogle();
      setIdentities(await getIdentities());
      setLinkMsg('Compte Google délié.');
    } catch (err) {
      setLinkErr(err?.message || 'Impossible de délier Google.');
    } finally {
      setLinkBusy(false);
    }
  }

  const initial = (profile?.display_name || user?.email || 'F')[0].toUpperCase();

  async function onPickAvatar(e) {
    const file = e.target.files?.[0];
    e.target.value = ''; // permet de re-choisir le même fichier
    if (!file) return;
    setAvatarErr(''); setAvatarMsg('');

    if (!file.type.startsWith('image/')) { setAvatarErr('Choisis un fichier image.'); return; }
    if (file.size > MAX_AVATAR_MB * 1024 * 1024) { setAvatarErr(`Image trop lourde (max ${MAX_AVATAR_MB} Mo).`); return; }

    try {
      const url = await uploadImage(file, 'avatars');
      if (!url) throw new Error('Upload échoué');
      await updateProfile({ avatar_url: url });
      setAvatarMsg('Photo mise à jour.');
    } catch (err) {
      setAvatarErr(err.message || "Échec de l'upload.");
    }
  }

  async function removeAvatar() {
    setAvatarErr(''); setAvatarMsg('');
    try {
      await updateProfile({ avatar_url: null });
      setAvatarMsg('Photo retirée.');
    } catch (err) {
      setAvatarErr(err.message || 'Échec.');
    }
  }

  async function saveName() {
    setSavingName(true); setNameMsg('');
    try {
      await updateProfile({ display_name: name.trim() });
      setNameMsg('Nom enregistré.');
    } catch (err) {
      setNameMsg(err.message || 'Erreur.');
    } finally {
      setSavingName(false);
    }
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(16,185,129,0.12),transparent_40%)]" />

      <Container className="relative py-12 md:py-16 max-w-3xl">
        <h1 className="font-display text-3xl md:text-4xl font-black uppercase text-bone-50">Paramètres</h1>
        <p className="mt-2 text-sm text-bone-400">Gère ta photo, ton profil et la sécurité de ton compte.</p>

        {/* ── Photo de profil ─────────────────────────────── */}
        <GlassCard className="mt-8 p-6">
          <h2 className="font-display text-sm font-black uppercase tracking-wider text-bone-100">Photo de profil</h2>
          <div className="mt-5 flex items-center gap-6">
            <div className="relative">
              <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-cyan-400 text-3xl font-black text-white">
                {profile?.avatar_url
                  ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
                  : initial}
              </div>
              {uploading && (
                <div className="absolute inset-0 grid place-items-center rounded-3xl bg-black/50">
                  <Loader2 className="animate-spin text-white" size={22} />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPickAvatar} />
              <Button variant="primary" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
                <Camera size={14} /> {profile?.avatar_url ? 'Changer la photo' : 'Ajouter une photo'}
              </Button>
              {profile?.avatar_url && (
                <button
                  onClick={removeAvatar}
                  disabled={uploading}
                  className="ml-3 inline-flex items-center gap-1.5 text-xs font-bold text-bone-400 hover:text-red-400 transition disabled:opacity-50"
                >
                  <Trash2 size={13} /> Retirer
                </button>
              )}
              <p className="text-[11px] text-bone-500">JPG, PNG ou WebP — max {MAX_AVATAR_MB} Mo.</p>
            </div>
          </div>
          {avatarMsg && <p className="mt-3 text-xs text-emerald-400">{avatarMsg}</p>}
          {avatarErr && <p className="mt-3 text-xs text-red-400">{avatarErr}</p>}
        </GlassCard>

        {/* ── Profil ──────────────────────────────────────── */}
        <GlassCard className="mt-6 p-6">
          <h2 className="font-display text-sm font-black uppercase tracking-wider text-bone-100">Profil</h2>

          <div className="mt-5 space-y-5">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-bone-500 font-bold">
                <User size={12} /> Nom affiché
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1 h-11 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-sm text-bone-100 outline-none focus:border-emerald-400/60"
                  placeholder="Ton nom"
                />
                <Button variant="primary" size="md" onClick={saveName} disabled={savingName || !name.trim()}>
                  {savingName ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} Enregistrer
                </Button>
              </div>
              {nameMsg && <p className="mt-2 text-xs text-emerald-400">{nameMsg}</p>}
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-bone-500 font-bold">
                <Mail size={12} /> Email
              </label>
              <div className="mt-2 flex items-center gap-3">
                <p className="text-sm text-bone-200">{user?.email}</p>
                <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-bone-500">
                  <ShieldCheck size={11} /> Vérifié
                </span>
              </div>
              <p className="mt-1 text-[11px] text-bone-500">Pour changer d'email, contacte le support.</p>
            </div>
          </div>
        </GlassCard>

        {/* ── Comptes connectés ───────────────────────────── */}
        <GlassCard className="mt-6 p-6">
          <h2 className="font-display text-sm font-black uppercase tracking-wider text-bone-100">Comptes connectés</h2>
          <p className="mt-1 text-[11px] text-bone-500">Connecte-toi aussi avec Google, en plus de ton email et ton mot de passe.</p>

          <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <div className="flex items-center gap-3">
              <GoogleIcon />
              <div>
                <p className="text-sm font-semibold text-bone-100">Google</p>
                <p className="text-[11px] text-bone-500">
                  {identities === null ? 'Chargement…' : googleLinked ? 'Lié à ton compte' : 'Non lié'}
                </p>
              </div>
            </div>

            {identities !== null && (
              googleLinked ? (
                canUnlink ? (
                  <button
                    onClick={handleUnlinkGoogle}
                    disabled={linkBusy}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-300 transition hover:bg-red-500/20 disabled:opacity-50"
                  >
                    {linkBusy ? <Loader2 size={13} className="animate-spin" /> : <Unlink size={13} />} Délier
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-400">
                    <Check size={13} /> Lié
                  </span>
                )
              ) : (
                <Button variant="primary" size="sm" onClick={handleLinkGoogle} disabled={linkBusy}>
                  {linkBusy ? <Loader2 size={14} className="animate-spin" /> : <Link2 size={14} />} Lier Google
                </Button>
              )
            )}
          </div>

          {linkMsg && <p className="mt-3 text-xs text-emerald-400">{linkMsg}</p>}
          {linkErr && <p className="mt-3 text-xs text-red-400">{linkErr}</p>}
        </GlassCard>

        {/* ── Sécurité ────────────────────────────────────── */}
        <GlassCard className="mt-6 p-6">
          <h2 className="font-display text-sm font-black uppercase tracking-wider text-bone-100">Sécurité</h2>
          <Link
            to="/reset-password"
            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-bone-200 hover:border-emerald-400/40 transition"
          >
            <KeyRound size={15} className="text-emerald-400" />
            Changer mon mot de passe
            <ArrowRight size={14} className="text-bone-500" />
          </Link>
        </GlassCard>

        <div className="mt-8 text-center">
          <Link to="/mon-compte" className="text-xs uppercase tracking-[0.18em] font-black text-bone-400 hover:text-emerald-400 transition">
            ← Retour à mon compte
          </Link>
        </div>
      </Container>
    </div>
  );
}

// Icône Google (multicolore)
function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden className="shrink-0">
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}
