// ═══════════════════════════════════════════════════════════════
// db/otp.js - OTP code management via Supabase
// ═══════════════════════════════════════════════════════════════

const supabase = require('./supabase');
const crypto = require('crypto');

function hashCode(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function createOTP(email, purpose = 'login') {
  const code = generateOTP();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

  // Invalidate old unused OTPs for same email+purpose
  await supabase.from('otp_codes')
    .delete()
    .eq('email', email)
    .eq('purpose', purpose)
    .is('used_at', null);

  const { error } = await supabase.from('otp_codes').insert({
    email,
    code_hash: codeHash,
    purpose,
    expires_at: expiresAt
  });

  if (error) throw new Error(`createOTP: ${error.message}`);
  return code; // Return plain code to send via email/console
}

async function verifyOTP(email, code, purpose = 'login') {
  const codeHash = hashCode(code);

  const { data: otp, error } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .eq('purpose', purpose)
    .eq('code_hash', codeHash)
    .is('used_at', null)
    .gte('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !otp) return false;

  if (otp.attempts >= 5) {
    await supabase.from('otp_codes').update({ used_at: new Date().toISOString() }).eq('id', otp.id);
    return false;
  }

  // Mark as used
  await supabase.from('otp_codes').update({ used_at: new Date().toISOString() }).eq('id', otp.id);
  return true;
}

async function incrementAttempts(email, purpose = 'login') {
  const { data: otps } = await supabase
    .from('otp_codes')
    .select('id, attempts')
    .eq('email', email)
    .eq('purpose', purpose)
    .is('used_at', null)
    .order('created_at', { ascending: false })
    .limit(1);

  if (otps && otps.length > 0) {
    await supabase.from('otp_codes')
      .update({ attempts: (otps[0].attempts || 0) + 1 })
      .eq('id', otps[0].id);
  }
}

module.exports = { createOTP, verifyOTP, incrementAttempts, generateOTP, hashCode };
