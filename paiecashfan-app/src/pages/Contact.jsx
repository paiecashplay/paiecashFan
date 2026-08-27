import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  LifeBuoy,
  Loader2,
  Mail,
  Send,
  ShieldCheck,
} from 'lucide-react';

import { Container } from '@/components/ui/Container';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const CONTACT_EMAIL = 'contact@paiecashfan.com';

export function Contact() {
  const { user } = useAuth();

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    company: '', // honeypot anti-bot (masqué)
  });
  const [status, setStatus] = useState('idle'); // idle | sending | success
  const [error, setError] = useState('');

  // Pré-remplissage si connecté.
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
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(16,185,129,0.05),transparent_42%)]" />

      {/* En-tête */}
      <section className="relative py-14 md:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-[0.2em] text-emerald-300"
          >
            <LifeBuoy size={13} />
            Support
          </motion.div>

          <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[0.95] tracking-tight text-bone-50 md:text-6xl">
            Contactez-nous
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-bone-300 md:text-base">
            Une question sur un billet, un abonnement, votre compte ou un
            paiement ? Écrivez-nous, notre équipe vous répond au plus vite.
          </p>
        </Container>
      </section>

      <Container className="relative pb-24">
        <div className="grid gap-5 lg:grid-cols-[1.4fr_0.9fr]">
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
                      message: '',
                    }));
                  }}
                >
                  Envoyer un autre message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot (masqué aux humains) */}
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
                  <Field label="Nom">
                    <input
                      type="text"
                      value={form.name}
                      onChange={update('name')}
                      placeholder="Votre nom"
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

                <Field label="Sujet (optionnel)">
                  <input
                    type="text"
                    value={form.subject}
                    onChange={update('subject')}
                    placeholder="Ex. Question sur un abonnement"
                    className={inputClass}
                  />
                </Field>

                <Field label="Message">
                  <textarea
                    value={form.message}
                    onChange={update('message')}
                    placeholder="Décrivez votre demande…"
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

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={status === 'sending'}
                    className="min-w-[190px] justify-center"
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
            )}
          </GlassCard>

          {/* Infos */}
          <div className="flex flex-col gap-5">
            <GlassCard className="border border-white/10 p-6">
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-bone-400">
                Nous joindre
              </p>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-4 flex items-start gap-3 text-bone-100 transition hover:text-emerald-300"
              >
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06]">
                  <Mail size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold">Email</p>
                  <p className="text-[13px] text-bone-400">{CONTACT_EMAIL}</p>
                </div>
              </a>
              <div className="mt-4 flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06]">
                  <Clock size={16} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-bone-50">
                    Temps de réponse
                  </p>
                  <p className="text-[13px] text-bone-400">
                    En général sous 24-48h ouvrées
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="border border-white/10 p-6">
              <div className="flex items-start gap-3">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-emerald-400" />
                <p className="text-[13px] leading-6 text-bone-300">
                  Vos données ne servent qu'à traiter votre demande. Elles ne
                  sont ni revendues ni utilisées à des fins commerciales.
                </p>
              </div>
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
