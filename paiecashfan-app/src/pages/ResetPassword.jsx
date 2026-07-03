// Page de réinitialisation du mot de passe (arrivée via le lien email).
// Supabase (detectSessionInUrl) traite le token de récupération dans l'URL et
// ouvre une session temporaire → on peut alors définir un nouveau mot de passe.
import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, KeyRound, Check, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Container } from '@/components/ui/Container';
import { cn } from '@/lib/cn';

export function ResetPassword() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);      // session de récupération détectée
  const [checking, setChecking] = useState(true);
  const [pwd, setPwd] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    // La session peut déjà être posée (hash traité) ou arriver via l'event.
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data?.session) setReady(true);
      setChecking(false);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    if (pwd.length < 8) { setError('Le mot de passe doit faire au moins 8 caractères.'); return; }
    if (pwd !== confirm) { setError('Les deux mots de passe ne correspondent pas.'); return; }
    setSubmitting(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: pwd });
      if (err) throw err;
      setDone(true);
      setTimeout(() => navigate('/', { replace: true }), 1800);
    } catch (err) {
      setError(err.message || 'Échec de la réinitialisation.');
    }
    setSubmitting(false);
  }

  const inputCls = 'w-full h-11 pl-9 pr-10 rounded-xl border border-white/10 bg-ink-900/60 text-sm text-bone-100 placeholder:text-bone-600 focus:outline-none focus:border-emerald-500/60';

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex items-center justify-center py-16 px-4">
      <Container className="relative w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-xs text-bone-400 hover:text-bone-100 mb-8 transition-colors">
          <ArrowLeft size={14} /> Connexion
        </Link>

        <div className="rounded-2xl border border-white/10 bg-ink-800/60 backdrop-blur-xl p-8">
          <h1 className="text-center font-display text-2xl font-black text-bone-50 mb-1">Nouveau mot de passe</h1>
          <p className="text-center text-xs text-bone-400 mb-6">Choisis un nouveau mot de passe pour ton compte</p>

          {checking ? (
            <div className="py-8 grid place-items-center"><Loader2 size={24} className="text-emerald-400 animate-spin" /></div>
          ) : done ? (
            <div className="py-6 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 grid place-items-center text-emerald-400 mb-3"><Check size={24} /></div>
              <p className="text-sm text-bone-200">Mot de passe mis à jour ! Redirection…</p>
            </div>
          ) : !ready ? (
            <div className="py-4 text-center text-sm text-amber-400">
              Lien invalide ou expiré. Refais une demande depuis « Mot de passe oublié ? ».
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <PwdField icon={<KeyRound size={15} />} value={pwd} onChange={setPwd} show={showPwd} setShow={setShowPwd}
                placeholder="Nouveau mot de passe (min. 8)" cls={inputCls} />
              <PwdField icon={<KeyRound size={15} />} value={confirm} onChange={setConfirm} show={showPwd} setShow={setShowPwd}
                placeholder="Confirme le mot de passe" cls={inputCls} />

              {error && <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}

              <button type="submit" disabled={submitting}
                className="w-full h-12 rounded-xl bg-gradient-hero font-bold text-sm text-white shadow-md hover:opacity-90 active:scale-[.98] transition-all disabled:opacity-50">
                {submitting ? <span className="inline-block h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> : 'Mettre à jour'}
              </button>
            </form>
          )}
        </div>
      </Container>
    </div>
  );
}

function PwdField({ icon, value, onChange, show, setShow, placeholder, cls }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-bone-500">{icon}</span>
      <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} minLength={8} required className={cn(cls)} />
      <button type="button" onClick={() => setShow((v) => !v)} tabIndex={-1}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-bone-500 hover:text-bone-100">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}
