import { createClient } from '@supabase/supabase-js';

const MINT_BASE = '/api/v2/mint';
const GAMING_BASE = '/api/v2/gaming';

// ── Supabase client (used for Realtime subscriptions) ────────────
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

console.log('SUPABASE_URL?', import.meta.env.VITE_SUPABASE_URL);
console.log('ANON?', import.meta.env.VITE_SUPABASE_ANON_KEY);


function getToken() {
  const raw = localStorage.getItem('pcc_user');
  if (!raw) return null;
  try { return JSON.parse(raw).token; } catch { return null; }
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(url, options = {}) {
  const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_BASE = import.meta.env.VITE_API_URL || (IS_LOCAL ? 'http://localhost:3001' : '');
  const res = await fetch(API_BASE + url, {
    ...options,
    headers: { ...authHeaders(), ...(options.headers || {}) }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Request failed');
  return data.data;
}

async function requestFormData(url, options = {}) {
  const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const API_BASE = import.meta.env.VITE_API_URL || (IS_LOCAL ? 'http://localhost:3001' : '');
  const token = getToken();
  const res = await fetch(API_BASE + url, {
    ...options,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.error || 'Request failed');
  return data.data;
}

const api = {
  // ── AUTH ──────────────────────────────────────────────
  login: (email) =>
    request(`${MINT_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ email })
    }),

  register: (name, email, sport, team) =>
    request(`${MINT_BASE}/auth/register`, {
      method: 'POST',
      body: JSON.stringify({ name, email, sport, team })
    }),

  updateProfile: (userId, sport, team) =>
    request(`${MINT_BASE}/auth/profile/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ sport, team })
    }),

  // ── WALLET ────────────────────────────────────────────
  getBalance: (userId) =>
    request(`${MINT_BASE}/wallet/${userId}/balance`),

  // ── GAMES ─────────────────────────────────────────────
  recordGameSession: ({ userId, gameId, betAmount, result, payout, gameData }) =>
    request(`${GAMING_BASE}/sessions`, {
      method: 'POST',
      body: JSON.stringify({ userId, gameId, betAmount, result, payout, gameData })
    }),

  getGameHistory: (userId) =>
    request(`${GAMING_BASE}/sessions/${userId}`),

  // ── CONTESTS ──────────────────────────────────────────
  getContests: (params = {}) => {
    const p = typeof params === 'string' ? { status: params } : params;
    const qs = new URLSearchParams(p).toString();
    return request(`${GAMING_BASE}/contests${qs ? '?' + qs : ''}`);
  },

  getContest: (id) =>
    request(`${GAMING_BASE}/contests/${id}`),

  enterContest: (contestId, userId, selections = {}) =>
    request(`${GAMING_BASE}/contests/${contestId}/enter`, {
      method: 'POST',
      body: JSON.stringify({ userId, selections })
    }),

  getUserContests: (userId) =>
    request(`${GAMING_BASE}/contests/user/${userId}`),

  // ── LEADERBOARD ───────────────────────────────────────
  getLeaderboard: (type = 'global') =>
    request(`${GAMING_BASE}/contests/leaderboards/${type}`),

  // ── MARKETPLACE (legacy) ──────────────────────────────
  registerMerchant: (data) =>
    request('/api/merchants', { method: 'POST', body: JSON.stringify(data) }),

  getMerchants: () =>
    request('/api/merchants'),

  getClubs: () =>
    request('/api/v2/marketplace/clubs'),

  getClub: (slugOrId) =>
    request(`/api/v2/marketplace/clubs/${slugOrId}`),

  applyClub: (data) =>
    request('/api/v2/marketplace/clubs/apply', { method: 'POST', body: JSON.stringify(data) }),

  getClubDashboard: (tenantId) =>
    request(`/api/v2/marketplace/clubs/${tenantId}/dashboard`),

  getProducts: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/v2/marketplace/products${qs ? '?' + qs : ''}`);
  },

  getProduct: (id) =>
    request(`/api/v2/marketplace/products/${id}`),

  getCategories: () =>
    request('/api/v2/marketplace/products/meta/categories'),

  placeOrder: (data) =>
    request('/api/v2/marketplace/orders', { method: 'POST', body: JSON.stringify(data) }),

  getOrder: (id) =>
    request(`/api/v2/marketplace/orders/${id}`),

  // ── REWARDS ───────────────────────────────────────────
  getRewardPools: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/api/v2/betting/pools${qs ? '?' + qs : ''}`);
  },

  getRewardPool: (id) =>
    request(`/api/v2/betting/pools/${id}`),

  joinRewardPool: (poolId, userId, selectedOption, stakePcc) =>
    request(`/api/v2/betting/pools/${poolId}/bet`, { method: 'POST', body: JSON.stringify({ userId, selectedOption, stakePcc }) }),

  getUserRewards: (userId) =>
    request(`/api/v2/betting/pools/user/${userId}`),

  // ── SOCIAL POSTS ──────────────────────────────────────
  getFeed: (limit = 20, offset = 0) =>
    request(`/api/posts?limit=${limit}&offset=${offset}`),

  getPost: (id) =>
    request(`/api/posts/${id}`),

  createPost: (formData) =>
    requestFormData('/api/posts', { method: 'POST', body: formData }),

  updatePost: (id, formData) =>
    requestFormData(`/api/posts/${id}`, { method: 'PUT', body: formData }),

  deletePost: (id) =>
    request(`/api/posts/${id}`, { method: 'DELETE' }),

  toggleLike: (id) =>
    request(`/api/posts/${id}/like`, { method: 'POST' }),

  getComments: (id, limit = 50, offset = 0) =>
    request(`/api/posts/${id}/comments?limit=${limit}&offset=${offset}`),

  addComment: (id, content) =>
    request(`/api/posts/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),

  updateComment: (commentId, content) =>
    request(`/api/posts/comments/${commentId}`, { method: 'PUT', body: JSON.stringify({ content }) }),

  deleteComment: (commentId) =>
    request(`/api/posts/comments/${commentId}`, { method: 'DELETE' }),

  // ── CHAT PROFILES ─────────────────────────────────────
  updateChatProfile: (username, avatarUrl) =>
    request('/api/chat/profile', { method: 'POST', body: JSON.stringify({ username, avatarUrl }) }),

  uploadAvatar: (formData) =>
    requestFormData('/api/chat/avatar', { method: 'POST', body: formData }),
};

export default api;
