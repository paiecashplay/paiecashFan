import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Headphones,
  HelpCircle,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const CONTACT_EMAIL = 'contact@paiecashfan.com';

const SUBJECTS = [
  'Billet ou abonnement',
  'Boutique / commande',
  'Compte et connexion',
  'Paiement / PaieCashCoin',
  'Autre',
];

export function Contact() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    orderRef: '',
    message: '',
    company: '', // honeypot anti-bot (masqué)
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setForm((prev) => ({
      ...prev,
      email: prev.email || user.email || '',
      name:
        prev.name ||
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        '',
    }));
  }, [user]);

  const update = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }));

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (
      !form.name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()) ||
      form.message.trim().length < 10
    ) {
      setError(
        'Renseignez votre nom, un email valide et un message (10 caractères minimum).'
      );
      return;
    }

    setStatus('sending');
    try {
      await apiFetch('/api/v2/contact', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setStatus('success');
    } catch (err) {
      setError(err?.message || "Impossible d'envoyer le message pour le moment.");
      setStatus('idle');
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden pb-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(16,185,129,0.05),transparent_42%)]" />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <Container className="relative pt-10 md:pt-14">
        <GlassCard className="relative overflow-hidden border border-white/10 p-8 md:p-12">
          {/* Fond stade + halo (éclairci) */}
          <div className="pointer-events-none absolute inset-0">
            <img
              src="/images/stadium-bg.png"
              alt=""
              aria-hidden="true"
              className="absolute right-0 top-0 h-full w-3/4 object-cover opacity-[0.55]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent" />
            <div
              className="absolute inset-0 opacity-40"
              style={{
                background:
                  'radial-gradient(circle at 78% 45%, rgba(16,185,129,0.28), transparent 42%)',
              }}
            />
          </div>

          {/* Casque support (image fournie) */}
          <img
            src="/images/assistance_icon.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-6 top-1/2 hidden w-[130px] -translate-y-1/2 object-contain drop-shadow-[0_0_30px_rgba(16,185,129,0.4)] md:block lg:right-12 lg:w-[160px]"
          />

          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300"
            >
              <Headphones size={13} />
              Support
            </motion.div>

            <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[0.9] tracking-tight text-bone-50 md:text-6xl">
              Contactez-nous
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-bone-300 md:text-base">
              Une question sur un billet, un abonnement, votre compte ou un
              paiement ? Notre équipe vous répond au plus vite.
            </p>
          </div>
        </GlassCard>
      </Container>

      {/* ── Grille principale ────────────────────────────────── */}
      <Container className="relative mt-6">
        <div className="grid gap-5 lg:grid-cols-[1.5fr_0.9fr]">
          {/* Formulaire */}
          <GlassCard className="border border-white/10 p-6 md:p-8">
            {status === 'success' ? (
              <div className="flex flex-col items-center py-10 text-center">
                <CheckCircle2 size={54} className="text-emerald-400" />
                <h2 className="mt-4 font-display text-2xl font-black uppercase text-bone-50">
                  Message envoyé
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-bone-300">
                  Merci ! Votre message a bien été transmis à notre équipe.
                  Nous vous répondrons par email dans les meilleurs délais.
                </p>
                <Button
                  variant="outline"
                  size="md"
                  className="mt-6"
                  onClick={() => {
                    setStatus('idle');
                    setForm((prev) => ({
                      ...prev,
                      subject: '',
                      orderRef: '',
                      message: '',
                    }));
                  }}
                >
                  Envoyer un autre message
                </Button>
              </div>
            ) : (
              <>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">
                  Nous sommes là pour vous aider
                </p>
                <p className="mt-2 text-sm text-bone-400">
                  Remplissez le formulaire ci-dessous, nous vous répondrons
                  rapidement.
                </p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  {/* Honeypot */}
                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={update('company')}
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                    className="hidden"
                  />

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="Nom complet">
                      <input
                        type="text"
                        value={form.name}
                        onChange={update('name')}
                        placeholder="Votre nom complet"
                        className={inputClass}
                      />
                    </Field>
                    <Field label="Email">
                      <input
                        type="email"
                        value={form.email}
                        onChange={update('email')}
                        placeholder="vous@email.com"
                        className={inputClass}
                      />
                    </Field>
                  </div>

                  <Field label="Sujet">
                    <div className="relative">
                      <select
                        value={form.subject}
                        onChange={update('subject')}
                        className={`${inputClass} appearance-none pr-10 ${
                          form.subject ? 'text-bone-100' : 'text-bone-500'
                        }`}
                      >
                        <option value="">Sélectionnez un sujet</option>
                        {SUBJECTS.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                      <ChevronDown
                        size={16}
                        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-bone-500"
                      />
                    </div>
                  </Field>

                  <Field label="Numéro de commande (optionnel)">
                    <input
                      type="text"
                      value={form.orderRef}
                      onChange={update('orderRef')}
                      placeholder="Ex. #PCF-2026-0012"
                      className={inputClass}
                    />
                  </Field>

                  <Field label="Votre message">
                    <textarea
                      value={form.message}
                      onChange={update('message')}
                      placeholder="Décrivez votre demande en détail…"
                      rows={6}
                      className="w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-bone-100 outline-none transition placeholder:text-bone-500 focus:border-emerald-400/50"
                    />
                  </Field>

                  {error && (
                    <div className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <p className="flex items-start gap-2 text-[12px] leading-5 text-bone-500">
                      <ShieldCheck
                        size={15}
                        className="mt-0.5 shrink-0 text-emerald-400"
                      />
                      Vos données sont sécurisées et utilisées uniquement pour
                      traiter votre demande.
                    </p>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={status === 'sending'}
                      className="w-full shrink-0 justify-center sm:w-auto"
                    >
                      {status === 'sending' ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Envoi…
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </GlassCard>

          {/* Colonne latérale */}
          <div className="flex flex-col gap-5">
            {/* Nous joindre */}
            <GlassCard className="border border-white/10 p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-bone-400">
                Nous joindre
              </p>
              <div className="mt-4 space-y-4">
                <InfoRow
                  icon={Mail}
                  title="Email"
                  href={`mailto:${CONTACT_EMAIL}`}
                >
                  {CONTACT_EMAIL}
                </InfoRow>
                <InfoRow icon={Clock} title="Temps de réponse">
                  En général sous 24 à 48h ouvrées
                </InfoRow>
                <InfoRow icon={Headphones} title="Support dédié">
                  Notre équipe est à votre écoute
                </InfoRow>
              </div>
            </GlassCard>

            {/* FAQ */}
            <GlassCard className="border border-white/10 p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-bone-400">
                Questions fréquentes
              </p>
              <p className="mt-3 text-sm leading-6 text-bone-300">
                Retrouvez les réponses aux questions les plus fréquentes dans
                notre FAQ.
              </p>
              <Link
                to="/faq"
                className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-bone-100 backdrop-blur transition-all hover:border-emerald-500/50 hover:bg-white/10"
              >
                <HelpCircle size={15} />
                Consulter la FAQ
              </Link>
            </GlassCard>

            {/* Aide immédiate */}
            <GlassCard className="border border-white/10 p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-bone-400">
                Besoin d'aide immédiate ?
              </p>
              <p className="mt-3 text-sm leading-6 text-bone-300">
                Consultez vos commandes et gérez votre compte directement depuis
                votre espace.
              </p>
              <Link
                to={user ? '/mon-compte' : '/login'}
                className="mt-4 inline-flex h-11 w-full items-center justify-between gap-2 rounded-full border border-white/15 bg-white/5 px-6 text-sm font-semibold text-bone-100 backdrop-blur transition-all hover:border-emerald-500/50 hover:bg-white/10"
              >
                <span className="inline-flex items-center gap-2">
                  <UserRound size={15} />
                  Accéder à mon compte
                </span>
                <ArrowRight size={15} />
              </Link>
            </GlassCard>
          </div>
        </div>
      </Container>
    </div>
  );
}

const inputClass =
  'h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm text-bone-100 outline-none transition placeholder:text-bone-500 focus:border-emerald-400/50';

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.16em] text-bone-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function InfoRow({ icon: Icon, title, href, children }) {
  const body = (
    <>
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06]">
        <Icon size={16} className="text-emerald-400" />
      </div>
      <div>
        <p className="text-sm font-bold text-bone-50">{title}</p>
        <p className="text-[13px] text-bone-400">{children}</p>
      </div>
    </>
  );
  if (href) {
    return (
      <a
        href={href}
        className="flex items-start gap-3 transition hover:opacity-80"
      >
        {body}
      </a>
    );
  }
  return <div className="flex items-start gap-3">{body}</div>;
}
