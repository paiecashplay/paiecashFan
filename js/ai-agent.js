/**
 * PaieCashFan - Agent IA Conversationnel
 * Support intelligent 24/7 pour wallet, crypto, NFT et questions générales
 */

class PaieCashFanAI {
    constructor() {
        this.conversationHistory = [];
        this.knowledgeBase = this.initializeKnowledgeBase();
        this.isOpen = false;
    }
    
    initializeKnowledgeBase() {
        return {
            // Questions sur l'écosystème
            ecosystem: {
                keywords: ['club', 'clubs', 'équipe', 'federation', 'fédération', 'ligue', 'sport', 'combien', 'disponible'],
                responses: [
                    {
                        question: "Combien de clubs sont disponibles ?",
                        answer: "🌍 PaieCashFan propose 126 entités sportives :\n\n⚽ FOOTBALL (36 clubs) :\n• Ligue 1 : 18 clubs (PSG, OM, OL, Monaco, etc.)\n• Ligue 2 : 18 clubs (Saint-Étienne, Metz, Bordeaux, etc.)\n\n🏆 FÉDÉRATIONS (46 nations) :\n• Europe : 12 (France, Espagne, Allemagne, Angleterre...)\n• Afrique : 9 (Maroc, Sénégal, Algérie...)\n• Amérique : 7 (Brésil, Argentine, USA...)\n• Asie : 9\n• Océanie : 4\n\n🏉 RUGBY Top 14 : 14 clubs\n🏀 BASKETBALL Betclic Elite : 12 clubs\n🤾 HANDBALL Starligue : 10 clubs\n🏐 VOLLEYBALL Ligue A : 8 clubs"
                    },
                    {
                        question: "Comment choisir mon club ?",
                        answer: "Pour choisir votre club préféré :\n\n1️⃣ Allez sur la page d'accueil (index.html)\n2️⃣ Utilisez la barre de recherche ou les onglets par sport\n3️⃣ Cliquez sur le logo de votre club\n4️⃣ Vous accédez à l'application dédiée !\n\n💡 Vous pouvez changer de club à tout moment en retournant à l'accueil."
                    }
                ]
            },
            
            // Questions sur la billetterie
            ticketing: {
                keywords: ['billet', 'ticket', 'place', 'match', 'stade', 'réserver', 'acheter billetterie', 'nft ticket'],
                responses: [
                    {
                        question: "Comment acheter des billets ?",
                        answer: "🎫 Pour acheter des billets de match :\n\n1️⃣ Allez dans l'application de votre club\n2️⃣ Cliquez sur '🎫 Billetterie NFT'\n3️⃣ Choisissez votre match\n4️⃣ Sélectionnez vos places\n5️⃣ Cliquez 'Acheter par SMS'\n6️⃣ Entrez votre numéro de téléphone\n7️⃣ Validez le paiement par SMS\n8️⃣ Recevez votre billet NFT instantanément !\n\n💰 Paiement accepté : SMS (facturé sur mobile), Crypto (ETH, USDT, USDC)"
                    },
                    {
                        question: "Qu'est-ce qu'un billet NFT ?",
                        answer: "🎨 Un billet NFT (Token Non Fongible) est un billet numérique unique :\n\n✅ Avantages :\n• Impossible à falsifier\n• Stocké dans votre wallet crypto\n• Peut devenir un souvenir collector\n• Revendable sur OpenSea\n• QR code dynamique pour l'entrée\n\n🔐 Sécurité maximale : Chaque billet NFT est unique et vérifié sur la blockchain."
                    }
                ]
            },
            
            // Questions sur la boutique
            shop: {
                keywords: ['boutique', 'shop', 'maillot', 'acheter', 'produit', 'article', 'merchandising', 'vêtement'],
                responses: [
                    {
                        question: "Comment acheter dans la boutique ?",
                        answer: "🛍️ Pour acheter des produits de votre club :\n\n1️⃣ Allez dans l'application de votre club\n2️⃣ Cliquez sur '🛍️ Boutique'\n3️⃣ Parcourez les produits (maillots, écharpes, etc.)\n4️⃣ Ajoutez au panier\n5️⃣ Cliquez 'Commander'\n6️⃣ Choisissez le paiement par SMS\n7️⃣ Validez par SMS\n8️⃣ Livraison à domicile sous 3-5 jours !\n\n💳 Paiements acceptés : SMS, Crypto (USDT/USDC), Carte bancaire"
                    },
                    {
                        question: "Quels produits sont disponibles ?",
                        answer: "🛍️ Produits disponibles dans chaque boutique club :\n\n👕 Vêtements :\n• Maillots domicile/extérieur\n• Survêtements\n• T-shirts\n• Écharpes\n\n🎒 Accessoires :\n• Sacs de sport\n• Casquettes\n• Portefeuilles\n• Porte-clés\n\n🎮 Autres :\n• Ballons\n• Posters\n• Mugs\n• NFTs exclusifs"
                    }
                ]
            },
            
            // Questions sur le paiement SMS
            sms_payment: {
                keywords: ['sms', 'payer sms', 'valider sms', 'téléphone', 'mobile', 'numéro'],
                responses: [
                    {
                        question: "Comment fonctionne le paiement par SMS ?",
                        answer: "📱 Paiement par SMS - Simple et Sécurisé :\n\n1️⃣ Vous choisissez 'Payer par SMS'\n2️⃣ Vous entrez votre numéro de téléphone\n3️⃣ Vous recevez un SMS avec un code à 6 chiffres\n4️⃣ Vous entrez le code pour valider\n5️⃣ Le montant est débité sur votre facture mobile\n6️⃣ Transaction confirmée instantanément !\n\n💰 Montant maximal : 50€ par transaction\n✅ Sécurité : Code SMS unique à usage unique\n📞 Opérateurs supportés : Orange, SFR, Bouygues, Free"
                    },
                    {
                        question: "Le paiement SMS est-il sécurisé ?",
                        answer: "🔐 OUI, le paiement SMS est 100% sécurisé :\n\n✅ Code SMS unique à 6 chiffres\n✅ Expire après 5 minutes\n✅ Un seul code par transaction\n✅ Facturé par votre opérateur mobile\n✅ Remboursement possible sous 14 jours\n✅ Conforme aux normes PCI-DSS\n\n⚠️ Ne partagez JAMAIS votre code SMS avec quiconque !"
                    }
                ]
            },
            
            // Questions sur le wallet
            wallet: {
                keywords: ['wallet', 'portefeuille', 'connecter', 'metamask', 'connection', 'déconnecter'],
                responses: [
                    {
                        question: "Comment connecter mon wallet ?",
                        answer: "Pour connecter votre wallet :\n1. Cliquez sur le bouton 'Connecter Wallet'\n2. Choisissez votre wallet (MetaMask, WalletConnect, etc.)\n3. Approuvez la connexion dans votre wallet\n4. C'est fait ! Votre adresse s'affichera.\n\n⚠️ Important : Vos clés privées restent toujours dans votre wallet. PaieCashFan n'y a jamais accès."
                    },
                    {
                        question: "PaieCashFan a-t-il accès à mes fonds ?",
                        answer: "NON, JAMAIS ! 🔒\n\nPaieCashFan utilise une architecture non-custodiale :\n✅ Vos clés privées restent dans votre wallet\n✅ Seule VOTRE signature peut autoriser une transaction\n✅ Nous ne pouvons voir que votre adresse publique et vos soldes\n\nC'est comme une banque qui peut voir votre solde mais ne peut jamais retirer d'argent sans votre autorisation."
                    }
                ]
            },
            
            // Questions sur les cryptos
            crypto: {
                keywords: ['crypto', 'eth', 'usdt', 'usdc', 'bnb', 'solana', 'sol', 'solde', 'balance', 'token', 'monnaie', 'blockchain', 'réseau'],
                responses: [
                    {
                        question: "Quelles cryptomonnaies sont supportées ?",
                        answer: "PaieCashFan supporte de nombreuses cryptos :\n\n💎 Cryptos natives :\n• ETH (Ethereum)\n• SOL (Solana) 🆕\n• MATIC (Polygon)\n• BNB (Binance Smart Chain)\n• AVAX (Avalanche) 🆕\n• ARB (Arbitrum) 🆕\n• OP (Optimism) 🆕\n\n💵 Stablecoins :\n• USDT (Tether)\n• USDC (USD Coin)\n• DAI (Dai Stablecoin) 🆕\n• BUSD (Binance USD) 🆕\n\n🌐 Réseaux supportés :\n• Ethereum Mainnet (Layer 1)\n• Solana (ultrarapide, frais < 0.01$) 🆕\n• Polygon (frais ultra-faibles)\n• BNB Chain (Binance Smart Chain)\n• Avalanche C-Chain 🆕\n• Arbitrum (Layer 2 Ethereum) 🆕\n• Optimism (Layer 2 Ethereum) 🆕\n• Base (Coinbase Layer 2) 🆕"
                    },
                    {
                        question: "Comment recevoir mon cashback ?",
                        answer: "Le cashback est automatiquement crédité :\n\n📍 Où ? Sur votre wallet connecté\n💰 En quoi ? USDT ou USDC (stablecoins)\n⏱️ Quand ? 24-48h après validation de l'achat\n🔔 Notification ? Oui, vous recevrez une alerte\n\nExemple : Achat McDonald's 20€ avec 5% cashback = 1€ en USDT dans votre wallet !"
                    }
                ]
            },
            
            // Questions sur les NFTs
            nft: {
                keywords: ['nft', 'token', 'collection', 'badge', 'gagner', 'galerie'],
                responses: [
                    {
                        question: "Comment obtenir des NFTs PaieCashFan ?",
                        answer: "Vous pouvez gagner des NFTs exclusifs via :\n\n🎖️ Programme fidélité :\n• Badge Bronze, Argent, Or, Platine\n• NFTs commémoratifs de matchs\n\n🎉 Événements spéciaux :\n• Participation à des tournois\n• Victoires de votre club\n\n👥 Parrainage :\n• Invitez 10 amis = NFT exclusif\n\n💳 Cashback :\n• Cumulez 500€ de cashback = NFT spécial"
                    },
                    {
                        question: "Où voir mes NFTs ?",
                        answer: "Pour voir vos NFTs :\n\n1️⃣ Allez sur la page 'Wallet & NFT'\n2️⃣ Connectez votre wallet\n3️⃣ Cliquez sur l'onglet 'Mes NFTs'\n4️⃣ Tous vos NFTs PaieCashFan s'affichent !\n\nVos NFTs restent toujours dans votre wallet personnel. Vous pouvez les transférer ou les vendre sur OpenSea à tout moment."
                    }
                ]
            },
            
            // Questions sur la sécurité
            security: {
                keywords: ['sécurité', 'sécurisé', 'danger', 'risque', 'protéger', 'seed', 'phrase secrète', 'piratage', 'phishing'],
                responses: [
                    {
                        question: "Comment protéger mon wallet ?",
                        answer: "🔐 Règles de sécurité ESSENTIELLES :\n\n❌ Ne JAMAIS partager :\n• Votre phrase secrète (seed phrase)\n• Votre clé privée\n• Votre mot de passe wallet\n\n✅ Toujours :\n• Vérifier l'URL avant de connecter\n• Utiliser un hardware wallet (Ledger, Trezor) pour gros montants\n• Activer l'authentification 2FA\n• Ne cliquer que sur des liens officiels\n\n⚠️ Le support PaieCashFan ne vous demandera JAMAIS votre seed phrase !"
                    },
                    {
                        question: "Que faire en cas de phishing ?",
                        answer: "🚨 ACTION IMMÉDIATE :\n\n1️⃣ Déconnectez votre wallet de TOUS les sites\n2️⃣ Transférez vos fonds vers un NOUVEAU wallet sécurisé\n3️⃣ Signalez l'incident à support@paiecashfan.com\n4️⃣ Changez tous vos mots de passe\n\n📧 Signaux d'alerte phishing :\n• Emails avec fautes d'orthographe\n• Liens suspects\n• Urgence artificielle\n• Demande de seed phrase"
                    }
                ]
            },
            
            // Questions générales
            general: {
                keywords: ['aide', 'help', 'comment', 'pourquoi', 'quoi', 'combien', 'frais', 'transaction'],
                responses: [
                    {
                        question: "Y a-t-il des frais ?",
                        answer: "💰 Frais PaieCashFan :\n❌ AUCUNE COMMISSION sur les transactions\n❌ GRATUIT de connecter votre wallet\n❌ GRATUIT de voir vos NFTs\n\n⚠️ Seuls les frais blockchain s'appliquent :\n• Ethereum : 2-50€ (variable selon congestion)\n• Polygon : 0.01-0.50€ (très faible !)\n• BNB Chain : 0.10-2€ (faible)\n\n💡 Astuce : Utilisez Polygon pour économiser 99% de frais !"
                    },
                    {
                        question: "Comment contacter le support ?",
                        answer: "📞 Support disponible 24/7 :\n\n💬 Chat IA : Disponible maintenant (vous y êtes !)\n📧 Email : support@paiecashfan.com (réponse < 24h)\n📱 WhatsApp : +33 6 12 34 56 78\n🐦 Twitter : @PaieCashFan\n🎫 Ticket : Créez un ticket sur support.html\n\n⏱️ Temps de réponse :\n• Urgent : 2h\n• Haute priorité : 12h\n• Normal : 24h"
                    }
                ]
            }
        };
    }
    
