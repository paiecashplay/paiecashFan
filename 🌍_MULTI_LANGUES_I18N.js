// 🌍 SYSTÈME MULTI-LANGUES I18N avec Géolocalisation Automatique
// Supporte 10+ langues majeures

const LANGUES_SUPPORTEES = {
    'fr': { nom: 'Français', drapeau: '🇫🇷', direction: 'ltr' },
    'en': { nom: 'English', drapeau: '🇬🇧', direction: 'ltr' },
    'es': { nom: 'Español', drapeau: '🇪🇸', direction: 'ltr' },
    'de': { nom: 'Deutsch', drapeau: '🇩🇪', direction: 'ltr' },
    'it': { nom: 'Italiano', drapeau: '🇮🇹', direction: 'ltr' },
    'pt': { nom: 'Português', drapeau: '🇵🇹', direction: 'ltr' },
    'ru': { nom: 'Русский', drapeau: '🇷🇺', direction: 'ltr' },
    'zh': { nom: '中文', drapeau: '🇨🇳', direction: 'ltr' },
    'ar': { nom: 'العربية', drapeau: '🇸🇦', direction: 'rtl' },
    'ja': { nom: '日本語', drapeau: '🇯🇵', direction: 'ltr' }
};

// Dictionnaire de traductions
const TRADUCTIONS = {
    // ========== MENU NAVIGATION ==========
    'menu.accueil': {
        'fr': 'Accueil',
        'en': 'Home',
        'es': 'Inicio',
        'de': 'Startseite',
        'it': 'Home',
        'pt': 'Início',
        'ru': 'Главная',
        'zh': '首页',
        'ar': 'الرئيسية',
        'ja': 'ホーム'
    },
    'menu.fidelite': {
        'fr': 'Fidélité',
        'en': 'Loyalty',
        'es': 'Fidelidad',
        'de': 'Treue',
        'it': 'Fedeltà',
        'pt': 'Fidelidade',
        'ru': 'Лояльность',
        'zh': '忠诚度',
        'ar': 'الولاء',
        'ja': 'ロイヤルティ'
    },
    'menu.legendes': {
        'fr': 'Légendes',
        'en': 'Legends',
        'es': 'Leyendas',
        'de': 'Legenden',
        'it': 'Leggende',
        'pt': 'Lendas',
        'ru': 'Легенды',
        'zh': '传奇',
        'ar': 'الأساطير',
        'ja': 'レジェンド'
    },
    'menu.billets': {
        'fr': 'Billets',
        'en': 'Tickets',
        'es': 'Entradas',
        'de': 'Tickets',
        'it': 'Biglietti',
        'pt': 'Ingressos',
        'ru': 'Билеты',
        'zh': '门票',
        'ar': 'التذاكر',
        'ja': 'チケット'
    },
    'menu.boutique': {
        'fr': 'Boutique',
        'en': 'Shop',
        'es': 'Tienda',
        'de': 'Shop',
        'it': 'Negozio',
        'pt': 'Loja',
        'ru': 'Магазин',
        'zh': '商店',
        'ar': 'المتجر',
        'ja': 'ショップ'
    },
    'menu.transactions': {
        'fr': 'Transactions',
        'en': 'Transactions',
        'es': 'Transacciones',
        'de': 'Transaktionen',
        'it': 'Transazioni',
        'pt': 'Transações',
        'ru': 'Транзакции',
        'zh': '交易记录',
        'ar': 'المعاملات',
        'ja': '取引'
    },
    'menu.paiement': {
        'fr': 'Paiement',
        'en': 'Payment',
        'es': 'Pago',
        'de': 'Zahlung',
        'it': 'Pagamento',
        'pt': 'Pagamento',
        'ru': 'Оплата',
        'zh': '支付',
        'ar': 'الدفع',
        'ja': '支払い'
    },
    'menu.profil': {
        'fr': 'Profil',
        'en': 'Profile',
        'es': 'Perfil',
        'de': 'Profil',
        'it': 'Profilo',
        'pt': 'Perfil',
        'ru': 'Профиль',
        'zh': '个人资料',
        'ar': 'الملف الشخصي',
        'ja': 'プロフィール'
    },
    
    // ========== WALLET & SOLDES ==========
    'wallet.solde_total': {
        'fr': 'Solde Total',
        'en': 'Total Balance',
        'es': 'Saldo Total',
        'de': 'Gesamtsaldo',
        'it': 'Saldo Totale',
        'pt': 'Saldo Total',
        'ru': 'Общий баланс',
        'zh': '总余额',
        'ar': 'الرصيد الإجمالي',
        'ja': '総残高'
    },
    'wallet.wallet': {
        'fr': 'Wallet',
        'en': 'Wallet',
        'es': 'Monedero',
        'de': 'Wallet',
        'it': 'Portafoglio',
        'pt': 'Carteira',
        'ru': 'Кошелек',
        'zh': '钱包',
        'ar': 'المحفظة',
        'ja': 'ウォレット'
    },
    'wallet.carte': {
        'fr': 'Carte',
        'en': 'Card',
        'es': 'Tarjeta',
        'de': 'Karte',
        'it': 'Carta',
        'pt': 'Cartão',
        'ru': 'Карта',
        'zh': '卡',
        'ar': 'البطاقة',
        'ja': 'カード'
    },
    'wallet.cashback': {
        'fr': 'cashback',
        'en': 'cashback',
        'es': 'reembolso',
        'de': 'Cashback',
        'it': 'cashback',
        'pt': 'cashback',
        'ru': 'кэшбэк',
        'zh': '返现',
        'ar': 'استرداد النقود',
        'ja': 'キャッシュバック'
    },
    
    // ========== TRANSACTIONS ==========
    'transactions.titre': {
        'fr': 'Transactions en Temps Réel',
        'en': 'Real-Time Transactions',
        'es': 'Transacciones en Tiempo Real',
        'de': 'Echtzeit-Transaktionen',
        'it': 'Transazioni in Tempo Reale',
        'pt': 'Transações em Tempo Real',
        'ru': 'Транзакции в реальном времени',
        'zh': '实时交易',
        'ar': 'المعاملات في الوقت الفعلي',
        'ja': 'リアルタイム取引'
    },
    'transactions.historique': {
        'fr': 'Historique complet de vos transactions avec mise à jour instantanée',
        'en': 'Complete history of your transactions with instant updates',
        'es': 'Historial completo de tus transacciones con actualización instantánea',
        'de': 'Vollständiger Verlauf Ihrer Transaktionen mit sofortiger Aktualisierung',
        'it': 'Cronologia completa delle tue transazioni con aggiornamento istantaneo',
        'pt': 'Histórico completo de suas transações com atualização instantânea',
        'ru': 'Полная история ваших транзакций с мгновенным обновлением',
        'zh': '您的交易完整历史记录，即时更新',
        'ar': 'سجل كامل لمعاملاتك مع التحديث الفوري',
        'ja': '即座に更新される取引の完全な履歴'
    },
    'transactions.toutes': {
        'fr': 'Toutes',
        'en': 'All',
        'es': 'Todas',
        'de': 'Alle',
        'it': 'Tutte',
        'pt': 'Todas',
        'ru': 'Все',
        'zh': '全部',
        'ar': 'الكل',
        'ja': 'すべて'
    },
    'transactions.aucune': {
        'fr': 'Aucune transaction pour le moment',
        'en': 'No transactions yet',
        'es': 'No hay transacciones todavía',
        'de': 'Noch keine Transaktionen',
        'it': 'Nessuna transazione ancora',
        'pt': 'Nenhuma transação ainda',
        'ru': 'Пока нет транзакций',
        'zh': '暂无交易',
        'ar': 'لا توجد معاملات حتى الآن',
        'ja': 'まだ取引がありません'
    },
    'transactions.stats_depense': {
        'fr': 'Total dépensé',
        'en': 'Total spent',
        'es': 'Total gastado',
        'de': 'Gesamt ausgegeben',
        'it': 'Totale speso',
        'pt': 'Total gasto',
        'ru': 'Всего потрачено',
        'zh': '总支出',
        'ar': 'إجمالي الإنفاق',
        'ja': '総支出'
    },
    'transactions.stats_cashback': {
        'fr': 'Total cashback gagné',
        'en': 'Total cashback earned',
        'es': 'Total de reembolso ganado',
        'de': 'Gesamt Cashback verdient',
        'it': 'Totale cashback guadagnato',
        'pt': 'Total de cashback ganho',
        'ru': 'Всего кэшбэка получено',
        'zh': '总返现',
        'ar': 'إجمالي الاسترداد المكتسب',
        'ja': '獲得したキャッシュバック合計'
    },
    'transactions.stats_nombre': {
        'fr': 'Nombre de transactions',
        'en': 'Number of transactions',
        'es': 'Número de transacciones',
        'de': 'Anzahl der Transaktionen',
        'it': 'Numero di transazioni',
        'pt': 'Número de transações',
        'ru': 'Количество транзакций',
        'zh': '交易数量',
        'ar': 'عدد المعاملات',
        'ja': '取引数'
    },
    
    // ========== PAIEMENTS ==========
    'paiement.mode_touriste': {
        'fr': 'Mode Touriste',
        'en': 'Tourist Mode',
        'es': 'Modo Turista',
        'de': 'Touristen-Modus',
        'it': 'Modalità Turista',
        'pt': 'Modo Turista',
        'ru': 'Туристический режим',
        'zh': '游客模式',
        'ar': 'وضع السياحة',
        'ja': 'ツーリストモード'
    },
    'paiement.alipay': {
        'fr': 'Alipay',
        'en': 'Alipay',
        'es': 'Alipay',
        'de': 'Alipay',
        'it': 'Alipay',
        'pt': 'Alipay',
        'ru': 'Alipay',
        'zh': '支付宝',
        'ar': 'أليباي',
        'ja': 'Alipay'
    },
    'paiement.wechat': {
        'fr': 'WeChat Pay',
        'en': 'WeChat Pay',
        'es': 'WeChat Pay',
        'de': 'WeChat Pay',
        'it': 'WeChat Pay',
        'pt': 'WeChat Pay',
        'ru': 'WeChat Pay',
        'zh': '微信支付',
        'ar': 'ويتشات باي',
        'ja': 'WeChat Pay'
    },
    'paiement.succes': {
        'fr': 'Paiement réussi !',
        'en': 'Payment successful!',
        'es': '¡Pago exitoso!',
        'de': 'Zahlung erfolgreich!',
        'it': 'Pagamento riuscito!',
        'pt': 'Pagamento bem-sucedido!',
        'ru': 'Платеж успешен!',
        'zh': '支付成功！',
        'ar': 'الدفع ناجح!',
        'ja': '支払いが成功しました！'
    },
    
    // ========== BOUTONS ==========
    'btn.annuler': {
        'fr': 'Annuler',
        'en': 'Cancel',
        'es': 'Cancelar',
        'de': 'Abbrechen',
        'it': 'Annulla',
        'pt': 'Cancelar',
        'ru': 'Отмена',
        'zh': '取消',
        'ar': 'إلغاء',
        'ja': 'キャンセル'
    },
    'btn.confirmer': {
        'fr': 'Confirmer',
        'en': 'Confirm',
        'es': 'Confirmar',
        'de': 'Bestätigen',
        'it': 'Conferma',
        'pt': 'Confirmar',
        'ru': 'Подтвердить',
        'zh': '确认',
        'ar': 'تأكيد',
        'ja': '確認'
    },
    'btn.voir_tout': {
        'fr': 'Voir toutes les transactions',
        'en': 'View all transactions',
        'es': 'Ver todas las transacciones',
        'de': 'Alle Transaktionen anzeigen',
        'it': 'Vedi tutte le transazioni',
        'pt': 'Ver todas as transações',
        'ru': 'Просмотреть все транзакции',
        'zh': '查看所有交易',
        'ar': 'عرض كافة المعاملات',
        'ja': 'すべての取引を表示'
    },
    
    // ========== MESSAGES ==========
    'msg.bienvenue': {
        'fr': 'Bienvenue',
        'en': 'Welcome',
        'es': 'Bienvenido',
        'de': 'Willkommen',
        'it': 'Benvenuto',
        'pt': 'Bem-vindo',
        'ru': 'Добро пожаловать',
        'zh': '欢迎',
        'ar': 'مرحبا',
        'ja': 'ようこそ'
    }
};

