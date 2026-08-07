import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Shield, Coins, Users, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/cn';

// Choix de rôle à l'inscription
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

// Points forts affichés sur le panneau de gauche (maquette).
const FEATURES = [
  { icon: Shield, title: 'Sécurisé', text: 'Vos données sont protégées' },
  { icon: Coins, title: 'PCC officiel', text: 'La monnaie des supporters' },
  { icon: Users, title: 'Communauté', text: 'Des fans comme vous' },
];

export function Login() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.next || '/';

  // Onglet initial : ?tab=register ou state.tab (depuis les boutons du header).
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

  function set(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (tab === 'login') {
        await signIn({ email: form.email, password: form.password });
        navigate(next, { replace: true });
      } else {
        if (!form.displayName.trim()) { setError('Ton prénom est requis.'); setLoading(false); return; }
        // signUp renvoie directement { user, session }
        const data = await signUp({
          email: form.email,
          password: form.password,
          displayName: form.displayName
        });

        // Demande club_admin → on pose role_request sur le profil
        // (le trigger crée le profil, on attend un tick puis on update).
        const isClub = form.roleRequest === 'club_admin';
        if (isClub && data?.user) {
          await new Promise((r) => setTimeout(r, 800));
          await supabase
            .from('profiles')
            .update({ role_request: 'club_admin' })
            .eq('id', data.user.id);
        }

        if (data?.session) {
          // Auto-connecté (confirmation email désactivée) → on redirige :
          // club → espace onboarding, fan → destination initiale.
          navigate(isClub ? '/mon-club' : next, { replace: true });
        } else {
          // Confirmation email requise (session null tant que non confirmé).
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
      // Conserve la destination initiale.
      redirectUrl.searchParams.set('oauth_next', next);

      // Le choix du rôle n'est pris en compte que pendant une inscription.
      if (tab === 'register' && form.roleRequest === 'club_admin') {
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

  return (
    <div className="relative grid min-h-[calc(100vh-80px)] lg:grid-cols-2">
      {/* ══ Panneau gauche — hero (masqué en mobile) ══ */}
      <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-center lg:px-12 xl:px-16">
        {/* Fond : image stade + repli dégradé si l'image est absente */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(120%_90%_at_70%_0%,rgba(16,185,129,0.18),transparent_55%),linear-gradient(160deg,#04120c_0%,#020806_60%,#010403_100%)]">
          <img
            src="/images/login-bg.webp"
            alt=""
            aria-hidden
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
            className="h-full w-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-ink-950/70 via-ink-950/55 to-ink-950/85" />
        </div>

        {/* Logo centré */}
        <img
          src="/paiecashfan-logo.webp"
          alt="PaieCashFan"
          className="mx-auto mb-10 h-28 w-28 rounded-3xl shadow-glow-emerald xl:h-32 xl:w-32"
        />

        <h2 className="font-display text-4xl font-black uppercase leading-[1.05] tracking-tight text-bone-50 xl:text-5xl">
          Plus qu'une plateforme,<br />
          <span className="text-emerald-400">une communauté.</span>
        </h2>

        <p className="mt-5 max-w-md text-sm leading-relaxed text-bone-300">
          PaieCashFan réunit tous les supporters autour de leur passion. Achats, jeux,
          fan club, événements et PaieCashCoin (PCC).
        </p>

        <div className="mt-9 grid max-w-lg grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title}>
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-400">
                <Icon size={20} />
              </span>
              <p className="mt-3 text-[11px] font-black uppercase tracking-wider text-emerald-400">{title}</p>
              <p className="mt-0.5 text-[11px] leading-snug text-bone-400">{text}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* ══ Panneau droit — carte auth ══ */}
      <div className="relative flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-ink-800/60 p-7 backdrop-blur-xl sm:p-9">
          {/* Onglets */}
          <div className="mb-7 flex gap-8 border-b border-white/10">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                className={cn(
                  'relative -mb-px pb-3 text-xs font-black uppercase tracking-[0.14em] transition-colors',
                  tab === t ? 'text-emerald-400' : 'text-bone-500 hover:text-bone-300'
                )}
              >
                {t === 'login' ? 'Connexion' : 'Inscription'}
                {tab === t && (
                  <motion.span layoutId="login-tab-underline" className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-emerald-400" />
                )}
              </button>
            ))}
          </div>

          {/* Titre */}
          <h1 className="font-display text-2xl font-black text-bone-50">
            {tab === 'login' ? 'Bon retour ! 👋' : 'Rejoins PaieCashFan 🎉'}
          </h1>
          <p className="mt-1 text-xs text-bone-400">
            {tab === 'login' ? 'Connecte-toi à ton compte fan' : 'Crée ton compte en quelques secondes'}
          </p>

          {/* Message succès */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-400"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <AnimatePresence mode="wait">
              {tab === 'register' && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4 overflow-hidden"
                >
                  <Field
                    label="Prénom / Pseudo"
                    icon={<User size={15} />}
                    type="text"
                    placeholder="Ex : Mohamed"
                    value={form.displayName}
                    onChange={set('displayName')}
                    required
                  />

                  {/* Sélecteur de rôle */}
                  <div>
                    <label className="mb-2 block text-xs font-semibold text-bone-300">Je m'inscris en tant que</label>
                    <div className="space-y-2">
                      {ROLE_OPTIONS.map(({ value, label, description, icon: Icon, badge }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, roleRequest: value }))}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all',
                            form.roleRequest === value
                              ? 'border-emerald-500/50 bg-emerald-500/10'
                              : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                          )}
                        >
                          <div className={cn(
                            'mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg',
                            form.roleRequest === value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-bone-400'
                          )}>
                            <Icon size={15} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={cn('text-xs font-bold', form.roleRequest === value ? 'text-emerald-400' : 'text-bone-200')}>
                                {label}
                              </span>
                              {badge && (
                                <span className="rounded border border-amber-500/20 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
                                  {badge}
                                </span>
                              )}
                            </div>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-bone-500">{description}</p>
                          </div>
                          {form.roleRequest === value && (
                            <Check size={14} className="mt-1 shrink-0 text-emerald-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Field
              label="Adresse e-mail"
              icon={<Mail size={15} />}
              type="email"
              placeholder="toi@exemple.com"
              value={form.email}
              onChange={set('email')}
              required
            />

            <div>
              <div className="relative">
                <Field
                  label="Mot de passe"
                  icon={<Lock size={15} />}
                  type={showPwd ? 'text' : 'password'}
                  placeholder={tab === 'register' ? 'Min. 8 caractères' : '••••••••'}
                  value={form.password}
                  onChange={set('password')}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute right-3 top-[34px] text-bone-400 transition-colors hover:text-bone-100"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {tab === 'login' && (
                <div className="mt-2 text-right">
                  <button
                    type="button"
                    onClick={() => handleForgotPassword(form.email)}
                    className="text-xs font-semibold text-emerald-400 transition-colors hover:text-emerald-300"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}
            </div>

            {/* Erreur */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-hero text-sm font-bold text-white shadow-md transition-all hover:opacity-90 active:scale-[.98] disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  {tab === 'login' ? 'Se connecter' : 'Créer mon compte'}
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Divider + OAuth */}
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-bone-500">ou</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={handleGoogle}
            className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] text-sm font-semibold text-bone-100 transition-colors hover:bg-white/10"
          >
            <GoogleIcon />
            Continuer avec Google
          </button>

          {/* Bascule connexion / inscription */}
          <p className="mt-6 text-center text-xs text-bone-500">
            {tab === 'login' ? 'Pas encore de compte ? ' : 'Déjà un compte ? '}
            <button
              type="button"
              onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); setSuccess(''); }}
              className="font-bold text-emerald-400 transition-colors hover:text-emerald-300"
            >
              {tab === 'login' ? "S'inscrire" : 'Se connecter'}
            </button>
          </p>
        </div>
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

// ─── Composant Field ──────────────────────────────────────────
function Field({ label, icon, ...inputProps }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-bone-300">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-500">{icon}</span>
        <input
          {...inputProps}
          className="h-12 w-full rounded-xl border border-white/10 bg-ink-900/60 pl-9 pr-4 text-sm text-bone-100 transition-colors placeholder:text-bone-600 focus:border-emerald-500/60 focus:outline-none focus:ring-1 focus:ring-emerald-500/30"
        />
      </div>
    </div>
  );
}

// ─── Icône Google (multicolore) ───────────────────────────────
function GoogleIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden>
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
  // Rate-limit Supabase (envoi d'emails de confirmation)
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
