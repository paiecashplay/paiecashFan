// ═══════════════════════════════════════════════════════════════
//  Club Chatbot - Local Response Engine
//  Generates intelligent replies using clubThemes data
//  No API needed - fully offline using existing club metadata
// ═══════════════════════════════════════════════════════════════

import { getClubTheme, getClubProducts } from '../../clubThemes';
import { getClubChatConfig } from '../../config/chatbotConfig';

/**
 * Generate a contextual bot reply based on user input and club data.
 * @param {string} clubId
 * @param {string} userMessage
 * @returns {string} bot reply text
 */
export function generateBotReply(clubId, userMessage) {
  const theme = getClubTheme(clubId);
  const config = getClubChatConfig(clubId);
  if (!theme || !config) return "I couldn't find information about this club. Try again later.";

  const msg = userMessage.toLowerCase().trim();
  const name = theme.name;

  // ── Best Player / Star Player ──
  if (matches(msg, ['best player', 'star player', 'top player', 'who is your best', 'favourite player', 'favorite player', 'best footballer'])) {
    const top = theme.squad?.[0];
    if (!top) return `${name} has an incredible squad, but I don't have detailed player stats right now.`;
    return `🔥 Our star is **${top.name}** - ${top.position} #${top.number}. This season: ${top.goals} goals and ${top.assists} assists. Absolutely world-class! ${top.emoji}`;
  }

  // ── Squad / Team ──
  if (matches(msg, ['squad', 'team', 'players', 'lineup', 'roster', 'who plays'])) {
    if (!theme.squad?.length) return `${name} has a world-class squad. Check back for detailed roster info!`;
    const list = theme.squad.slice(0, 6).map(p => `${p.emoji} ${p.name} (${p.position}, #${p.number})`).join('\n');
    return `⚽ Here's our squad spotlight:\n\n${list}\n\n...and more elite talent on the bench!`;
  }

  // ── Specific Player Search ──
  if (matches(msg, ['tell me about', 'info on', 'stats for', 'how is', 'what about'])) {
    const player = findPlayer(theme.squad, msg);
    if (player) {
      return `${player.emoji} **${player.name}** - ${player.position} #${player.number}\n⚽ ${player.goals} goals | 🅰️ ${player.assists} assists this season.\nA key part of ${name}'s setup!`;
    }
  }

  // ── Trophies ──
  if (matches(msg, ['trophies', 'trophy', 'titles', 'how many', 'achievements', 'honours', 'honors', 'cups', 'silverware', 'won'])) {
    if (!theme.trophies) return `${name} has a glorious trophy cabinet. The details are coming soon!`;
    const list = Object.values(theme.trophies)
      .map(t => `${t.icon} ${t.label}: **${t.count}**`)
      .join('\n');
    return `🏆 ${name}'s Trophy Cabinet:\n\n${list}\n\nLegendary!`;
  }

  // ── Fan Tokens ──
  if (matches(msg, ['fan token', 'tokens', 'how can i get', 'pcc token', 'buy token', 'earn token'])) {
    return `🪙 **${name} Fan Tokens**\n\n${theme.fanTokens} tokens are in circulation! You can earn fan tokens by:\n\n• Shopping club merchandise with PCC\n• Participating in club contests & predictions\n• Holding PCC in your wallet during match days\n\nFan tokens unlock exclusive voting rights, VIP access, and rewards.`;
  }

  // ── Products / Merchandise / Shop ──
  if (matches(msg, ['product', 'merchandise', 'merch', 'shop', 'buy', 'jersey', 'hoodie', 'shirt', 'store', 'gear', 'kit', 'scarf', 'cap', 'collectible'])) {
    const products = getClubProducts(clubId);
    if (!products?.length) return `Our ${name} store is getting stocked. Check back soon!`;

    // Check for specific category
    if (matches(msg, ['jersey', 'kit'])) {
      const jerseys = products.filter(p => p.category === 'Jersey');
      const list = jerseys.map(p => `${p.emoji} ${p.name} - **${p.price} PCC**`).join('\n');
      return `👕 **${name} Jerseys:**\n\n${list}\n\nGrab yours from the store below! ⬇️`;
    }
    if (matches(msg, ['hoodie', 'hoodies'])) {
      const hoodies = products.filter(p => p.category === 'Hoodie');
      const list = hoodies.map(p => `${p.emoji} ${p.name} - **${p.price} PCC**`).join('\n');
      return `🧥 **${name} Hoodies:**\n\n${list}\n\nPerfect for match day!`;
    }
    if (matches(msg, ['collectible', 'collector', 'watch', 'ball', 'stadium', 'rare'])) {
      const collectibles = products.filter(p => p.category === 'Collectible');
      const list = collectibles.map(p => `${p.emoji} ${p.name} - **${p.price} PCC**`).join('\n');
      return `✨ **${name} Collectibles:**\n\n${list}\n\nLimited edition items for true fans!`;
    }

    // General merch overview
    const categories = [...new Set(products.map(p => p.category))];
    const cheapest = products.reduce((min, p) => p.price < min.price ? p : min, products[0]);
    const premium = products.reduce((max, p) => p.price > max.price ? p : max, products[0]);
    return `🛒 **${name} Store** - ${products.length} products available!\n\nCategories: ${categories.join(', ')}\n💰 Starting from **${cheapest.price} PCC** (${cheapest.name})\n👑 Premium: **${premium.price} PCC** (${premium.name})\n\nScroll down to browse and add to cart!`;
  }

  // ── Stadium ──
  if (matches(msg, ['stadium', 'ground', 'home ground', 'where do you play', 'arena', 'venue'])) {
    return `🏟️ **${theme.stadium}**\n\nThe legendary home of ${name}. Built for glory, filled with passion on every match day. There's no atmosphere quite like it!`;
  }

  // ── Manager / Coach ──
  if (matches(msg, ['manager', 'coach', 'head coach', 'who manages', 'who coaches', 'gaffer'])) {
    return `📋 Our manager is **${theme.manager}**. Leading ${name} with tactical brilliance and a winning mentality! 💪`;
  }

  // ── League / Competition ──
  if (matches(msg, ['league', 'competition', 'what league', 'which league', 'division'])) {
    return `⚽ ${name} competes in the **${theme.league}** ${theme.country}.\n\nOne of the elite clubs in world football!`;
  }

  // ── History / Founded ──
  if (matches(msg, ['founded', 'history', 'when was', 'how old', 'year', 'origin', 'established'])) {
    const age = new Date().getFullYear() - theme.founded;
    return `📜 **${name}** was founded in **${theme.founded}** - that's ${age} years of footballing greatness!\n\n${theme.description}`;
  }

  // ── Price / How much ──
  if (matches(msg, ['how much', 'price', 'cost', 'cheapest', 'expensive', 'affordable'])) {
    const products = getClubProducts(clubId);
    if (!products?.length) return `Check the store section below for prices!`;
    const cheapest = products.reduce((min, p) => p.price < min.price ? p : min, products[0]);
    const premium = products.reduce((max, p) => p.price > max.price ? p : max, products[0]);
    return `💰 **${name} Price Range:**\n\nMost affordable: ${cheapest.emoji} ${cheapest.name} - **${cheapest.price} PCC**\nPremium: ${premium.emoji} ${premium.name} - **${premium.price} PCC**\n\nAll prices in PCC. Scroll down to shop!`;
  }

  // ── Greetings ──
  if (matches(msg, ['hi', 'hello', 'hey', 'sup', 'yo', 'good morning', 'good evening', 'howdy'])) {
    return config.greeting;
  }

  // ── Thanks ──
  if (matches(msg, ['thank', 'thanks', 'cheers', 'appreciate'])) {
    return `You're welcome! I'm here for everything ${name}. Ask me about players, merchandise, trophies, or anything else! ⚽`;
  }

  // ── Help / What can you do ──
  if (matches(msg, ['help', 'what can you', 'what do you know', 'options', 'menu', 'commands'])) {
    return `I can help you with:\n\n⚽ **Squad & Players** - "Who is your best player?"\n🏆 **Trophies** - "Tell me about your trophies"\n🛒 **Merchandise** - "Show me jerseys" or "What products do you have?"\n🪙 **Fan Tokens** - "How can I get fan tokens?"\n🏟️ **Stadium** - "Tell me about your stadium"\n📋 **Manager** - "Who is your manager?"\n📜 **History** - "When was ${name} founded?"\n\nJust ask naturally!`;
  }

  // ── Fallback ──
  const fallbacks = [
    `Great question! I know a lot about ${name}. Try asking about our squad, trophies, merchandise, or fan tokens! ⚽`,
    `I'm still learning! Ask me about ${name}'s players, products, history, or trophies - I've got you covered. 💪`,
    `Hmm, I'm not sure about that one. But I can tell you about ${name}'s squad, merchandise, or achievements! Try one of those. 🏆`,
  ];
  return fallbacks[Math.floor(Math.random() * fallbacks.length)];
}

// ── Helper: keyword matching ──
function matches(msg, keywords) {
  return keywords.some(k => msg.includes(k));
}

// ── Helper: find a player by name in a message ──
function findPlayer(squad, msg) {
  if (!squad?.length) return null;
  return squad.find(p => {
    const names = p.name.toLowerCase().split(' ');
    return names.some(n => n.length > 2 && msg.includes(n));
  });
}
