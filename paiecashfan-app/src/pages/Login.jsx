import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Shield, ArrowLeft, Chrome, Check } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/ui/Container';
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

export function Login() {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = location.state?.next || '/';

  const [tab, setTab]           = useState('login');
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
        const { data } = await signUp({
          email: form.email,
          password: form.password,
          displayName: form.displayName
        });

        // Si demande club_admin → on pose role_request sur le profil
        // (le trigger crée le profil, on attend un tick puis on update)
        if (form.roleRequest === 'club_admin' && data?.user) {
          await new Promise((r) => setTimeout(r, 800));
          await supabase
            .from('profiles')
            .update({ role_request: 'club_admin' })
            .eq('id', data.user.id);
        }

        setSuccess(
          form.roleRequest === 'club_admin'
            ? 'Compte créé ! Vérifie ton email, puis ta demande d\'accès club sera examinée par notre équipe.'
            : 'Compte créé ! Vérifie ton email pour confirmer ton inscription.'
        );
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
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-4">
      {/* Blob déco */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <Container className="relative w-full max-w-md">
        <Link to={next === '/' ? '/' : -1} className="inline-flex items-center gap-2 text-xs text-bone-400 hover:text-bone-100 mb-8 transition-colors">
          <ArrowLeft size={14} /> Retour
        </Link>

        {/* Card principale */}
        <div className="rounded-2xl border border-white/10 bg-ink-800/60 backdrop-blur-xl p-8">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="h-12 w-12 rounded-2xl bg-gradient-hero shadow-glow-emerald grid place-items-center">
              <span className="font-display font-black text-xl text-white">P</span>
            </div>
          </div>

          {/* Titre */}
          <h1 className="text-center font-display text-2xl font-black text-bone-50 mb-1">
            {tab === 'login' ? 'Bon retour !' : 'Rejoins PaieCashFan'}
          </h1>
          <p className="text-center text-xs text-bone-400 mb-6">
            {tab === 'login'
              ? 'Connecte-toi à ton compte fan'
              : 'Crée ton compte en quelques secondes'}
          </p>

          {/* Tabs */}
          <div className="flex rounded-xl border border-white/10 bg-ink-900/40 p-1 mb-6">
            {['login', 'register'].map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={cn(
                  'flex-1 py-2.5 text-xs font-bold uppercase tracking-[0.12em] rounded-lg transition-all',
                  tab === t
                    ? 'bg-gradient-hero text-white shadow-md'
                    : 'text-bone-400 hover:text-bone-100'
                )}
              >
                {t === 'login' ? 'Connexion' : 'Inscription'}
              </button>
            ))}
          </div>

          {/* Message succès */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-2.5 mb-2"
              >
                {success}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Formulaire */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {tab === 'register' && (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
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
                    <label className="block text-xs font-semibold text-bone-300 mb-2">Je m'inscris en tant que</label>
                    <div className="space-y-2">
                      {ROLE_OPTIONS.map(({ value, label, description, icon: Icon, badge }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setForm((f) => ({ ...f, roleRequest: value }))}
                          className={cn(
                            'w-full text-left flex items-start gap-3 p-3 rounded-xl border transition-all',
                            form.roleRequest === value
                              ? 'border-emerald-500/50 bg-emerald-500/10'
                              : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                          )}
                        >
                          <div className={cn(
                            'h-8 w-8 rounded-lg grid place-items-center shrink-0 mt-0.5',
                            form.roleRequest === value ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-bone-400'
                          )}>
                            <Icon size={15} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={cn('text-xs font-bold', form.roleRequest === value ? 'text-emerald-400' : 'text-bone-200')}>
                                {label}
                              </span>
                              {badge && (
                                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/20">
                                  {badge}
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-bone-500 mt-0.5 leading-relaxed">{description}</p>
                          </div>
                          {form.roleRequest === value && (
                            <Check size={14} className="text-emerald-400 shrink-0 mt-1" />
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
                className="absolute right-3 top-[34px] text-bone-400 hover:text-bone-100 transition-colors"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Erreur */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl bg-gradient-hero font-bold text-sm text-white shadow-md hover:opacity-90 active:scale-[.98] transition-all disabled:opacity-50 mt-2"
            >
              {loading
                ? <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : tab === 'login' ? 'Se connecter' : 'Créer mon compte'}
            </button>
          </form>

          {/* Divider + OAuth */}
          <div className="flex items-center gap-3 my-5">
            <span className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-bone-500">ou</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <button
            onClick={handleGoogle}
            className="w-full h-11 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center gap-3 text-sm font-semibold text-bone-100 transition-colors"
          >
            <Chrome size={16} />
            Continuer avec Google
          </button>

          {/* Mot de passe oublié (login only) */}
          {tab === 'login' && (
            <p className="text-center text-xs text-bone-500 mt-4">
              <button
                type="button"
                onClick={() => handleForgotPassword(form.email)}
                className="hover:text-emerald-400 transition-colors"
              >
                Mot de passe oublié ?
              </button>
            </p>
          )}
        </div>
      </Container>
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
      <label className="block text-xs font-semibold text-bone-300 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-500">{icon}</span>
        <input
          {...inputProps}
          className="w-full h-11 pl-9 pr-4 rounded-xl border border-white/10 bg-ink-900/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-colors"
        />
      </div>
    </div>
  );
}

// ─── Traduction des erreurs Supabase ─────────────────────────
function translateError(msg) {
  if (msg.includes('Invalid login credentials'))  return 'Email ou mot de passe incorrect.';
  if (msg.includes('Email not confirmed'))         return 'Vérifie ta boîte mail pour confirmer ton compte.';
  if (msg.includes('User already registered'))     return 'Cet email est déjà utilisé. Connecte-toi.';
  if (msg.includes('Password should be'))          return 'Le mot de passe doit faire au moins 8 caractères.';
  if (msg.includes('rate limit'))                  return 'Trop de tentatives. Attends quelques minutes.';
  return msg;
}
