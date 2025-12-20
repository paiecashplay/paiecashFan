// GENERATEUR AUTOMATIQUE DE CARTES BANCAIRES POUR JOUEURS
// Version 13.7.10 - ZERO REGRESSION

const joueursDatabase = {
    // PSG
    'hakimi': {
        nom: 'ACHRAF HAKIMI',
        club: 'Paris Saint-Germain',
        pays: 'Maroc',
        drapeau: '🇲🇦',
        poste: 'Defenseur',
        photoUrl: 'https://www.genspark.ai/api/files/s/D0NMkbw0',
        logoClub: 'https://upload.wikimedia.org/wikipedia/fr/thumb/8/86/Paris_Saint-Germain_Logo.svg/150px-Paris_Saint-Germain_Logo.svg.png',
        numeroCarteFan: '5412 7534 9876 5434',
        numeroCarteVip: '5412 7534 9876 5435'
    },
    
    // OLYMPIQUE DE MARSEILLE
    'aubameyang': {
        nom: 'PIERRE-EMERICK AUBAMEYANG',
        club: 'Olympique de Marseille',
        pays: 'Gabon',
        drapeau: '🇬🇦',
        poste: 'Attaquant',
        photoUrl: 'https://img.a.transfermarkt.technology/portrait/big/58864-1694609550.jpg',
        logoClub: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Olympique_Marseille_logo.svg/150px-Olympique_Marseille_logo.svg.png',
        numeroCarteFan: '5412 7534 9876 5436',
        numeroCarteVip: '5412 7534 9876 5437'
    },
    
    // RC LENS
    'pepe': {
        nom: 'NICOLAS PEPE',
        club: 'RC Lens',
        pays: 'Cote d\'Ivoire',
        drapeau: '🇨🇮',
        poste: 'Ailier',
        photoUrl: 'https://img.a.transfermarkt.technology/portrait/big/296762-1664867850.jpg',
        logoClub: 'https://upload.wikimedia.org/wikipedia/fr/thumb/6/64/RC_Lens_logo.svg/150px-RC_Lens_logo.svg.png',
        numeroCarteFan: '5412 7534 9876 5438',
        numeroCarteVip: '5412 7534 9876 5439'
    },
    
    // LIVERPOOL
    'salah': {
        nom: 'MOHAMED SALAH',
        club: 'Liverpool FC',
        pays: 'Egypte',
        drapeau: '🇪🇬',
        poste: 'Ailier',
        photoUrl: 'https://img.a.transfermarkt.technology/portrait/big/148455-1694609710.jpg',
        logoClub: 'https://upload.wikimedia.org/wikipedia/fr/thumb/5/54/Liverpool_FC.svg/150px-Liverpool_FC.svg.png',
        numeroCarteFan: '5412 7534 9876 5440',
        numeroCarteVip: '5412 7534 9876 5441'
    },
    
    // MANCHESTER CITY
    'haaland': {
        nom: 'ERLING HAALAND',
        club: 'Manchester City',
        pays: 'Norvege',
        drapeau: '🇳🇴',
        poste: 'Attaquant',
        photoUrl: 'https://img.a.transfermarkt.technology/portrait/big/418560-1694610946.jpg',
        logoClub: 'https://upload.wikimedia.org/wikipedia/fr/thumb/9/9c/Manchester_City_logo.svg/150px-Manchester_City_logo.svg.png',
        numeroCarteFan: '5412 7534 9876 5442',
        numeroCarteVip: '5412 7534 9876 5443'
    },
    
    // REAL MADRID
    'vinicius': {
        nom: 'VINICIUS JUNIOR',
        club: 'Real Madrid',
        pays: 'Bresil',
        drapeau: '🇧🇷',
        poste: 'Ailier',
        photoUrl: 'https://img.a.transfermarkt.technology/portrait/big/371998-1694610037.jpg',
        logoClub: 'https://upload.wikimedia.org/wikipedia/fr/thumb/c/c7/Logo_Real_Madrid.svg/150px-Logo_Real_Madrid.svg.png',
        numeroCarteFan: '5412 7534 9876 5444',
        numeroCarteVip: '5412 7534 9876 5445'
    },
    
    // FC BARCELONE
    'lewandowski': {
        nom: 'ROBERT LEWANDOWSKI',
        club: 'FC Barcelone',
        pays: 'Pologne',
        drapeau: '🇵🇱',
        poste: 'Attaquant',
        photoUrl: 'https://img.a.transfermarkt.technology/portrait/big/38253-1697211726.jpg',
        logoClub: 'https://upload.wikimedia.org/wikipedia/fr/thumb/a/a1/Logo_FC_Barcelona.svg/150px-Logo_FC_Barcelona.svg.png',
        numeroCarteFan: '5412 7534 9876 5446',
        numeroCarteVip: '5412 7534 9876 5447'
    },
    
    // BAYERN MUNICH
    'kane': {
        nom: 'HARRY KANE',
        club: 'Bayern Munich',
        pays: 'Angleterre',
        drapeau: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        poste: 'Attaquant',
        photoUrl: 'https://img.a.transfermarkt.technology/portrait/big/132098-1631351810.jpg',
        logoClub: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/150px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
        numeroCarteFan: '5412 7534 9876 5448',
        numeroCarteVip: '5412 7534 9876 5449'
    }
};

