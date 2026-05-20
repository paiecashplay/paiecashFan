import { GAMES } from './gamesData';

// Mock leaderboard entries per game
export const LEADERBOARDS = {
  'aviator': [
    { rank: 1, name: 'Themba K.', avatar: '🦁', cashOutAt: '14.2x', won: 142, country: 'ZA' },
    { rank: 2, name: 'Priya S.',  avatar: '🌸', cashOutAt: '9.8x',  won: 98,  country: 'IN' },
    { rank: 3, name: 'Marco D.',  avatar: '🦅', cashOutAt: '8.1x',  won: 81,  country: 'ZA' },
    { rank: 4, name: 'Aisha M.',  avatar: '💫', cashOutAt: '6.5x',  won: 65,  country: 'ZA' },
    { rank: 5, name: 'Dev P.',    avatar: '⚡', cashOutAt: '5.9x',  won: 59,  country: 'IN' },
    { rank: 6, name: 'Sipho N.',  avatar: '🔥', cashOutAt: '4.4x',  won: 44,  country: 'ZA' },
    { rank: 7, name: 'Lena V.',   avatar: '🌙', cashOutAt: '3.7x',  won: 37,  country: 'ZA' },
    { rank: 8, name: 'Raj T.',    avatar: '🎯', cashOutAt: '3.1x',  won: 31,  country: 'IN' },
  ],
  'slots': [
    { rank: 1, name: 'Zanele B.', avatar: '👑', combo: '💎💎💎', won: 100, country: 'ZA' },
    { rank: 2, name: 'Arjun M.',  avatar: '🎰', combo: '7️⃣7️⃣7️⃣',   won: 75,  country: 'IN' },
    { rank: 3, name: 'Naledi P.', avatar: '⭐', combo: '⭐⭐⭐', won: 60,  country: 'ZA' },
    { rank: 4, name: 'Omar K.',   avatar: '🪙', combo: '🪙🪙🪙', won: 45,  country: 'ZA' },
    { rank: 5, name: 'Fatima R.', avatar: '🍇', combo: '🍇🍇🍇', won: 30,  country: 'ZA' },
    { rank: 6, name: 'Kiran J.',  avatar: '🍊', combo: '🍊🍊🍊', won: 24,  country: 'IN' },
    { rank: 7, name: 'Bongani T.',avatar: '🍋', combo: '🍋🍋🍋', won: 15,  country: 'ZA' },
    { rank: 8, name: 'Yash P.',   avatar: '🍒', combo: '🍒🍒🍒', won: 9,   country: 'IN' },
  ],
  'roulette': [
    { rank: 1, name: 'Lungile M.',avatar: '🎡', bet: 'Red', number: 32, won: 80, country: 'ZA' },
    { rank: 2, name: 'Siya D.',   avatar: '🔴', bet: '3rd 12', number: 33, won: 60, country: 'ZA' },
    { rank: 3, name: 'Rohan S.',  avatar: '⚫', bet: 'Odd', number: 17, won: 50, country: 'IN' },
    { rank: 4, name: 'Mpho K.',   avatar: '🎯', bet: 'Black', number: 26, won: 40, country: 'ZA' },
    { rank: 5, name: 'Ananya T.', avatar: '🌺', bet: '1st 12', number: 7, won: 36, country: 'IN' },
    { rank: 6, name: 'Kabelo N.', avatar: '💎', bet: 'Even', number: 14, won: 30, country: 'ZA' },
    { rank: 7, name: 'Vikram P.', avatar: '🔮', bet: '2nd 12', number: 20, won: 27, country: 'IN' },
    { rank: 8, name: 'Thandeka Z.',avatar:'🌟', bet: 'High', number: 28, won: 20, country: 'ZA' },
  ]
};

// Mock personal session history for "My Games" tab
export const MY_SESSIONS = [
  { id: 1, gameId: 'aviator', gameName: 'Aviator', emoji: '🚀',
    result: 'win', amount: +47.50, multiplier: '9.5x', timestamp: new Date(Date.now() - 1000*60*5) },
  { id: 2, gameId: 'slots', gameName: 'PCC Slots', emoji: '🎰',
    result: 'loss', amount: -2, combo: 'No match', timestamp: new Date(Date.now() - 1000*60*18) },
  { id: 3, gameId: 'roulette', gameName: 'PCC Roulette', emoji: '🎡',
    result: 'win', amount: +6, bet: 'Red', number: 18, timestamp: new Date(Date.now() - 1000*60*34) },
  { id: 4, gameId: 'aviator', gameName: 'Aviator', emoji: '🚀',
    result: 'loss', amount: -5, multiplier: 'Crashed 1.4x', timestamp: new Date(Date.now() - 1000*60*60) },
  { id: 5, gameId: 'slots', gameName: 'PCC Slots', emoji: '🎰',
    result: 'win', amount: +20, combo: '⭐⭐⭐', timestamp: new Date(Date.now() - 1000*60*90) },
  { id: 6, gameId: 'roulette', gameName: 'PCC Roulette', emoji: '🎡',
    result: 'loss', amount: -3, bet: 'Black', number: 7, timestamp: new Date(Date.now() - 1000*60*120) },
];

// Mock PCC transaction ledger
export const PCC_TRANSACTIONS = [
  { id: 1, type: 'credit', label: 'Aviator Win',        amount: +47.50, balance: 297.50, timestamp: new Date(Date.now() - 1000*60*5),   icon: '🏆' },
  { id: 2, type: 'debit',  label: 'Aviator Entry',      amount: -5,     balance: 250.00, timestamp: new Date(Date.now() - 1000*60*5),   icon: '🎟' },
  { id: 3, type: 'debit',  label: 'Slots Entry',        amount: -2,     balance: 255.00, timestamp: new Date(Date.now() - 1000*60*18),  icon: '🎟' },
  { id: 4, type: 'credit', label: 'Roulette Win',       amount: +6,     balance: 257.00, timestamp: new Date(Date.now() - 1000*60*34),  icon: '🏆' },
  { id: 5, type: 'debit',  label: 'Roulette Entry',     amount: -3,     balance: 251.00, timestamp: new Date(Date.now() - 1000*60*34),  icon: '🎟' },
  { id: 6, type: 'debit',  label: 'Aviator Entry',      amount: -5,     balance: 254.00, timestamp: new Date(Date.now() - 1000*60*60),  icon: '🎟' },
  { id: 7, type: 'credit', label: 'Slots Win',          amount: +20,    balance: 259.00, timestamp: new Date(Date.now() - 1000*60*90),  icon: '🏆' },
  { id: 8, type: 'debit',  label: 'Slots Entry',        amount: -2,     balance: 239.00, timestamp: new Date(Date.now() - 1000*60*90),  icon: '🎟' },
  { id: 9, type: 'credit', label: 'PCC Purchase (Mint)',amount: +100,   balance: 241.00, timestamp: new Date(Date.now() - 1000*60*180), icon: '🪙' },
  { id:10, type: 'debit',  label: 'Roulette Entry',     amount: -3,     balance: 141.00, timestamp: new Date(Date.now() - 1000*60*200), icon: '🎟' },
];

export function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}
