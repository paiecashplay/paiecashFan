// ═══════════════════════════════════════════════════════════════
// data/matchRoomsData.js - Data source abstraction for match rooms
//
// This is the ONLY file that knows about the API endpoints.
// To swap to a live football API later: change only this file.
// Components and context import from here, not from the API directly.
// ═══════════════════════════════════════════════════════════════

import { apiFetch } from '../lib/chatHelpers';

const BASE = '/api/match-rooms';

/**
 * Fetch all live match rooms.
 * @param {string} [status='live'] - 'live' | 'upcoming' | 'ended' | undefined (all)
 */
export async function getMatchRooms(status = 'live') {
  const qs = status ? `?status=${status}` : '';
  const res = await apiFetch(`${BASE}${qs}`);
  return (res?.data || res)?.rooms || [];
}

/**
 * Fetch a single room's details.
 */
export async function getMatchRoom(roomId) {
  const res = await apiFetch(`${BASE}/${roomId}`);
  return (res?.data || res)?.room;
}

/**
 * Fetch the last 100 messages for a room.
 */
export async function getMatchMessages(roomId) {
  const res = await apiFetch(`${BASE}/${roomId}/messages`);
  return (res?.data || res)?.messages || [];
}

/**
 * Post a message to a room.
 * @param {string} roomId
 * @param {{ message: string, message_type?: string, metadata?: object }} payload
 */
export async function postMatchMessage(roomId, payload) {
  const res = await apiFetch(`${BASE}/${roomId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return (res?.data || res)?.message;
}

/**
 * Send a game challenge to another user in a room.
 * @param {string} roomId
 * @param {{ challenged_id: string, game_id: string, game_name: string }} payload
 */
export async function sendChallenge(roomId, payload) {
  const res = await apiFetch(`${BASE}/${roomId}/challenge`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return (res?.data || res)?.challenge;
}

/**
 * Accept or decline a game challenge.
 * @param {string} challengeId
 * @param {'accepted' | 'declined'} status
 */
export async function respondToChallenge(challengeId, status) {
  const res = await apiFetch(`${BASE}/challenges/${challengeId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
  return (res?.data || res)?.challenge;
}
