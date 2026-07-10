import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera, Check, Loader2, User, Mail, KeyRound, ArrowRight, Trash2, ShieldCheck
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useImageUpload } from '@/hooks/useImageUpload';

const MAX_AVATAR_MB = 5;

export function Parametres() {
  const { user, profile, updateProfile } = useAuth();
  const { uploadImage, uploading } = useImageUpload();
  const fileRef = useRef(null);

  const [name, setName] = useState(profile?.display_name || '');
  const [savingName, setSavingName] = useState(false);
  const [nameMsg, setNameMsg] = useState('');
  const [avatarMsg, setAvatarMsg] = useState('');
  const [avatarErr, setAvatarErr] = useState('');

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