// ========== FONCTIONS DE TRADUCTION ==========

let langueActive = 'fr'; // Langue par défaut

/**
 * Détecte la langue du navigateur
 * @returns {string} Code langue (ex: 'fr', 'en')
 */
function detecterLangueNavigateur() {
    const langueNav = navigator.language || navigator.userLanguage;
    const code = langueNav.split('-')[0].toLowerCase();
    
    // Vérifier si la langue est supportée
    if (LANGUES_SUPPORTEES[code]) {
        return code;
    }
    
    // Par défaut : français
    return 'fr';
}

/**
 * Géolocalisation pour détecter la langue basée sur le pays
 * @returns {Promise<string>} Code langue détecté
 */
async function detecterLangueParGeolocalisation() {
    try {
        // Utiliser une API de géolocalisation gratuite
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        
        // Mapper pays -> langue
        const mappingPays = {
            'FR': 'fr', 'BE': 'fr', 'CH': 'fr', 'CA': 'fr',
            'GB': 'en', 'US': 'en', 'AU': 'en', 'IE': 'en',
            'ES': 'es', 'MX': 'es', 'AR': 'es', 'CO': 'es',
            'DE': 'de', 'AT': 'de',
            'IT': 'it',
            'PT': 'pt', 'BR': 'pt',
            'RU': 'ru',
            'CN': 'zh', 'TW': 'zh', 'HK': 'zh',
            'SA': 'ar', 'EG': 'ar', 'AE': 'ar', 'MA': 'ar',
            'JP': 'ja'
        };
        
        const pays = data.country_code;
        const langue = mappingPays[pays] || detecterLangueNavigateur();
        
        console.log(`🌍 Géolocalisation: ${pays} → ${langue}`);
        return langue;
    } catch (error) {
        console.warn('❌ Erreur géolocalisation, fallback navigateur', error);
        return detecterLangueNavigateur();
    }
}

