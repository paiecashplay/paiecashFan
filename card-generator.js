/**
 * SYSTÈME DE GÉNÉRATION AUTOMATIQUE DE CARTES BANCAIRES
 * ========================================================
 * 
 * Ce système permet de généer automatiquement des millions de cartes
 * pour chaque club et chaque joueur africain sans avoir à créer 
 * manuellement chaque image.
 * 
 * Version: 1.0
 * Date: 16 Décembre 2025
 */

// Configuration des clubs
const clubsConfig = {
    'olympique-de-marseille': {
        nom: 'Olympique de Marseille',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/d8/Olympique_Marseille_logo.svg',
        couleurPrincipale: '#2FAEE0', // Bleu OM
        couleurSecondaire: '#FFFFFF'
    },
    'paris-saint-germain': {
        nom: 'Paris Saint-Germain',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/7/76/Paris_Saint-Germain_logo.png',
        couleurPrincipale: '#004170', // Bleu PSG
        couleurSecondaire: '#DA291C'  // Rouge PSG
    },
    'olympique-lyonnais': {
        nom: 'Olympique Lyonnais',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/e/e2/Olympique_lyonnais_%28logo%29.svg',
        couleurPrincipale: '#DA000D', // Rouge OL
        couleurSecondaire: '#FFFFFF'
    },
    'as-monaco': {
        nom: 'AS Monaco',
        logoUrl: 'https://upload.wikimedia.org/wikipedia/fr/9/9a/Logo_AS_Monaco_2021.svg',
        couleurPrincipale: '#DA0037', // Rouge Monaco
        couleurSecondaire: '#FFFFFF'
    }
    // Ajouter d'autres clubs ici...
};

// Base de données des joueurs africains
const joueursAfricains = [
    {
        id: 'aubameyang-om',
        club: 'olympique-de-marseille',
        nom: 'PIERRE-EMERICK',
        prenom: 'AUBAMEYANG',
        pays: '🇬🇦 Gabon',
        photoUrl: 'https://www.genspark.ai/api/files/s/mRvbluWz',
        numeroBase: '5412 7534 9876 54'
    },
    {
        id: 'kolo-muani-psg',
        club: 'paris-saint-germain',
        nom: 'RANDAL',
        prenom: 'KOLO MUANI',
        pays: '🇫🇷 France (origine RDC)',
        photoUrl: '', // À remplacer par URL réelle
        numeroBase: '5412 7534 9876 55'
    },
    {
        id: 'cherki-ol',
        club: 'olympique-lyonnais',
        nom: 'RAYAN',
        prenom: 'CHERKI',
        pays: '🇫🇷 France (origine Algérie)',
        photoUrl: '', // À remplacer par URL réelle
        numeroBase: '5412 7534 9876 56'
    }
    // Ajouter d'autres joueurs ici...
];

/**
 * FONCTION 1: Générer une carte bancaire sur Canvas (côté client)
 * ================================================================
 * Cette fonction crée une carte directement dans le navigateur
 */
