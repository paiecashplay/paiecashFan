// ========================================
// IA VOCALE MULTILINGUE - 8 LANGUES
// Reconnaissance vocale + Synthèse vocale
// ========================================

class AIVoiceMultilingual {
    constructor() {
        this.currentLanguage = 'fr';
        this.isRecording = false;
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        
        // 8 langues supportées
        this.languages = {
            fr: { name: 'Français', flag: '🇫🇷', code: 'fr-FR' },
            en: { name: 'English', flag: '🇬🇧', code: 'en-US' },
            es: { name: 'Español', flag: '🇪🇸', code: 'es-ES' },
            de: { name: 'Deutsch', flag: '🇩🇪', code: 'de-DE' },
            it: { name: 'Italiano', flag: '🇮🇹', code: 'it-IT' },
            ar: { name: 'العربية', flag: '🇸🇦', code: 'ar-SA' },
            zh: { name: '中文', flag: '🇨🇳', code: 'zh-CN' },
            ja: { name: '日本語', flag: '🇯🇵', code: 'ja-JP' }
        };
        
        // Réponses multilingues
        this.responses = {
            fr: {
                greeting: "👋 Salut ! Je suis ton assistant IA PaieCashFan. Comment puis-je t'aider aujourd'hui ?",
                billets: "🎫 Super ! Je peux t'aider à réserver des billets. Veux-tu voir les prochains matchs ?",
                boutique: "🛍️ Génial ! Notre boutique officielle propose des maillots, écharpes, et bien plus. Que cherches-tu ?",
                wallet: "💰 Ton wallet PaieCashPlay te permet de gérer tes PFC Coins. Solde actuel : 2,450 PFC.",
                fidelite: "💎 Tu as 4,250 points de fidélité ! Niveau Platine. Continue comme ça !",
                help: "Je peux t'aider avec : 🎫 Billets, 🛍️ Boutique, 💰 Wallet, 💎 Fidélité, ⚽ Infos club"
            },
            en: {
                greeting: "👋 Hi! I'm your PaieCashFan AI assistant. How can I help you today?",
                billets: "🎫 Great! I can help you book tickets. Want to see upcoming matches?",
                boutique: "🛍️ Awesome! Our official store has jerseys, scarves, and more. What are you looking for?",
                wallet: "💰 Your PaieCashPlay wallet manages your PFC Coins. Current balance: 2,450 PFC.",
                fidelite: "💎 You have 4,250 loyalty points! Platinum level. Keep it up!",
                help: "I can help with: 🎫 Tickets, 🛍️ Shop, 💰 Wallet, 💎 Loyalty, ⚽ Club info"
            },
            es: {
                greeting: "👋 ¡Hola! Soy tu asistente IA PaieCashFan. ¿Cómo puedo ayudarte hoy?",
                billets: "🎫 ¡Genial! Puedo ayudarte a reservar entradas. ¿Quieres ver los próximos partidos?",
                boutique: "🛍️ ¡Excelente! Nuestra tienda oficial tiene camisetas, bufandas y más. ¿Qué buscas?",
                wallet: "💰 Tu cartera PaieCashPlay gestiona tus PFC Coins. Saldo actual: 2,450 PFC.",
                fidelite: "💎 ¡Tienes 4,250 puntos de fidelidad! Nivel Platino. ¡Sigue así!",
                help: "Puedo ayudar con: 🎫 Entradas, 🛍️ Tienda, 💰 Cartera, 💎 Fidelidad, ⚽ Info club"
            },
            de: {
                greeting: "👋 Hallo! Ich bin dein PaieCashFan KI-Assistent. Wie kann ich dir heute helfen?",
                billets: "🎫 Super! Ich kann dir bei der Ticketbuchung helfen. Möchtest du kommende Spiele sehen?",
                boutique: "🛍️ Toll! Unser offizieller Shop hat Trikots, Schals und mehr. Was suchst du?",
                wallet: "💰 Deine PaieCashPlay Wallet verwaltet deine PFC Coins. Aktuelles Guthaben: 2.450 PFC.",
                fidelite: "💎 Du hast 4.250 Treuepunkte! Platin-Level. Mach weiter so!",
                help: "Ich kann helfen mit: 🎫 Tickets, 🛍️ Shop, 💰 Wallet, 💎 Treue, ⚽ Club-Info"
            },
            it: {
                greeting: "👋 Ciao! Sono il tuo assistente IA PaieCashFan. Come posso aiutarti oggi?",
                billets: "🎫 Fantastico! Posso aiutarti a prenotare biglietti. Vuoi vedere le prossime partite?",
                boutique: "🛍️ Ottimo! Il nostro negozio ufficiale ha maglie, sciarpe e altro. Cosa cerchi?",
                wallet: "💰 Il tuo wallet PaieCashPlay gestisce i tuoi PFC Coins. Saldo attuale: 2.450 PFC.",
                fidelite: "💎 Hai 4.250 punti fedeltà! Livello Platino. Continua così!",
                help: "Posso aiutare con: 🎫 Biglietti, 🛍️ Negozio, 💰 Wallet, 💎 Fedeltà, ⚽ Info club"
            },
            ar: {
                greeting: "👋 مرحبا! أنا مساعدك الذكي PaieCashFan. كيف يمكنني مساعدتك اليوم؟",
                billets: "🎫 رائع! يمكنني مساعدتك في حجز التذاكر. هل تريد رؤية المباريات القادمة؟",
                boutique: "🛍️ ممتاز! متجرنا الرسمي يحتوي على قمصان ووشاحات والمزيد. ماذا تبحث عنه؟",
                wallet: "💰 محفظتك PaieCashPlay تدير عملاتك PFC. الرصيد الحالي: 2,450 PFC.",
                fidelite: "💎 لديك 4,250 نقطة ولاء! مستوى بلاتيني. استمر هكذا!",
                help: "يمكنني المساعدة في: 🎫 التذاكر، 🛍️ المتجر، 💰 المحفظة، 💎 الولاء، ⚽ معلومات النادي"
            },
            zh: {
                greeting: "👋 你好！我是你的PaieCashFan AI助手。今天我能帮你什么？",
                billets: "🎫 太好了！我可以帮你预订门票。想看即将到来的比赛吗？",
                boutique: "🛍️ 太棒了！我们的官方商店有球衣、围巾等。你在找什么？",
                wallet: "💰 你的PaieCashPlay钱包管理你的PFC Coins。当前余额：2,450 PFC。",
                fidelite: "💎 你有4,250积分！白金级别。继续保持！",
                help: "我可以帮助：🎫 门票、🛍️ 商店、💰 钱包、💎 忠诚度、⚽ 俱乐部信息"
            },
            ja: {
                greeting: "👋 こんにちは！私はPaieCashFan AIアシスタントです。今日はどのようにお手伝いしましょうか？",
                billets: "🎫 素晴らしい！チケット予約をお手伝いできます。今後の試合を見たいですか？",
                boutique: "🛍️ 素晴らしい！公式ショップにはジャージ、スカーフなどがあります。何をお探しですか？",
                wallet: "💰 PaieCashPlayウォレットでPFC Coinsを管理します。現在の残高：2,450 PFC。",
                fidelite: "💎 4,250ポイントあります！プラチナレベル。その調子で！",
                help: "お手伝いできること：🎫 チケット、🛍️ ショップ、💰 ウォレット、💎 ロイヤルティ、⚽ クラブ情報"
            }
        };
        
        // Initialiser la reconnaissance vocale
        this.initRecognition();
    }
    