// FONCTION POUR GENERER HTML D'UNE CARTE
function genererCarteHTML(joueur, type = 'fan') {
    const isVip = type === 'vip';
    const overlayClass = isVip ? 'vip' : '';
    const badgeClass = isVip ? 'vip' : '';
    const badgeText = isVip ? 'VIP' : 'GRATUITE';
    const numerocarte = isVip ? joueur.numeroCarteVip : joueur.numeroCarteFan;
    
    const logoPaieCash = isVip 
        ? `<div class="logo-paiecash" style="background: linear-gradient(135deg, #fbbf24, #f59e0b); color: #000;">PaieCash</div>`
        : `<div class="logo-paiecash">PaieCash</div>`;
    
    return `
        <div class="carte-bancaire">
            <div class="carte-background" style="background-image: url('${joueur.photoUrl}');"></div>
            <div class="carte-overlay ${overlayClass}"></div>
            <div class="carte-badge ${badgeClass}">${badgeText}</div>
            
            <div class="carte-content">
                <div class="carte-top">
                    <div class="logo-club">
                        <img src="${joueur.logoClub}" 
                             alt="${joueur.club}" 
                             onerror="this.outerHTML='<div style=\'font-size:30px\'>${joueur.drapeau}</div>';">
                    </div>
                    ${logoPaieCash}
                </div>
                
                <div style="flex: 1;"></div>
                
                <div>
                    <div class="carte-chip"></div>
                    <div class="carte-numero">${numerocarte}</div>
                    
                    <div class="carte-footer">
                        <div class="carte-info">
                            <div class="carte-label">Titulaire</div>
                            <div class="carte-nom">${joueur.nom}</div>
                        </div>
                        <div class="carte-validite">
                            <div class="carte-label">Valid Thru</div>
                            <div class="carte-validite-value">12/28</div>
                        </div>
                        <div class="logo-mastercard">
                            <div class="mastercard-circle mastercard-red"></div>
                            <div class="mastercard-circle mastercard-orange"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// FONCTION POUR GENERER PAGE COMPLETE POUR UN JOUEUR
function genererPageJoueur(joueurKey) {
    const joueur = joueursDatabase[joueurKey];
    if (!joueur) {
        console.error('Joueur non trouve:', joueurKey);
        return null;
    }
    
    const carteFan = genererCarteHTML(joueur, 'fan');
    const carteVip = genererCarteHTML(joueur, 'vip');
    
    return `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cartes ${joueur.nom} - PaieCashFan</title>
    <style>
        /* COPIER LES STYLES DE cartes-hakimi.html ICI */
    </style>
</head>
<body>
    <div class="container">
        <h1>${joueur.nom} - Cartes PaieCash</h1>
        
        <div class="info-box">
            <h2>Cartes Bancaires PaieCash</h2>
            <p>Cartes avec photo du joueur en fond, logos PaieCash, Mastercard et club</p>
        </div>

        <div class="joueur-section">
            <div class="joueur-header">
                <h2>${joueur.nom}</h2>
                <p>${joueur.club} - ${joueur.pays} - ${joueur.poste}</p>
            </div>

            <div class="cartes-grid">
                ${carteFan}
                ${carteVip}
            </div>
        </div>

        <div class="actions">
            <a href="index.html" class="btn">Retour Accueil</a>
            <a href="app-universal-simple.html?club=${encodeURIComponent(joueur.club)}" class="btn">Page ${joueur.club}</a>
        </div>
    </div>
</body>
</html>
    `;
}

// FONCTION POUR CHERCHER PHOTO JOUEUR SUR TRANSFERMARKT
async function chercherPhotoJoueur(nomJoueur, clubJoueur) {
    // Cette fonction necessite une API backend
    // Pour l'instant, retourne une URL par defaut
    
    const nomNormalise = nomJoueur.toLowerCase().replace(/\s+/g, '-');
    
    // URLs par defaut Transfermarkt (a adapter selon joueur)
    const urlsParDefaut = {
        'hakimi': 'https://img.a.transfermarkt.technology/portrait/big/340456-1695827181.jpg',
        'aubameyang': 'https://img.a.transfermarkt.technology/portrait/big/58864-1694609550.jpg',
        'pepe': 'https://img.a.transfermarkt.technology/portrait/big/296762-1664867850.jpg',
        'salah': 'https://img.a.transfermarkt.technology/portrait/big/148455-1694609710.jpg',
        'haaland': 'https://img.a.transfermarkt.technology/portrait/big/418560-1694610946.jpg'
    };
    
    return urlsParDefaut[nomNormalise] || 'https://via.placeholder.com/400x500?text=Photo+Non+Disponible';
}

// FONCTION POUR GENERER CARTES POUR TOUS LES JOUEURS D'UN CLUB
function genererCartesClub(nomClub) {
    const joueursClub = Object.entries(joueursDatabase)
        .filter(([key, joueur]) => joueur.club === nomClub);
    
    return joueursClub.map(([key, joueur]) => {
        return {
            key: key,
            carteFan: genererCarteHTML(joueur, 'fan'),
            carteVip: genererCarteHTML(joueur, 'vip'),
            joueur: joueur
        };
    });
}

// EXPORT
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        joueursDatabase,
        genererCarteHTML,
        genererPageJoueur,
        chercherPhotoJoueur,
        genererCartesClub
    };
}
