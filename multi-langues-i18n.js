// 🌍 SYSTÈME MULTI-LANGUES I18N avec Géolocalisation Automatique
// Supporte 10+ langues majeures

const LANGUES_SUPPORTEES = {
    'fr': { nom: 'Français', nomLong: 'Français', code: 'FR', drapeau: '🇫🇷', direction: 'ltr' },
    'en': { nom: 'English', nomLong: 'English', code: 'GB', drapeau: '🇬🇧', direction: 'ltr' },
    'es': { nom: 'Español', nomLong: 'Español', code: 'ES', drapeau: '🇪🇸', direction: 'ltr' },
    'de': { nom: 'Deutsch', nomLong: 'Deutsch', code: 'DE', drapeau: '🇩🇪', direction: 'ltr' },
    'it': { nom: 'Italiano', nomLong: 'Italiano', code: 'IT', drapeau: '🇮🇹', direction: 'ltr' },
    'pt': { nom: 'Português', nomLong: 'Português', code: 'PT', drapeau: '🇵🇹', direction: 'ltr' },
    'tr': { nom: 'Türkçe', nomLong: 'Türkçe', code: 'TR', drapeau: '🇹🇷', direction: 'ltr' },
    'ru': { nom: 'Русский', nomLong: 'Русский', code: 'RU', drapeau: '🇷🇺', direction: 'ltr' },
    'zh': { nom: '中文', nomLong: '中文', code: 'CN', drapeau: '🇨🇳', direction: 'ltr' },
    'ar': { nom: 'العربية', nomLong: 'العربية', code: 'SA', drapeau: '🇸🇦', direction: 'rtl' },
    'ja': { nom: '日本語', nomLong: '日本語', code: 'JP', drapeau: '🇯🇵', direction: 'ltr' }
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
    
    // ========== INDEX.HTML PAGE ==========
    'hero.title': {
        'fr': '🏆 Plateforme Multi-Sports Complète',
        'en': '🏆 Complete Multi-Sports Platform',
        'es': '🏆 Plataforma Multi-Deportes Completa',
        'de': '🏆 Vollständige Multi-Sport-Plattform',
        'it': '🏆 Piattaforma Multi-Sport Completa',
        'pt': '🏆 Plataforma Multi-Esportes Completa',
        'tr': '🏆 Eksiksiz Çoklu Spor Platformu',
        'ru': '🏆 Полная Мульти-Спортивная Платформа',
        'zh': '🏆 完整多体育平台',
        'ar': '🏆 منصة متعددة الرياضات الكاملة',
        'ja': '🏆 完全マルチスポーツプラットフォーム'
    },
    'hero.subtitle': {
        'fr': '700+ équipes et clubs organisés par catégories',
        'en': '700+ teams and clubs organized by categories',
        'es': '700+ equipos y clubes organizados por categorías',
        'de': '700+ Teams und Clubs nach Kategorien organisiert',
        'it': '700+ squadre e club organizzati per categorie',
        'pt': '700+ equipes e clubes organizados por categorias',
        'tr': '700+ takım ve kulüp kategorilere göre düzenlenmiş',
        'ru': '700+ команд и клубов, организованных по категориям',
        'zh': '700+支队伍和俱乐部按类别组织',
        'ar': '700+ فريقًا ونادًا منظمًا حسب الفئات',
        'ja': 'カテゴリ別に整理された700以上のチームとクラブ'
    },
    'stats.total_teams': {
        'fr': 'Équipes Totales',
        'en': 'Total Teams',
        'es': 'Equipos Totales',
        'de': 'Gesamt Teams',
        'it': 'Squadre Totali',
        'pt': 'Equipes Totais',
        'tr': 'Toplam Takımlar',
        'ru': 'Всего Команд',
        'zh': '总队伍',
        'ar': 'الفرق الإجمالية',
        'ja': '総チーム数'
    },
    'stats.clubs_france': {
        'fr': 'Clubs France',
        'en': 'France Clubs',
        'es': 'Clubes Francia',
        'de': 'Frankreich Clubs',
        'it': 'Club Francia',
        'pt': 'Clubes França',
        'tr': 'Fransa Kulüpleri',
        'ru': 'Клубы Франции',
        'zh': '法国俱乐部',
        'ar': 'أندية فرنسا',
        'ja': 'フランスクラブ'
    },
    'stats.clubs_europe': {
        'fr': 'Clubs Europe',
        'en': 'Europe Clubs',
        'es': 'Clubes Europa',
        'de': 'Europa Clubs',
        'it': 'Club Europa',
        'pt': 'Clubes Europa',
        'tr': 'Avrupa Kulüpleri',
        'ru': 'Клубы Европы',
        'zh': '欧洲俱乐部',
        'ar': 'أندية أوروبا',
        'ja': 'ヨーロッパクラブ'
    },
    'stats.teams': {
        'fr': 'Équipes & Clubs',
        'en': 'Teams & Clubs',
        'es': 'Equipos y Clubes',
        'de': 'Teams & Clubs',
        'it': 'Squadre e Club',
        'pt': 'Equipes e Clubes',
        'tr': 'Takımlar ve Kulüpler',
        'ru': 'Команды и Клубы',
        'zh': '队伍和俱乐部',
        'ar': 'الفرق والأندية',
        'ja': 'チームとクラブ'
    },
    'stats.sports': {
        'fr': 'Sports',
        'en': 'Sports',
        'es': 'Deportes',
        'de': 'Sportarten',
        'it': 'Sport',
        'pt': 'Esportes',
        'tr': 'Sporlar',
        'ru': 'Виды спорта',
        'zh': '运动项目',
        'ar': 'الرياضات',
        'ja': 'スポーツ'
    },
    'stats.federations': {
        'fr': 'Fédérations',
        'en': 'Federations',
        'es': 'Federaciones',
        'de': 'Verbände',
        'it': 'Federazioni',
        'pt': 'Federações',
        'tr': 'Federasyonlar',
        'ru': 'Федерации',
        'zh': '联合会',
        'ar': 'الاتحادات',
        'ja': '連盟'
    },
    'tabs.football_france': {
        'fr': '🇫🇷 Football France',
        'en': '🇫🇷 French Football',
        'es': '🇫🇷 Fútbol Francia',
        'de': '🇫🇷 Frankreich Fußball',
        'it': '🇫🇷 Calcio Francia',
        'pt': '🇫🇷 Futebol França',
        'tr': '🇫🇷 Fransa Futbolu',
        'ru': '🇫🇷 Футбол Франции',
        'zh': '🇫🇷 法国足球',
        'ar': '🇫🇷 كرة القدم الفرنسية',
        'ja': '🇫🇷 フランスサッカー'
    },
    'tabs.football_europe': {
        'fr': '🌍 Football Europe',
        'en': '🌍 European Football',
        'es': '🌍 Fútbol Europa',
        'de': '🌍 Europa Fußball',
        'it': '🌍 Calcio Europa',
        'pt': '🌍 Futebol Europa',
        'tr': '🌍 Avrupa Futbolu',
        'ru': '🌍 Футбол Европы',
        'zh': '🌍 欧洲足球',
        'ar': '🌍 كرة القدم الأوروبية',
        'ja': '🌍 ヨーロッパサッカー'
    },
    'tabs.national_teams': {
        'fr': '🏆 Équipes Nationales',
        'en': '🏆 National Teams',
        'es': '🏆 Equipos Nacionales',
        'de': '🏆 Nationalmannschaften',
        'it': '🏆 Nazionali',
        'pt': '🏆 Seleções Nacionais',
        'tr': '🏆 Milli Takımlar',
        'ru': '🏆 Национальные Сборные',
        'zh': '🏆 国家队',
        'ar': '🏆 المنتخبات الوطنية',
        'ja': '🏆 代表チーム'
    },
    'tabs.federations': {
        'fr': '🌐 Fédérations',
        'en': '🌐 Federations',
        'es': '🌐 Federaciones',
        'de': '🌐 Verbände',
        'it': '🌐 Federazioni',
        'pt': '🌐 Federações',
        'tr': '🌐 Federasyonlar',
        'ru': '🌐 Федерации',
        'zh': '🌐 联合会',
        'ar': '🌐 الاتحادات',
        'ja': '🌐 連盟'
    },
    'tabs.multi_sports': {
        'fr': '🏀 Multi-Sports',
        'en': '🏀 Multi-Sports',
        'es': '🏀 Multi-Deportes',
        'de': '🏀 Multi-Sport',
        'it': '🏀 Multi-Sport',
        'pt': '🏀 Multi-Esportes',
        'tr': '🏀 Çoklu Sporlar',
        'ru': '🏀 Мульти-Спорт',
        'zh': '🏀 多体育',
        'ar': '🏀 رياضات متعددة',
        'ja': '🏀 マルチスポーツ'
    },
    'search.placeholder': {
        'fr': 'Rechercher une équipe, club, joueur, pays...',
        'en': 'Search for a team, club, player, country...',
        'es': 'Buscar equipo, club, jugador, país...',
        'de': 'Team, Verein, Spieler, Land suchen...',
        'it': 'Cerca squadra, club, giocatore, paese...',
        'pt': 'Pesquisar equipe, clube, jogador, país...',
        'tr': 'Takım, kulüp, oyuncu, ülke ara...',
        'ru': 'Искать команду, клуб, игрока, страну...',
        'zh': '搜索球队、俱乐部、球员、国家...',
        'ar': 'ابحث عن فريق، نادي، لاعب، بلد...',
        'ja': 'チーム、クラブ、選手、国を検索...'
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
    },
    
    // ========== CLUBS & FEDERATIONS ==========
    'club.om.subtitle': {
        'fr': 'Olympique de Marseille Edition',
        'en': 'Olympique de Marseille Edition',
        'es': 'Edición Olympique de Marseille',
        'de': 'Olympique de Marseille Ausgabe',
        'it': 'Edizione Olympique de Marseille',
        'pt': 'Edição Olympique de Marseille',
        'ar': 'إصدار أولمبيك مارسيليا',
        'zh': '马赛奥林匹克版',
        'ja': 'オリンピック・マルセイユ版'
    },
    'club.om.name': {
        'fr': 'Olympique de Marseille',
        'en': 'Olympique de Marseille',
        'es': 'Olympique de Marseille',
        'de': 'Olympique de Marseille',
        'it': 'Olympique de Marseille',
        'pt': 'Olympique de Marseille',
        'ar': 'أولمبيك مارسيليا',
        'zh': '马赛奥林匹克',
        'ja': 'オリンピック・マルセイユ'
    },
    'club.om.stadium': {
        'fr': 'Stade Vélodrome',
        'en': 'Vélodrome Stadium',
        'es': 'Estadio Vélodrome',
        'de': 'Vélodrome-Stadion',
        'it': 'Stadio Vélodrome',
        'pt': 'Estádio Vélodrome',
        'ar': 'ملعب فيلودروم',
        'zh': '韦洛德罗姆球场',
        'ja': 'ヴェロドローム・スタジアム'
    },
    'club.om.league': {
        'fr': 'Ligue 1 France - 9x Champions',
        'en': 'Ligue 1 France - 9x Champions',
        'es': 'Ligue 1 Francia - 9x Campeones',
        'de': 'Ligue 1 Frankreich - 9x Champions',
        'it': 'Ligue 1 Francia - 9x Campioni',
        'pt': 'Ligue 1 França - 9x Campeões',
        'ar': 'الدوري الفرنسي - بطل 9 مرات',
        'zh': '法甲 - 9次冠军',
        'ja': 'リーグ1フランス - 9回チャンピオン'
    },
    'user.connected': {
        'fr': 'Connecté',
        'en': 'Connected',
        'es': 'Conectado',
        'de': 'Verbunden',
        'it': 'Connesso',
        'pt': 'Conectado',
        'ar': 'متصل',
        'zh': '已连接',
        'ja': '接続済み'
    },
    'user.balance': {
        'fr': 'Solde',
        'en': 'Balance',
        'es': 'Saldo',
        'de': 'Guthaben',
        'it': 'Saldo',
        'pt': 'Saldo',
        'ar': 'الرصيد',
        'zh': '余额',
        'ja': '残高'
    },
    'club.features.tickets.title': {
        'fr': 'Billetterie Vélodrome',
        'en': 'Vélodrome Ticketing',
        'es': 'Venta de Entradas Vélodrome',
        'de': 'Vélodrome Ticketing',
        'it': 'Biglietteria Vélodrome',
        'pt': 'Bilheteria Vélodrome',
        'ar': 'تذاكر فيلودروم',
        'zh': '韦洛德罗姆售票',
        'ja': 'ヴェロドロームチケット'
    },
    'club.features.tickets.desc': {
        'fr': 'Achetez vos places pour le stade',
        'en': 'Buy your stadium tickets',
        'es': 'Compre sus entradas para el estadio',
        'de': 'Kaufen Sie Ihre Stadiontickets',
        'it': 'Acquista i tuoi biglietti per lo stadio',
        'pt': 'Compre seus ingressos para o estádio',
        'ar': 'اشترِ تذاكر الملعب',
        'zh': '购买体育场门票',
        'ja': 'スタジアムチケットを購入'
    },
    'club.features.payments.title': {
        'fr': 'Paiements Globaux',
        'en': 'Global Payments',
        'es': 'Pagos Globales',
        'de': 'Globale Zahlungen',
        'it': 'Pagamenti Globali',
        'pt': 'Pagamentos Globais',
        'ar': 'مدفوعات عالمية',
        'zh': '全球支付',
        'ja': 'グローバル決済'
    },
    'club.features.payments.desc': {
        'fr': 'Alipay, Stablecoin, Mobile Money',
        'en': 'Alipay, Stablecoin, Mobile Money',
        'es': 'Alipay, Stablecoin, Mobile Money',
        'de': 'Alipay, Stablecoin, Mobile Money',
        'it': 'Alipay, Stablecoin, Mobile Money',
        'pt': 'Alipay, Stablecoin, Mobile Money',
        'ar': 'أليباي، عملة مستقرة، موبايل موني',
        'zh': '支付宝、稳定币、移动支付',
        'ja': 'Alipay、ステーブルコイン、モバイルマネー'
    },
    'club.features.cashback.title': {
        'fr': 'Cashback 5%',
        'en': 'Cashback 5%',
        'es': 'Cashback 5%',
        'de': 'Cashback 5%',
        'it': 'Cashback 5%',
        'pt': 'Cashback 5%',
        'ar': 'استرداد نقدي 5٪',
        'zh': '5% 返现',
        'ja': '5% キャッシュバック'
    },
    'club.features.cashback.desc': {
        'fr': 'Sur tous vos achats OM',
        'en': 'On all your OM purchases',
        'es': 'En todas sus compras de OM',
        'de': 'Auf alle Ihre OM-Einkäufe',
        'it': 'Su tutti i tuoi acquisti OM',
        'pt': 'Em todas as suas compras OM',
        'ar': 'على جميع مشترياتك من OM',
        'zh': '所有OM购买',
        'ja': 'すべてのOM購入'
    },
    'club.features.community.title': {
        'fr': 'Communauté',
        'en': 'Community',
        'es': 'Comunidad',
        'de': 'Gemeinschaft',
        'it': 'Comunità',
        'pt': 'Comunidade',
        'ar': 'المجتمع',
        'zh': '社区',
        'ja': 'コミュニティ'
    },
    'club.features.community.desc': {
        'fr': 'Partagez avec les fans de l\'OM',
        'en': 'Share with OM fans',
        'es': 'Comparte con los fans del OM',
        'de': 'Teilen Sie mit OM-Fans',
        'it': 'Condividi con i tifosi dell\'OM',
        'pt': 'Compartilhe com os fãs do OM',
        'ar': 'شارك مع مشجعي OM',
        'zh': '与OM粉丝分享',
        'ja': 'OMファンと共有'
    },
    'club.btn.access_app': {
        'fr': 'Accéder à l\'Application',
        'en': 'Access the App',
        'es': 'Acceder a la Aplicación',
        'de': 'Auf die App zugreifen',
        'it': 'Accedi all\'App',
        'pt': 'Acessar o App',
        'ar': 'الوصول إلى التطبيق',
        'zh': '访问应用',
        'ja': 'アプリにアクセス'
    },
    'club.btn.login': {
        'fr': 'Se Connecter / S\'inscrire',
        'en': 'Login / Sign Up',
        'es': 'Iniciar Sesión / Registrarse',
        'de': 'Anmelden / Registrieren',
        'it': 'Accedi / Registrati',
        'pt': 'Entrar / Cadastrar',
        'ar': 'تسجيل الدخول / التسجيل',
        'zh': '登录 / 注册',
        'ja': 'ログイン / 登録'
    },
    'club.btn.back_hub': {
        'fr': 'Retour au Hub Ligue 1',
        'en': 'Back to Ligue 1 Hub',
        'es': 'Volver al Hub Ligue 1',
        'de': 'Zurück zum Ligue 1 Hub',
        'it': 'Torna all\'Hub Ligue 1',
        'pt': 'Voltar ao Hub Ligue 1',
        'ar': 'العودة إلى مركز الدوري 1',
        'zh': '返回法甲中心',
        'ja': 'リーグ1ハブに戻る'
    },
    
    // ========== FEDERATIONS ==========
    'federation.title': {
        'fr': 'Fédérations Sportives',
        'en': 'Sports Federations',
        'es': 'Federaciones Deportivas',
        'de': 'Sportverbände',
        'it': 'Federazioni Sportive',
        'pt': 'Federações Esportivas',
        'ar': 'الاتحادات الرياضية',
        'zh': '体育联合会',
        'ja': 'スポーツ連盟'
    },
    'federation.subtitle': {
        'fr': 'Connectez-vous avec les fédérations officielles',
        'en': 'Connect with official federations',
        'es': 'Conéctese con las federaciones oficiales',
        'de': 'Verbinden Sie sich mit offiziellen Verbänden',
        'it': 'Connettiti con le federazioni ufficiali',
        'pt': 'Conecte-se com federações oficiais',
        'ar': 'اتصل بالاتحادات الرسمية',
        'zh': '连接官方联合会',
        'ja': '公式連盟と接続'
    },
    'federation.fff.name': {
        'fr': 'Fédération Française de Football',
        'en': 'French Football Federation',
        'es': 'Federación Francesa de Fútbol',
        'de': 'Französischer Fußballverband',
        'it': 'Federazione Francese di Calcio',
        'pt': 'Federação Francesa de Futebol',
        'ar': 'الاتحاد الفرنسي لكرة القدم',
        'zh': '法国足球联合会',
        'ja': 'フランスサッカー連盟'
    },
    'federation.ffr.name': {
        'fr': 'Fédération Française de Rugby',
        'en': 'French Rugby Federation',
        'es': 'Federación Francesa de Rugby',
        'de': 'Französischer Rugby-Verband',
        'it': 'Federazione Francese di Rugby',
        'pt': 'Federação Francesa de Rugby',
        'ar': 'الاتحاد الفرنسي للرجبي',
        'zh': '法国橄榄球联合会',
        'ja': 'フランスラグビー連盟'
    },
    'federation.ffb.name': {
        'fr': 'Fédération Française de Basketball',
        'en': 'French Basketball Federation',
        'es': 'Federación Francesa de Baloncesto',
        'de': 'Französischer Basketballverband',
        'it': 'Federazione Francese di Pallacanestro',
        'pt': 'Federação Francesa de Basquete',
        'ar': 'الاتحاد الفرنسي لكرة السلة',
        'zh': '法国篮球联合会',
        'ja': 'フランスバスケットボール連盟'
    },
    'federation.stats.licenses': {
        'fr': 'Licenciés',
        'en': 'Licensed Players',
        'es': 'Licenciados',
        'de': 'Lizenzierte Spieler',
        'it': 'Tesserati',
        'pt': 'Licenciados',
        'ar': 'المرخصون',
        'zh': '注册球员',
        'ja': 'ライセンスプレーヤー'
    },
    'federation.stats.clubs': {
        'fr': 'Clubs',
        'en': 'Clubs',
        'es': 'Clubes',
        'de': 'Vereine',
        'it': 'Club',
        'pt': 'Clubes',
        'ar': 'الأندية',
        'zh': '俱乐部',
        'ja': 'クラブ'
    },
    'federation.stats.worldcups': {
        'fr': 'Coupes du Monde',
        'en': 'World Cups',
        'es': 'Copas del Mundo',
        'de': 'Weltmeisterschaften',
        'it': 'Coppe del Mondo',
        'pt': 'Copas do Mundo',
        'ar': 'كؤوس العالم',
        'zh': '世界杯',
        'ja': 'ワールドカップ'
    },
    'federation.stats.grandslams': {
        'fr': 'Grand Chelems',
        'en': 'Grand Slams',
        'es': 'Grand Slams',
        'de': 'Grand Slams',
        'it': 'Grande Slam',
        'pt': 'Grand Slams',
        'ar': 'البطولات الكبرى',
        'zh': '大满贯',
        'ja': 'グランドスラム'
    },
    'federation.stats.olympic_medals': {
        'fr': 'Médailles Olympiques',
        'en': 'Olympic Medals',
        'es': 'Medallas Olímpicas',
        'de': 'Olympische Medaillen',
        'it': 'Medaglie Olimpiche',
        'pt': 'Medalhas Olímpicas',
        'ar': 'الميداليات الأولمبية',
        'zh': '奥运奖牌',
        'ja': 'オリンピックメダル'
    },
    'federation.stats.davis_cups': {
        'fr': 'Coupes Davis',
        'en': 'Davis Cups',
        'es': 'Copas Davis',
        'de': 'Davis Cups',
        'it': 'Coppe Davis',
        'pt': 'Copas Davis',
        'ar': 'كأس ديفيس',
        'zh': '戴维斯杯',
        'ja': 'デビスカップ'
    },
    'federation.stats.world_titles': {
        'fr': 'Titres Mondiaux',
        'en': 'World Titles',
        'es': 'Títulos Mundiales',
        'de': 'Weltmeistertitel',
        'it': 'Titoli Mondiali',
        'pt': 'Títulos Mundiais',
        'ar': 'الألقاب العالمية',
        'zh': '世界冠军',
        'ja': '世界タイトル'
    },
    'btn.back_home': {
        'fr': 'Retour à l\'Accueil',
        'en': 'Back to Home',
        'es': 'Volver al Inicio',
        'de': 'Zurück zur Startseite',
        'it': 'Torna alla Home',
        'pt': 'Voltar ao Início',
        'ar': 'العودة إلى الصفحة الرئيسية',
        'zh': '返回首页',
        'ja': 'ホームに戻る'
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
            'TR': 'tr',
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
 * Traduit une clé selon la langue active OU traduit toute la page si appelé sans argument
 * @param {string} cle - Clé de traduction (ex: 'menu.accueil'). Si vide, traduit toute la page
 * @param {string} langue - Code langue (optionnel, utilise langueActive par défaut)
 * @returns {string} Texte traduit (ou undefined si traduction de toute la page)
 */
function traduire(cle = null, langue = null) {
    const lang = langue || langueActive;
    
    // Si pas de clé fournie, traduire TOUTE la page
    if (!cle) {
        // 1. Traduire les textContent avec data-i18n
        document.querySelectorAll('[data-i18n]').forEach(elem => {
            const cleElement = elem.getAttribute('data-i18n');
            if (TRADUCTIONS[cleElement]) {
                elem.textContent = TRADUCTIONS[cleElement][lang] || TRADUCTIONS[cleElement]['fr'] || cleElement;
            }
        });
        
        // 2. Traduire les placeholders avec data-i18n-placeholder
        document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
            const cleElement = elem.getAttribute('data-i18n-placeholder');
            if (TRADUCTIONS[cleElement]) {
                elem.placeholder = TRADUCTIONS[cleElement][lang] || TRADUCTIONS[cleElement]['fr'] || cleElement;
            }
        });
        
        // 3. Traduire les titres avec data-i18n-title
        document.querySelectorAll('[data-i18n-title]').forEach(elem => {
            const cleElement = elem.getAttribute('data-i18n-title');
            if (TRADUCTIONS[cleElement]) {
                elem.title = TRADUCTIONS[cleElement][lang] || TRADUCTIONS[cleElement]['fr'] || cleElement;
            }
        });
        
        return;
    }
    
    // Sinon, traduire une clé spécifique
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
    
    console.log(`🔄 Changement de langue: ${langueActive} → ${nouvelleLangue}`);
    
    // 1. Mettre à jour la langue active
    langueActive = nouvelleLangue;
    localStorage.setItem('langue_preferee', nouvelleLangue);
    
    // 2. Mettre à jour la direction du texte (RTL pour arabe)
    document.documentElement.setAttribute('dir', LANGUES_SUPPORTEES[nouvelleLangue].direction);
    document.documentElement.setAttribute('lang', nouvelleLangue);
    
    // 3. Traduire TOUS les éléments (textContent, placeholder, title)
    let totalElements = 0;
    
    // 3a. Éléments avec data-i18n (textContent)
    const elementsTexte = document.querySelectorAll('[data-i18n]');
    elementsTexte.forEach(elem => {
        const cle = elem.getAttribute('data-i18n');
        if (TRADUCTIONS[cle]) {
            const traduction = TRADUCTIONS[cle][nouvelleLangue] || TRADUCTIONS[cle]['fr'] || cle;
            elem.textContent = traduction;
            console.log(`  ✓ ${cle} → "${traduction}"`);
            totalElements++;
        } else {
            console.warn(`  ⚠️ Clé introuvable: ${cle}`);
        }
    });
    
    // 3b. Éléments avec data-i18n-placeholder (placeholder)
    const elementsPlaceholder = document.querySelectorAll('[data-i18n-placeholder]');
    elementsPlaceholder.forEach(elem => {
        const cle = elem.getAttribute('data-i18n-placeholder');
        if (TRADUCTIONS[cle]) {
            const traduction = TRADUCTIONS[cle][nouvelleLangue] || TRADUCTIONS[cle]['fr'] || cle;
            elem.placeholder = traduction;
            console.log(`  ✓ ${cle} (placeholder) → "${traduction}"`);
            totalElements++;
        }
    });
    
    // 3c. Éléments avec data-i18n-title (title)
    const elementsTitre = document.querySelectorAll('[data-i18n-title]');
    elementsTitre.forEach(elem => {
        const cle = elem.getAttribute('data-i18n-title');
        if (TRADUCTIONS[cle]) {
            const traduction = TRADUCTIONS[cle][nouvelleLangue] || TRADUCTIONS[cle]['fr'] || cle;
            elem.title = traduction;
            console.log(`  ✓ ${cle} (title) → "${traduction}"`);
            totalElements++;
        }
    });
    
    console.log(`🔄 Traduction de ${totalElements} éléments en ${nouvelleLangue}...`);
    
    console.log(`✅ Langue changée: ${LANGUES_SUPPORTEES[nouvelleLangue].nom} ${LANGUES_SUPPORTEES[nouvelleLangue].drapeau}`);
    
    // 4. Re-afficher les données avec les nouvelles traductions
    if (typeof displayCurrentTab === 'function') {
        displayCurrentTab();
        console.log('🔄 Données réaffichées avec traductions');
    }
    
    // 5. Déclencher un événement personnalisé
    window.dispatchEvent(new CustomEvent('langueChangee', { detail: { langue: nouvelleLangue } }));
    
    // PAS de rechargement de page - traduction instantanée !
    console.log('⚡ Traduction instantanée appliquée (pas de rechargement)');
}