    // Initialiser la reconnaissance vocale
    initRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = this.languages[this.currentLanguage].code;
        }
    }
    
    // Changer de langue
    setLanguage(lang) {
        if (this.languages[lang]) {
            this.currentLanguage = lang;
            if (this.recognition) {
                this.recognition.lang = this.languages[lang].code;
            }
            return true;
        }
        return false;
    }
    
    // Démarrer l'écoute
    startListening(onResult, onError) {
        if (!this.recognition) {
            if (onError) onError('Reconnaissance vocale non supportée');
            return;
        }
        
        this.isRecording = true;
        
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.isRecording = false;
            if (onResult) onResult(transcript);
        };
        
        this.recognition.onerror = (event) => {
            this.isRecording = false;
            if (onError) onError(event.error);
        };
        
        this.recognition.onend = () => {
            this.isRecording = false;
        };
        
        this.recognition.start();
    }
    
    // Arrêter l'écoute
    stopListening() {
        if (this.recognition && this.isRecording) {
            this.recognition.stop();
            this.isRecording = false;
        }
    }
    
    // Parler (synthèse vocale)
    speak(text, onEnd) {
        if (!this.synthesis) return;
        
        // Arrêter toute synthèse en cours
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.languages[this.currentLanguage].code;
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
        
        if (onEnd) {
            utterance.onend = onEnd;
        }
        
        this.synthesis.speak(utterance);
    }
    
    // Obtenir une réponse en fonction du message
    getResponse(message) {
        const lowerMessage = message.toLowerCase();
        const responses = this.responses[this.currentLanguage];
        
        // Détection de mots-clés
        if (lowerMessage.includes('billet') || lowerMessage.includes('ticket') || 
            lowerMessage.includes('match') || lowerMessage.includes('entrada')) {
            return responses.billets;
        }
        
        if (lowerMessage.includes('boutique') || lowerMessage.includes('shop') || 
            lowerMessage.includes('maillot') || lowerMessage.includes('jersey') ||
            lowerMessage.includes('tienda') || lowerMessage.includes('negozio')) {
            return responses.boutique;
        }
        
        if (lowerMessage.includes('wallet') || lowerMessage.includes('portefeuille') ||
            lowerMessage.includes('cartera') || lowerMessage.includes('portafoglio') ||
            lowerMessage.includes('coin')) {
            return responses.wallet;
        }
        
        if (lowerMessage.includes('fidé') || lowerMessage.includes('point') ||
            lowerMessage.includes('loyalty') || lowerMessage.includes('fidelidad')) {
            return responses.fidelite;
        }
        
        if (lowerMessage.includes('aide') || lowerMessage.includes('help') ||
            lowerMessage.includes('ayuda') || lowerMessage.includes('aiuto')) {
            return responses.help;
        }
        
        // Réponse par défaut
        return responses.greeting;
    }
    
    // Traiter un message vocal
    processVoiceMessage(message, onResponse) {
        const response = this.getResponse(message);
        
        // Parler la réponse
        this.speak(response, () => {
            if (onResponse) onResponse(response);
        });
        
        return response;
    }
}

// Export global
window.AIVoiceMultilingual = AIVoiceMultilingual;

console.log('✅ IA Vocale Multilingue chargée (8 langues)');
console.log('🎤 Reconnaissance vocale : Web Speech API');
console.log('🔊 Synthèse vocale : Speech Synthesis API');
console.log('🌍 Langues : FR, EN, ES, DE, IT, AR, ZH, JA');