function genererCarteSurCanvas(joueur, typecarte = 'fan') {
    const club = clubsConfig[joueur.club];
    const isVIP = typecarte === 'vip';
    
    // Créer un canvas
    const canvas = document.createElement('canvas');
    canvas.width = 1376;  // Format 16:9 comme les cartes IA
    canvas.height = 768;
    const ctx = canvas.getContext('2d');
    
    // Couleur de fond (bleu pour FAN, or pour VIP)
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    if (isVIP) {
        gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
        gradient.addColorStop(1, 'rgba(218, 165, 32, 0.6)');
    } else {
        gradient.addColorStop(0, club.couleurPrincipale);
        gradient.addColorStop(1, club.couleurSecondaire);
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Charger et dessiner la photo du joueur en arrière-plan
    const photoImg = new Image();
    photoImg.crossOrigin = 'anonymous';
    photoImg.src = joueur.photoUrl;
    
    return new Promise((resolve, reject) => {
        photoImg.onload = () => {
            // Dessiner la photo en arrière-plan avec transparence
            ctx.globalAlpha = 0.4;
            ctx.drawImage(photoImg, 0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1.0;
            
            // Dessiner le gradient par-dessus
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            // Couleur du texte
            const textColor = isVIP ? '#FFD700' : '#FFFFFF';
            
            // Logo du club (top-left)
            ctx.fillStyle = textColor;
            ctx.font = 'bold 32px Arial';
            ctx.fillText(club.nom.substring(0, 2).toUpperCase(), 50, 60);
            
            // PaieCash (top-right)
            ctx.font = 'bold 24px Arial';
            ctx.fillText('PaieCash', canvas.width - 180, 60);
            
            // Puce EMV (center-left)
            ctx.fillStyle = '#FFD700';
            ctx.fillRect(50, 300, 80, 60);
            ctx.fillStyle = textColor;
            ctx.font = '12px Arial';
            ctx.fillText('EMV', 70, 340);
            
            // Numéro de carte
            ctx.font = 'bold 32px Courier New';
            const numeroComplet = joueur.numeroBase + (isVIP ? '33' : '32');
            ctx.fillText(numeroComplet, 50, 450);
            
            // Date d'expiration
            ctx.font = 'bold 20px Arial';
            ctx.fillText('Valid thru: 12/28', 50, 500);
            
            // Nom du titulaire
            ctx.font = 'bold 24px Arial';
            const nomComplet = `${joueur.nom} ${joueur.prenom}`;
            ctx.fillText(nomComplet, 50, 550);
            
            // Logo Mastercard (bottom-right)
            ctx.fillStyle = '#EB001B'; // Rouge Mastercard
            ctx.beginPath();
            ctx.arc(canvas.width - 120, canvas.height - 80, 40, 0, 2 * Math.PI);
            ctx.fill();
            ctx.fillStyle = '#F79E1B'; // Orange Mastercard
            ctx.beginPath();
            ctx.arc(canvas.width - 60, canvas.height - 80, 40, 0, 2 * Math.PI);
            ctx.fill();
            
            // Convertir en Data URL
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
        };
        
        photoImg.onerror = reject;
    });
}

/**
 * FONCTION 2: Générer une carte avec overlay HTML/CSS (plus simple)
 * ==================================================================
 * Cette fonction utilise HTML/CSS par-dessus une photo pour créer la carte
 */
function genererCarteHTML(joueur, typeCard = 'fan') {
    const club = clubsConfig[joueur.club];
    const isVIP = typeCard === 'vip';
    const numeroComplet = joueur.numeroBase + (isVIP ? '33' : '32');
    const nomComplet = `${joueur.nom} ${joueur.prenom}`;
    
    const cardColor = isVIP ? 'linear-gradient(135deg, rgba(255, 215, 0, 0.8), rgba(218, 165, 32, 0.8))' : `linear-gradient(135deg, ${club.couleurPrincipale}, ${club.couleurSecondaire})`;
    const textColor = isVIP ? '#FFD700' : '#FFFFFF';
    
    return `
        <div style="
            position: relative;
            width: 600px;
            height: 375px;
            border-radius: 12px;
            overflow: hidden;
            background: ${cardColor};
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        ">
            <!-- Photo du joueur en arrière-plan -->
            <img src="${joueur.photoUrl}" 
                 style="
                     position: absolute;
                     top: 0;
                     left: 0;
                     width: 100%;
                     height: 100%;
                     object-fit: cover;
                     opacity: 0.3;
                     z-index: 0;
                 ">
            
            <!-- Overlay gradient -->
            <div style="
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: ${cardColor};
                opacity: 0.6;
                z-index: 1;
            "></div>
            
            <!-- Contenu de la carte -->
            <div style="position: relative; z-index: 2; padding: 30px; color: ${textColor};">
                <!-- Logo club (top-left) -->
                <div style="position: absolute; top: 20px; left: 30px; font-size: 24px; font-weight: bold;">
                    ${club.nom.substring(0, 3).toUpperCase()}
                </div>
                
                <!-- PaieCash (top-right) -->
                <div style="position: absolute; top: 20px; right: 30px; font-size: 18px; font-weight: bold;">
                    PaieCash
                </div>
                
                <!-- Puce EMV -->
                <div style="
                    position: absolute;
                    top: 120px;
                    left: 30px;
                    width: 50px;
                    height: 40px;
                    background: #FFD700;
                    border-radius: 5px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 10px;
                    color: #000;
                    font-weight: bold;
                ">
                    EMV
                </div>
                
                <!-- Numéro de carte -->
                <div style="
                    position: absolute;
                    top: 200px;
                    left: 30px;
                    font-size: 24px;
                    font-weight: bold;
                    font-family: 'Courier New', monospace;
                    letter-spacing: 2px;
                ">
                    ${numeroComplet}
                </div>
                
                <!-- Date d'expiration -->
                <div style="
                    position: absolute;
                    top: 250px;
                    left: 30px;
                    font-size: 14px;
                    font-weight: bold;
                ">
                    Valid thru: 12/28
                </div>
                
                <!-- Nom du titulaire -->
                <div style="
                    position: absolute;
                    top: 285px;
                    left: 30px;
                    font-size: 16px;
                    font-weight: bold;
                    letter-spacing: 1px;
                ">
                    ${nomComplet}
                </div>
                
                <!-- Logo Mastercard (bottom-right) -->
                <div style="position: absolute; bottom: 30px; right: 30px; display: flex; gap: -10px;">
                    <div style="width: 40px; height: 40px; background: #EB001B; border-radius: 50%;"></div>
                    <div style="width: 40px; height: 40px; background: #F79E1B; border-radius: 50%; margin-left: -20px;"></div>
                </div>
            </div>
        </div>
    `;
}

/**
 * FONCTION 3: Générer toutes les cartes pour un club
 * ===================================================
 */
function genererCartesClub(clubId) {
    const joueursClub = joueursAfricains.filter(j => j.club === clubId);
    const cartes = [];
    
    joueursClub.forEach(joueur => {
        // Carte FAN
        cartes.push({
            type: 'fan',
            joueur: joueur,
            html: genererCarteHTML(joueur, 'fan')
        });
        
        // Carte VIP
        cartes.push({
            type: 'vip',
            joueur: joueur,
            html: genererCarteHTML(joueur, 'vip')
        });
    });
    
    return cartes;
}

/**
 * FONCTION 4: Intégration dans l'application
 * ===========================================
 */
function afficherCartesAfrique(clubId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const cartes = genererCartesClub(clubId);
    
    container.innerHTML = cartes.map(carte => carte.html).join('');
}

// Export des fonctions
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        clubsConfig,
        joueursAfricains,
        genererCarteSurCanvas,
        genererCarteHTML,
        genererCartesClub,
        afficherCartesAfrique
    };
}