/**
 * Initialise le système multi-langues avec détection automatique
 */
async function initialiserMultiLangues() {
    // 1. Vérifier si une langue est déjà enregistrée
    const langueSauvegardee = localStorage.getItem('langue_preferee');
    if (langueSauvegardee && LANGUES_SUPPORTEES[langueSauvegardee]) {
        langueActive = langueSauvegardee;
        console.log('✅ Langue restaurée depuis localStorage:', langueSauvegardee);
    } else {
        // 2. FORCER LE FRANÇAIS PAR DÉFAUT (pas de géolocalisation automatique)
        // L'utilisateur peut changer manuellement via le sélecteur
        langueActive = 'fr';
        localStorage.setItem('langue_preferee', 'fr');
        console.log('✅ Langue par défaut : Français (fr)');
    }
    
    // 3. GÉNÉRER LE SÉLECTEUR DE LANGUE
    const selecteurContainer = document.getElementById('languageSelector');
    if (selecteurContainer) {
        selecteurContainer.innerHTML = genererSelecteurLangue();
        console.log('✅ Sélecteur de langue généré');
    } else {
        console.warn('⚠️ Élément #languageSelector non trouvé');
    }
    
    // 4. TRADUIRE TOUS LES ÉLÉMENTS [data-i18n]
    changerLangue(langueActive);
    
    console.log('✅ Initialisation I18N terminée - Langue:', langueActive);
}