/**
 * Traduit une clé selon la langue active
 * @param {string} cle - Clé de traduction (ex: 'menu.accueil')
 * @param {string} langue - Code langue (optionnel, utilise langueActive par défaut)
 * @returns {string} Texte traduit
 */
function traduire(cle, langue = null) {
    const lang = langue || langueActive;
    
    if (!TRADUCTIONS[cle]) {
        console.warn(`⚠️ Clé de traduction introuvable: ${cle}`);
        return cle;
    }
    
    return TRADUCTIONS[cle][lang] || TRADUCTIONS[cle]['fr'] || cle;
}

/**
 * Change la langue active et met à jour l'interface
 * @param {string} nouvelleLangue - Code langue
 */
function changerLangue(nouvelleLangue) {
    if (!LANGUES_SUPPORTEES[nouvelleLangue]) {
        console.error(`❌ Langue non supportée: ${nouvelleLangue}`);
        return;
    }
    
    langueActive = nouvelleLangue;
    localStorage.setItem('langue_preferee', nouvelleLangue);
    
    // Mettre à jour la direction du texte (RTL pour arabe)
    document.documentElement.setAttribute('dir', LANGUES_SUPPORTEES[nouvelleLangue].direction);
    document.documentElement.setAttribute('lang', nouvelleLangue);
    
    // Traduire tous les éléments avec data-i18n
    document.querySelectorAll('[data-i18n]').forEach(elem => {
        const cle = elem.getAttribute('data-i18n');
        elem.textContent = traduire(cle);
    });
    
    console.log(`✅ Langue changée: ${LANGUES_SUPPORTEES[nouvelleLangue].nom} ${LANGUES_SUPPORTEES[nouvelleLangue].drapeau}`);
    
    // Déclencher un événement personnalisé
    window.dispatchEvent(new CustomEvent('langueChangee', { detail: { langue: nouvelleLangue } }));
}

