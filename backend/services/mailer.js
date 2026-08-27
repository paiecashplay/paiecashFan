// ═══════════════════════════════════════════════════════════════
// Mailer transactionnel via l'API HTTP Resend (aucune dépendance npm :
// on utilise fetch natif de Node 22). Dormant tant que RESEND_API_KEY
// n'est pas défini (no-op + log) — voir TODO.md § Infra email.
// ═══════════════════════════════════════════════════════════════
const supabase = require('../db/supabase');

const FROM = process.env.RESEND_FROM || 'PaieCashFan <onboarding@resend.dev>';

// Envoie un email. Retourne true si envoyé, false si pas d'infra / erreur.
// `replyTo` (optionnel) : adresse à laquelle les réponses doivent partir
// (ex. l'expéditeur d'un formulaire de contact).
async function sendEmail({ to, subject, html, replyTo }) {
  const key = process.env.RESEND_API_KEY;
  const recipients = (Array.isArray(to) ? to : [to]).filter(Boolean);
  if (!key) {
    console.log(`[mailer] (dormant, pas de RESEND_API_KEY) → "${subject}" pour ${recipients.join(', ') || '—'}`);
    return false;
  }
  if (!recipients.length) return false;
  try {
    const payload = { from: FROM, to: recipients, subject, html };
    if (replyTo) payload.reply_to = replyTo;
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      console.error('[mailer] Resend error:', res.status, t.slice(0, 200));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[mailer] error:', err.message);
    return false;
  }
}

// Récupère les emails des super_admin (pour les notifications internes).
async function getSuperAdminEmails() {
  try {
    const { data: profiles } = await supabase
      .from('profiles').select('id').eq('role', 'super_admin');
    const ids = (profiles || []).map((p) => p.id);
    const emails = [];
    for (const id of ids) {
      const { data } = await supabase.auth.admin.getUserById(id);
      if (data?.user?.email) emails.push(data.user.email);
    }
    // Repli sur une adresse configurée si aucun super_admin trouvé.
    if (!emails.length && process.env.ONBOARDING_NOTIFY_EMAIL) {
      emails.push(process.env.ONBOARDING_NOTIFY_EMAIL);
    }
    return emails;
  } catch (err) {
    console.error('[mailer] getSuperAdminEmails:', err.message);
    return process.env.ONBOARDING_NOTIFY_EMAIL ? [process.env.ONBOARDING_NOTIFY_EMAIL] : [];
  }
}

module.exports = { sendEmail, getSuperAdminEmails };
