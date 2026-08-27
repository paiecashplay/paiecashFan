// ═══════════════════════════════════════════════════════════════
// routes/v2/contact.js — Formulaire de contact public.
// Enregistre le message (best-effort, table contact_messages) ET envoie
// une notification email à CONTACT_EMAIL (via Resend, cf. services/mailer).
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const { sendEmail } = require('../../services/mailer');
const supabase = require('../../db/supabase');
const router = express.Router();

const CONTACT_EMAIL =
  process.env.CONTACT_EMAIL || 'contact@paiecashfan.com';

const ok = (res, data) => res.json({ success: true, data, error: '' });
const fail = (res, msg, s = 400) =>
  res.status(s).json({ success: false, data: null, error: msg });

const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || ''));
const clean = (s, max) => String(s || '').trim().slice(0, max);
const esc = (s) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

// Throttle mémoire simple : 1 message / 30 s / IP.
const lastByIp = new Map();

// POST /api/v2/contact  { name, email, subject?, message, company? (honeypot) }
router.post('/', async (req, res) => {
  try {
    // Honeypot anti-bot : un vrai utilisateur ne remplit jamais ce champ.
    if (clean(req.body?.company, 100)) return ok(res, { sent: true });

    const name = clean(req.body?.name, 120);
    const email = clean(req.body?.email, 200);
    const subject = clean(req.body?.subject, 160);
    const message = clean(req.body?.message, 5000);

    if (!name || !isEmail(email) || !message) {
      return fail(res, 'Nom, email valide et message sont requis.');
    }
    if (message.length < 10) {
      return fail(res, 'Merci de détailler un peu plus votre message.');
    }

    const ip =
      (req.headers['x-forwarded-for'] || '')
        .toString()
        .split(',')[0]
        .trim() ||
      req.ip ||
      'unknown';

    const now = Date.now();
    if (lastByIp.get(ip) && now - lastByIp.get(ip) < 30000) {
      return fail(
        res,
        'Merci de patienter quelques secondes avant de renvoyer un message.',
        429
      );
    }
    lastByIp.set(ip, now);

    // Stockage durable (best-effort : si la table n'existe pas, on continue,
    // l'email reste le canal principal).
    const { error: dbError } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        subject: subject || null,
        message,
        ip,
      });
    if (dbError) {
      console.warn('[contact] insert non enregistré:', dbError.message);
    }

    const subjectLine = subject
      ? `[Contact] ${subject}`
      : `[Contact] Nouveau message de ${name}`;

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111">
        <h2 style="margin:0 0 12px">Nouveau message de contact</h2>
        <p style="margin:2px 0"><strong>Nom :</strong> ${esc(name)}</p>
        <p style="margin:2px 0"><strong>Email :</strong> ${esc(email)}</p>
        ${subject ? `<p style="margin:2px 0"><strong>Sujet :</strong> ${esc(subject)}</p>` : ''}
        <p style="margin:12px 0 4px"><strong>Message :</strong></p>
        <p style="white-space:pre-wrap;border-left:3px solid #10b981;padding-left:12px;margin:0">${esc(message)}</p>
      </div>`;

    // On répond à l'expéditeur du formulaire quand on clique « Répondre ».
    const sent = await sendEmail({
      to: CONTACT_EMAIL,
      subject: subjectLine,
      html,
      replyTo: email,
    });

    // Succès renvoyé même si l'email est dormant (message stocké en base) :
    // l'utilisateur ne doit pas voir d'erreur d'infrastructure.
    return ok(res, { sent });
  } catch (err) {
    console.error('[contact] error:', err.message);
    return fail(res, "Impossible d'envoyer le message pour le moment.", 500);
  }
});

module.exports = router;
