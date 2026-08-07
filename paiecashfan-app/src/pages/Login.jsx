import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Shield, Users, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/cn';

// Choix de rôle à l'inscription (logique conservée à l'identique).
const ROLE_OPTIONS = [
  {
    value: 'fan',
    label: 'Fan',
    description: 'Je suis un supporter qui veut suivre les clubs et acheter des produits.',
    icon: User,
  },
  {
    value: 'club_admin',
    label: 'Représentant de club',
    description: 'Je gère un club et veux accéder au back-office. Soumis à validation.',
    icon: Shield,
    badge: 'Validation requise',
  },
];

export function Login() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.next || '/';

  const params = new URLSearchParams(location.search);
  const initialTab = (location.state?.tab === 'register' || params.get('tab') === 'register') ? 'register' : 'login';
  const [tab, setTab]           = useState(initialTab);
  const [showPwd, setShowPwd]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const [form, setForm] = useState({
    email: '', password: '', displayName: '', roleRequest: 'fan'
  });

  const isLogin = tab === 'login';

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (isLogin) {
        await signIn({ email: form.email, password: form.password });
        navigate(next, { replace: true });
      } else {
        if (!form.displayName.trim()) { setError('Ton prénom est requis.'); setLoading(false); return; }
        const data = await signUp({
          email: form.email,
          password: form.password,
          displayName: form.displayName
        });

        const isClub = form.roleRequest === 'club_admin';
        if (isClub && data?.user) {
          await new Promise((r) => setTimeout(r, 800));
          await supabase
            .from('profiles')
            .update({ role_request: 'club_admin' })
            .eq('id', data.user.id);
        }

        if (data?.session) {
          navigate(isClub ? '/mon-club' : next, { replace: true });
        } else {
          setSuccess(
            isClub
              ? 'Compte créé ! Confirme ton email, puis connecte-toi pour finaliser ta demande d\'accès club.'
              : 'Compte créé ! Vérifie ton email pour confirmer ton inscription.'
          );
        }
      }
    } catch (err) {
      setError(translateError(err.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError('');
    try {
      const redirectUrl = new URL(window.location.origin);
      redirectUrl.searchParams.set('oauth_next', next);

      if (!isLogin && form.roleRequest === 'club_admin') {
        sessionStorage.setItem('google_auth_role_request', 'club_admin');
      } else {
        sessionStorage.removeItem('google_auth_role_request');
      }

      await signInWithGoogle(redirectUrl.toString());
    } catch (err) {
      sessionStorage.removeItem('google_auth_role_request');
      setError(translateError(err?.message || 'Impossible de continuer avec Google.'));
    }
  }

  function switchTab(t) { setTab(t); setError(''); setSuccess(''); }

  return (
    <div className="relative min-h-[calc(100dvh-80px)] overflow-hidden bg-[#04080d]">
      {/* Glow radial vert très discret (global) */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_35%_45%,rgba(16,185,129,0.08),transparent_45%)]" />

      {/* Fond stade (contient déjà l'arc + l'étoile) — non zoomé, calé à gauche */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
        <img src="/images/login-bg.webp" alt="" className="h-full w-full object-contain object-left" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, transparent 0%, transparent 46%, rgba(4,8,13,.55) 62%, #04080d 76%)' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, rgba(4,8,13,.5) 0%, transparent 28%)' }} />
      </div>

      {/* ══ Grille principale ══ */}
      <div className="relative mx-auto grid min-h-[calc(100dvh-80px)] max-w-[1440px] items-center gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(500px,0.9fr)] lg:gap-[60px] lg:px-14 lg:py-8">

        {/* ══════════ COLONNE GAUCHE — HERO ══════════ */}
        {/* L'arc + l'étoile font partie de l'image de fond (login-bg.webp). */}
        <section className="relative hidden text-center lg:block">
          {/* Emblème */}
          <img
            src="/paiecashfan-logo.webp"
            alt="PaieCashFan"
            className="mx-auto mb-8 h-[150px] w-[150px] object-contain drop-shadow-[0_10px_40px_rgba(16,185,129,0.25)]"
          />

          {/* Slogan (sans-serif premium, PAS la police condensée) */}
          <h2 className="mx-auto max-w-[520px] font-sans font-extrabold uppercase leading-[1.08] tracking-[-0.02em] text-white [font-size:clamp(28px,2vw,38px)]">
            Plus qu'une plateforme,<br />
            <span className="text-emerald-400">une communauté.</span>
          </h2>

          {/* Description */}
          <p className="mx-auto mt-6 max-w-[500px] text-[16px] leading-[1.5] text-white/[0.65]">
            PaieCashFan réunit tous les supporters autour de leur passion.
            Achats, jeux, fan club, événements et PaieCashCoin (PCC).
          </p>

          {/* 3 bénéfices (centrés) */}
          <div className="mx-auto mt-10 grid max-w-[560px] grid-cols-3 gap-6">
            <Benefit icon="shield" title="Sécurisé" text="Vos données sont protégées" />
            <Benefit icon="pcc" title="PCC officiel" text="La monnaie des supporters" />
            <Benefit icon="users" title="Communauté" text="Des fans comme vous" />
          </div>
        </section>

        {/* ══════════ COLONNE DROITE — AUTH PANEL ══════════ */}
        <section className="flex w-full flex-col items-center">
          {/* Branding mobile (le hero est masqué < lg) */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <img src="/paiecashfan-logo.webp" alt="" className="h-10 w-10 object-contain" aria-hidden />
            <span className="font-display text-lg font-black text-white">PaieCash<span className="text-emerald-400">Fan</span></span>
          </div>

          <div className="relative w-full max-w-[600px] overflow-hidden rounded-[28px] border border-white/[0.16] bg-[linear-gradient(145deg,rgba(12,20,27,0.92),rgba(5,10,15,0.97))] pb-8 shadow-[0_25px_80px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.03),0_0_60px_rgba(16,185,129,0.08)]">
            {/* Onglets */}
            <div className="grid grid-cols-2 border-b border-white/10" role="tablist" aria-label="Connexion ou inscription">
              {['login', 'register'].map((t) => {
                const active = tab === t;
                return (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={active}
                    onClick={() => switchTab(t)}
                    className={cn(
                      'relative flex h-[64px] items-center justify-center text-sm font-bold uppercase tracking-[0.14em] transition-colors focus-visible:outline-none',
                      active ? 'text-emerald-400' : 'text-white/45 hover:text-white/70'
                    )}
                  >
                    {t === 'login' ? 'Connexion' : 'Inscription'}
                    {active && (
                      <motion.span layoutId="auth-tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 bg-emerald-500" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Contenu */}
            <div className="px-6 pt-8 sm:px-[46px]">
              <h1 className="text-[30px] font-extrabold leading-tight text-white sm:text-[32px]">
                {isLogin ? 'Bon retour ! 👋' : 'Rejoins la communauté ⚽'}
              </h1>
              <p className="mt-2 text-[17px] text-white/[0.58]">
                {isLogin ? 'Connecte-toi à ton compte fan' : 'Crée ton compte fan PaieCashFan.'}
              </p>

              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400"
                  >
                    {success}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <AnimatePresence mode="wait">
                  {!isLogin && (
                    <motion.div
                      key="register-fields"
                      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-4 overflow-hidden"
                    >
                      <Field
                        id="displayName" label="Prénom / Pseudo" icon={<User size={18} />}
                        type="text" placeholder="Ex : Mohamed" autoComplete="nickname"
                        value={form.displayName} onChange={set('displayName')} required
                      />

                      <div>
                        <span className="mb-2.5 block text-sm font-medium text-white/[0.78]">Je m'inscris en tant que</span>
                        <div className="space-y-2.5">
                          {ROLE_OPTIONS.map(({ value, label, description, icon: Icon, badge }) => {
                            const selected = form.roleRequest === value;
                            return (
                              <button
                                key={value} type="button"
                                onClick={() => setForm((f) => ({ ...f, roleRequest: value }))}
                                aria-pressed={selected}
                                className={cn(
                                  'flex w-full items-start gap-3 rounded-2xl border p-3.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/40',
                                  selected ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                                )}
                              >
                                <span className={cn('mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl', selected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/50')}>
                                  <Icon size={16} />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="flex items-center gap-2">
                                    <span className={cn('text-sm font-bold', selected ? 'text-emerald-400' : 'text-white/90')}>{label}</span>
                                    {badge && (
                                      <span className="rounded border border-amber-500/20 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">{badge}</span>
                                    )}
                                  </span>
                                  <span className="mt-0.5 block text-[12px] leading-relaxed text-white/50">{description}</span>
                                </span>
                                {selected && <Check size={15} className="mt-1 shrink-0 text-emerald-400" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Field
                  id="email" label="Adresse e-mail" icon={<Mail size={18} />}
                  type="email" placeholder="toi@exemple.com" autoComplete="email"
                  value={form.email} onChange={set('email')} required
                />

                <div>
                  <Field
                    id="password" label="Mot de passe" icon={<Lock size={18} />}
                    type={showPwd ? 'text' : 'password'}
                    placeholder={isLogin ? '••••••••' : 'Min. 8 caractères'}
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                    value={form.password} onChange={set('password')} minLength={8} required
                    rightSlot={
                      <button
                        type="button" onClick={() => setShowPwd((v) => !v)} tabIndex={-1}
                        aria-label={showPwd ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/80"
                      >
                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    }
                  />
                  {isLogin && (
                    <div className="mt-2.5 flex justify-end">
                      <button type="button" onClick={() => handleForgotPassword(form.email)} className="text-sm font-semibold text-[#18df8a] transition-colors hover:text-emerald-300">
                        Mot de passe oublié ?
                      </button>
                    </div>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      role="alert"
                      className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* CTA principal */}
                <button
                  type="submit" disabled={loading}
                  className="relative mt-6 flex h-[58px] w-full items-center justify-center rounded-2xl bg-[linear-gradient(90deg,#10b981,#22d981)] text-[16px] font-bold text-white transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(16,185,129,0.20)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/50 disabled:opacity-60"
                >
                  {loading ? (
                    <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      {isLogin ? 'Se connecter' : 'Créer mon compte'}
                      <ArrowRight size={18} className="absolute right-6 top-1/2 -translate-y-1/2" />
                    </>
                  )}
                </button>
              </form>

              {/* Séparateur */}
              <div className="my-5 flex items-center gap-4">
                <span className="h-px flex-1 bg-white/[0.12]" />
                <span className="text-xs uppercase tracking-widest text-white/45">ou</span>
                <span className="h-px flex-1 bg-white/[0.12]" />
              </div>

              {/* Google */}
              <button
                onClick={handleGoogle}
                className="flex h-[56px] w-full items-center justify-center gap-3 rounded-[14px] border border-white/[0.22] bg-white/[0.035] text-[15px] font-semibold text-white transition-colors hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/40"
              >
                <GoogleIcon />
                Continuer avec Google
              </button>

              {/* Bascule */}
              <p className="mt-5 text-center text-sm text-white/55">
                {isLogin ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
                <button type="button" onClick={() => switchTab(isLogin ? 'register' : 'login')} className="font-bold text-[#18df8a] transition-colors hover:text-emerald-300">
                  {isLogin ? "S'inscrire" : 'Se connecter'}
                </button>
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

// ─── Bénéfice (icône + titre + texte, sans card) ─────────────
function Benefit({ icon, title, text }) {
  return (
    <div className="text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-400">
        {icon === 'shield' && <Shield size={21} />}
        {icon === 'users' && <Users size={21} />}
        {icon === 'pcc' && <span className="font-display text-lg font-black leading-none">P</span>}
      </span>
      <p className="mt-3 text-[13px] font-bold uppercase tracking-wide text-emerald-400">{title}</p>
      <p className="mt-1 text-[13px] leading-snug text-white/55">{text}</p>
    </div>
  );
}

// ─── Champ de formulaire (large, accessible) ─────────────────
function Field({ id, label, icon, rightSlot, ...inputProps }) {
  return (
    <div>
      <label htmlFor={id} className="mb-2.5 block text-sm font-medium text-white/[0.78]">{label}</label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/40" aria-hidden>{icon}</span>
        <input
          id={id}
          {...inputProps}
          className="h-[58px] w-full rounded-[14px] border border-white/[0.16] bg-[rgba(12,18,24,0.82)] pl-12 pr-12 text-[16px] text-white outline-none transition placeholder:text-white/35 focus:border-emerald-500/75 focus:ring-[3px] focus:ring-emerald-500/10"
        />
        {rightSlot}
      </div>
    </div>
  );
}

// ─── Mot de passe oublié ──────────────────────────────────────
async function handleForgotPassword(email) {
  if (!email) { alert('Entre ton email d\'abord.'); return; }
  const { supabase } = await import('@/lib/supabase');
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  if (error) alert(error.message);
  else alert('Un lien de réinitialisation t\'a été envoyé par email !');
}

// ─── Icône Google (multicolore) ───────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
      <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
    </svg>
  );
}

// ─── Traduction des erreurs Supabase ─────────────────────────
function translateError(msg = '') {
  if (msg.includes('Invalid login credentials'))  return 'Email ou mot de passe incorrect.';
  if (msg.includes('Email not confirmed'))         return 'Vérifie ta boîte mail pour confirmer ton compte.';
  if (msg.includes('User already registered'))     return 'Cet email est déjà utilisé. Connecte-toi.';
  if (msg.includes('Password should be'))          return 'Le mot de passe doit faire au moins 8 caractères.';
  if (/for security purposes.*after (\d+) seconds/i.test(msg)) {
    const s = msg.match(/after (\d+) seconds/i)?.[1] || 'quelques';
    return `Trop de tentatives rapprochées. Réessaie dans ${s} secondes.`;
  }
  if (/rate limit|too many requests|429|email.*rate/i.test(msg)) {
    return 'Limite d\'envoi d\'emails atteinte. Réessaie dans quelques minutes.';
  }
  if (/signups?.*(not allowed|disabled)/i.test(msg)) return 'Les inscriptions sont momentanément désactivées.';
  return msg;
}