/**
 * Génère le HTML du sélecteur de langue (menu déroulant vertical)
 * @returns {string} HTML du sélecteur
 */
function genererSelecteurLangue() {
    const langueActuelle = LANGUES_SUPPORTEES[langueActive];
    if (!langueActuelle) {
        console.error('❌ Langue active non trouvée:', langueActive);
        return '';
    }
    
    let html = `
        <select id="mainLanguageSelect" onchange="changerLangue(this.value)" style="background: rgba(255,255,255,0.1); border: 2px solid rgba(255,255,255,0.3); color: white; padding: 8px 12px; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600; outline: none;">
    `;
    
    for (const [code, info] of Object.entries(LANGUES_SUPPORTEES)) {
        const selected = code === langueActive ? 'selected' : '';
        html += `<option value="${code}" ${selected} style="background: #1a1f2e; color: white;">${code}</option>`;
    }
    
    html += `</select>`;
    
    return html;
}

// NE PAS initialiser automatiquement pour éviter les boucles infinies
// L'initialisation se fait manuellement depuis chaque page
// if (typeof window !== 'undefined') {
//     window.addEventListener('DOMContentLoaded', initialiserMultiLangues);
// }

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
        genererSelecteurLangue,
        getLangueActive: () => langueActive
    };
}

// Rendre langueActive accessible globalement pour index.html
if (typeof window !== 'undefined') {
    window.getLangueActive = () => langueActive;
}

console.log('✅ Module Multi-Langues I18N chargé');
console.log(`🌍 ${Object.keys(LANGUES_SUPPORTEES).length} langues supportées`);