    // Trouver la meilleure réponse basée sur les mots-clés
    findBestResponse(userMessage) {
        const messageLower = userMessage.toLowerCase();
        let bestMatch = null;
        let maxScore = 0;
        
        // Parcourir toutes les catégories
        for (const [category, data] of Object.entries(this.knowledgeBase)) {
            // Vérifier si les mots-clés de la catégorie sont dans le message
            const keywordMatches = data.keywords.filter(keyword => 
                messageLower.includes(keyword.toLowerCase())
            ).length;
            
            if (keywordMatches > maxScore) {
                maxScore = keywordMatches;
                // Prendre la première réponse de cette catégorie
                bestMatch = data.responses[0];
            }
        }
        
        // Si aucune correspondance, réponse par défaut
        if (!bestMatch || maxScore === 0) {
            return this.getDefaultResponse(messageLower);
        }
        
        return {
            question: bestMatch.question,
            answer: bestMatch.answer,
            confidence: maxScore > 2 ? 'high' : 'medium'
        };
    }
    
    getDefaultResponse(messageLower) {
        // Réponses spécifiques selon le contexte
        if (messageLower.includes('bonjour') || messageLower.includes('salut') || messageLower.includes('hello')) {
            return {
                question: "Bienvenue !",
                answer: "👋 Bonjour ! Je suis l'assistant IA de PaieCashFan.\n\nJe peux vous aider avec :\n💰 Wallet & connexion\n💎 Cryptomonnaies & stablecoins\n🎨 NFTs & badges\n🔐 Sécurité\n💳 Cashback & paiements\n\nPosez-moi une question !",
                confidence: 'high'
            };
        }
        
        if (messageLower.includes('merci')) {
            return {
                question: "De rien !",
                answer: "😊 Je vous en prie !\n\nD'autres questions ? Je suis là 24/7 pour vous aider.\n\nVous pouvez aussi consulter :\n📚 Le guide complet (onboarding.html)\n❓ La FAQ (support.html)",
                confidence: 'high'
            };
        }
        
        // Réponse par défaut
        return {
            question: "Question non reconnue",
            answer: "🤔 Je n'ai pas bien compris votre question.\n\nVoici ce que je peux faire :\n\n💡 Sujets disponibles :\n• Connexion wallet & MetaMask\n• Cryptomonnaies (ETH, USDT, USDC, BNB)\n• NFTs & collections\n• Sécurité & protection\n• Cashback & paiements\n• Frais & transactions\n\nEssayez de reformuler ou consultez notre FAQ complète sur support.html",
            confidence: 'low'
        };
    }
    
    // Obtenir une réponse IA
    async getResponse(userMessage) {
        // Simuler un délai de traitement IA
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Ajouter à l'historique
        this.conversationHistory.push({
            role: 'user',
            message: userMessage,
            timestamp: new Date().toISOString()
        });
        
        // Trouver la meilleure réponse
        const response = this.findBestResponse(userMessage);
        
        // Ajouter à l'historique
        this.conversationHistory.push({
            role: 'assistant',
            message: response.answer,
            confidence: response.confidence,
            timestamp: new Date().toISOString()
        });
        
        return response;
    }
    
    // Réinitialiser la conversation
    resetConversation() {
        this.conversationHistory = [];
    }
    
    // Obtenir l'historique
    getHistory() {
        return this.conversationHistory;
    }
}

// Instance globale
window.aiAgent = new PaieCashFanAI();
