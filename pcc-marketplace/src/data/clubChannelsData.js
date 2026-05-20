// ═══════════════════════════════════════════════════════════════
// data/clubChannelsData.js
// API wrapper for Club Channels
// ═══════════════════════════════════════════════════════════════

import { apiFetch } from '../lib/chatHelpers';

const BASE = '/api/club-channels';

/**
 * Fetch historical messages for a specific club channel
 */
export async function getClubMessages(clubId, limit = 100) {
  const res = await apiFetch(`${BASE}/${clubId}/messages?limit=${limit}`);
  return res?.data || [];
}

/**
 * Post a new message (text or reaction) to a club channel
 */
export async function postClubMessage(clubId, { message, message_type = 'text', metadata = null }) {
  const res = await apiFetch(`${BASE}/${clubId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ message, message_type, metadata }),
  });
  return res?.data;
}

/**
 * Send a game challenge in a club channel.
 * (Reusing the match discussion's logic to send a challenge message)
 */
export async function sendClubChallenge(clubId, { challenged_id, game_id, game_name }) {
  return await postClubMessage(clubId, {
    message: 'Challenge', // Doesn't matter, UI uses metadata
    message_type: 'challenge',
    metadata: {
      challenged_id,
      game_id,
      game_name,
      // Need a unique challenge ID since we don't have a game_challenges table for clubs yet.
      // We'll reuse the match discussion challenge accept route, so we generate a fake ID 
      // or we just use the match_rooms approach. Wait, match_rooms creates a game_challenges row.
      // Since we are inside a club channel, how does accepting work?
      // Actually, we can just use the generic challenge API or adapt the metadata.
      // For now, generate a unique ID. If they accept, we might need a general challenge accept route.
      // We will route it through match-rooms for simplicity if possible, or build a new one.
      // Let's create a placeholder challenge_id
      challenge_id: `club_chal_${Date.now()}_${Math.floor(Math.random()*10000)}`
    }
  });
}
