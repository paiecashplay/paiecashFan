// AI Agent Commerce V6.0 - Agent IA conversationnel multilingue
class AIAgentCommerce {
    constructor() {
        this.currentLanguage = 'fr';
        this.languages = {
            fr: { name: 'Français', flag: '🇫🇷' },
            en: { name: 'English', flag: '🇬🇧' },
            es: { name: 'Español', flag: '🇪🇸' },
            de: { name: 'Deutsch', flag: '🇩🇪' },
            it: { name: 'Italiano', flag: '🇮🇹' },
            ar: { name: 'العربية', flag: '🇸🇦' },
            zh: { name: '中文', flag: '🇨🇳' }
        };
        
        this.responses = {
            fr: {
                greeting: "👋 Salut ! Je suis ton assistant IA. Je peux t'aider à acheter des maillots, billets NFT, et bien plus ! Que cherches-tu aujourd'hui ?",
                jersey: "🎽 Super ! Voici nos maillots disponibles. Lequel t'intéresse ?",
                ticket: "🎫 Génial ! Je peux te proposer des billets de 45€ à 299€ (VIP). Quelle catégorie préfères-tu ?",
                goodies: "🎁 Nous avons : 🧢 Casquette (24.99€), 🎒 Sac à dos (49.99€), 🧣 Écharpe (19.99€)",
                help: "Je peux t'aider avec : 👕 Maillots, 🎫 Billets NFT, 🧢 Goodies, 💳 Paiements"
            },
            en: {
                greeting: "👋 Hi! I'm your AI assistant. I can help you buy jerseys, NFT tickets, and more! What are you looking for today?",
                jersey: "🎽 Great! Here are our available jerseys. Which one interests you?",
                ticket: "🎫 Awesome! I can offer you tickets from €45 to €299 (VIP). Which category do you prefer?",
                goodies: "🎁 We have: 🧢 Cap (€24.99), 🎒 Backpack (€49.99), 🧣 Scarf (€19.99)",
                help: "I can help you with: 👕 Jerseys, 🎫 NFT Tickets, 🧢 Goodies, 💳 Payments"
            },
            es: {
                greeting: "👋 ¡Hola! Soy tu asistente IA. ¡Puedo ayudarte a comprar camisetas, entradas NFT y más! ¿Qué buscas hoy?",
                jersey: "🎽 ¡Genial! Aquí están nuestras camisetas disponibles. ¿Cuál te interesa?",
                ticket: "🎫 ¡Excelente! Puedo ofrecerte entradas desde 45€ hasta 299€ (VIP). ¿Qué categoría prefieres?",
                goodies: "🎁 Tenemos: 🧢 Gorra (24.99€), 🎒 Mochila (49.99€), 🧣 Bufanda (19.99€)",
                help: "Puedo ayudarte con: 👕 Camisetas, 🎫 Entradas NFT, 🧢 Merchandising, 💳 Pagos"
            }
        };
    }

    setLanguage(lang) {
        if (this.languages[lang]) {
            this.currentLanguage = lang;
            return true;
        }
        return false;
    }

    getResponse(userMessage) {
        const message = userMessage.toLowerCase();
        const responses = this.responses[this.currentLanguage] || this.responses.fr;

        if (message.includes('maillot') || message.includes('jersey') || message.includes('camiseta')) {
            return responses.jersey;
        } else if (message.includes('billet') || message.includes('ticket') || message.includes('entrada')) {
            return responses.ticket;
        } else if (message.includes('casquette') || message.includes('cap') || message.includes('gorra') || 
                   message.includes('goodies') || message.includes('merchandise')) {
            return responses.goodies;
        } else {
            return responses.help;
        }
    }

    getGreeting() {
        const responses = this.responses[this.currentLanguage] || this.responses.fr;
        return responses.greeting;
    }

    getAvailableLanguages() {
        return this.languages;
    }
}

window.aiAgent = new AIAgentCommerce();
console.log('✅ AI Agent Commerce V6.0 chargé');
