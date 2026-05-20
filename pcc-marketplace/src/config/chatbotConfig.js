// ═══════════════════════════════════════════════════════════════
//  Club Chatbot Configuration
//  Per-club persona, greeting, suggested questions & theme colors
// ═══════════════════════════════════════════════════════════════

export const CLUB_CHATBOT_CONFIG = {
  'real-madrid': {
    id: 'real-madrid',
    name: 'Real Madrid',
    persona: 'Arrogant and royal - speaks with the authority of 15 Champions League titles and absolute supremacy.',
    greeting: 'Welcome to the kingdom of Real Madrid. You stand before the most decorated club in football history - ask me anything, if you dare.',
    suggestedQuestions: [
      'Who is your best player?',
      'Show me your jerseys',
      'Tell me about your trophies',
    ],
    theme: {
      headerBg: 'linear-gradient(145deg, #001489 0%, #000833 100%)',
      accentColor: '#D4AF37',
      primaryColor: '#FFFFFF',
      bubbleUser: '#D4AF37',
      bubbleBot: '#001a4d',
      bubbleUserText: '#000000',
      glowColor: 'rgba(212,175,55,0.4)',
      inputBg: 'rgba(0,0,0,0.4)',
    },
  },

  'fc-barcelona': {
    id: 'fc-barcelona',
    name: 'FC Barcelona',
    persona: 'Passionate Catalan - proud, poetic, fiercely loyal to the Blaugrana identity and tiki-taka philosophy.',
    greeting: 'Hola, Culer! Welcome to FC Barcelona - més que un club. Ask me anything about the greatest football family on earth.',
    suggestedQuestions: [
      'Tell me about Lamine Yamal',
      'What merchandise do you have?',
      'How can I get fan tokens?',
    ],
    theme: {
      headerBg: 'linear-gradient(145deg, #A50044 0%, #2d0018 100%)',
      accentColor: '#EDBB00',
      primaryColor: '#A50044',
      bubbleUser: '#EDBB00',
      bubbleBot: '#1a0030',
      bubbleUserText: '#000000',
      glowColor: 'rgba(165,0,68,0.4)',
      inputBg: 'rgba(0,0,0,0.4)',
    },
  },

  'psg': {
    id: 'psg',
    name: 'Paris Saint-Germain',
    persona: 'Parisian chic - glamorous, confident, cosmopolitan with a touch of French elegance.',
    greeting: 'Bienvenue! Ici c\'est Paris. I am the voice of Paris Saint-Germain - ask me anything about the most glamorous club in football.',
    suggestedQuestions: [
      'Who is your best player?',
      'Show me collectibles',
      'Tell me about your stadium',
    ],
    theme: {
      headerBg: 'linear-gradient(145deg, #004170 0%, #001030 100%)',
      accentColor: '#DA291C',
      primaryColor: '#004170',
      bubbleUser: '#DA291C',
      bubbleBot: '#001a3a',
      bubbleUserText: '#FFFFFF',
      glowColor: 'rgba(218,41,28,0.4)',
      inputBg: 'rgba(0,0,0,0.4)',
    },
  },

  'manchester-city': {
    id: 'manchester-city',
    name: 'Manchester City',
    persona: 'Data-driven and calm - analytical, measured, speaks with quiet confidence backed by tactical perfection.',
    greeting: 'Welcome to Manchester City. Precision, possession, perfection - that\'s our way. What would you like to know about the Cityzens?',
    suggestedQuestions: [
      'Tell me about Haaland',
      'What products do you have?',
      'Tell me about your trophies',
    ],
    theme: {
      headerBg: 'linear-gradient(145deg, #1C2C5B 0%, #0a1530 100%)',
      accentColor: '#6CABDD',
      primaryColor: '#6CABDD',
      bubbleUser: '#6CABDD',
      bubbleBot: '#0d1e3d',
      bubbleUserText: '#000000',
      glowColor: 'rgba(108,171,221,0.4)',
      inputBg: 'rgba(0,0,0,0.4)',
    },
  },

  'liverpool': {
    id: 'liverpool',
    name: 'Liverpool FC',
    persona: 'Working-class passionate - fiery, emotional, speaks with the heart of Anfield and the soul of the Kop.',
    greeting: 'You\'ll Never Walk Alone! Welcome to Liverpool FC. From the Kop to the world - ask me anything, Red.',
    suggestedQuestions: [
      'Who is your best player?',
      'Show me your hoodies',
      'When was Liverpool founded?',
    ],
    theme: {
      headerBg: 'linear-gradient(145deg, #C8102E 0%, #4a0510 100%)',
      accentColor: '#C8102E',
      primaryColor: '#C8102E',
      bubbleUser: '#C8102E',
      bubbleBot: '#1a0008',
      bubbleUserText: '#FFFFFF',
      glowColor: 'rgba(200,16,46,0.4)',
      inputBg: 'rgba(0,0,0,0.4)',
    },
  },

  'bayern-munich': {
    id: 'bayern-munich',
    name: 'Bayern Munich',
    persona: 'Disciplined and powerful - commanding, efficient, speaks with Bavarian authority and relentless winning mentality.',
    greeting: 'Mia san mia! Welcome to FC Bayern München. We are who we are - champions. What do you want to know?',
    suggestedQuestions: [
      'Tell me about Harry Kane',
      'Show me jerseys',
      'How can I get fan tokens?',
    ],
    theme: {
      headerBg: 'linear-gradient(145deg, #DC052D 0%, #500a15 100%)',
      accentColor: '#DC052D',
      primaryColor: '#DC052D',
      bubbleUser: '#DC052D',
      bubbleBot: '#1a0008',
      bubbleUserText: '#FFFFFF',
      glowColor: 'rgba(220,5,45,0.4)',
      inputBg: 'rgba(0,0,0,0.4)',
    },
  },

  'chelsea': {
    id: 'chelsea',
    name: 'Chelsea FC',
    persona: 'Proud and historic - dignified, ambitious, speaks with London swagger and a hunger for silverware.',
    greeting: 'Keep the Blue Flag Flying High! Welcome to Chelsea FC. From Stamford Bridge to the world - what can I tell you?',
    suggestedQuestions: [
      'Tell me about Cole Palmer',
      'What merchandise do you have?',
      'Tell me about your trophies',
    ],
    theme: {
      headerBg: 'linear-gradient(145deg, #034694 0%, #011a40 100%)',
      accentColor: '#D4AF37',
      primaryColor: '#034694',
      bubbleUser: '#D4AF37',
      bubbleBot: '#011228',
      bubbleUserText: '#000000',
      glowColor: 'rgba(3,70,148,0.5)',
      inputBg: 'rgba(0,0,0,0.4)',
    },
  },
};

/**
 * Get chatbot config for a specific club.
 * @param {string} clubId - club ID key (e.g. 'real-madrid')
 * @returns {object|null} - config object or null if not found
 */
export function getClubChatConfig(clubId) {
  return CLUB_CHATBOT_CONFIG[clubId] || null;
}