/**
 * Initialise le système multi-langues avec détection automatique
 */
async function initialiserMultiLangues() {
    // 1. Vérifier si une langue est déjà enregistrée
    const langueSauvegardee = localStorage.getItem('langue_preferee');
    if (langueSauvegardee && LANGUES_SUPPORTEES[langueSauvegardee]) {
        changerLangue(langueSauvegardee);
        console.log('✅ Langue restaurée depuis localStorage:', langueSauvegardee);
        return;
    }
    
    // 2. Détecter la langue par géolocalisation
    const langueDetectee = await detecterLangueParGeolocalisation();
    changerLangue(langueDetectee);
}

/**
 * Génère le HTML du sélecteur de langue
 * @returns {string} HTML du sélecteur
 */
function genererSelecteurLangue() {
    let html = '<div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center;">';
    
    for (const [code, info] of Object.entries(LANGUES_SUPPORTEES)) {
        const actif = code === langueActive ? 'background: rgba(255,255,255,0.2); border: 2px solid #4ade80;' : 'background: rgba(255,255,255,0.05);';
        html += `
            <button onclick="changerLangue('${code}')" style="${actif} border: 2px solid rgba(255,255,255,0.2); color: white; padding: 10px 15px; border-radius: 10px; cursor: pointer; font-size: 14px; display: flex; align-items: center; gap: 8px; transition: all 0.3s;">
                <span style="font-size: 24px;">${info.drapeau}</span>
                <span>${info.nom}</span>
            </button>
        `;
    }
    
    html += '</div>';
    return html;
}

// Initialiser automatiquement au chargement
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', initialiserMultiLangues);
}

// Export pour utilisation dans l'app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        LANGUES_SUPPORTEES,
        TRADUCTIONS,
        traduire,
        changerLangue,
        detecterLangueNavigateur,
        detecterLangueParGeolocalisation,
        initialiserMultiLangues,
        genererSelecteurLangue
    };
}

console.log('✅ Module Multi-Langues I18N chargé');
console.log(`🌍 ${Object.keys(LANGUES_SUPPORTEES).length} langues supportées`);
