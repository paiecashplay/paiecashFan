// ========================================
// PRODUITS PHARES PAR CLUB
// e-SIM et Mastercard personnalisés
// ========================================

/**
 * Produits phares universels pour TOUS les clubs
 * Ces produits doivent être affichés en PREMIER dans toutes les boutiques
 */

const PRODUITS_PHARES = {
    
    /**
     * Récupère les 2 produits phares d'un club
     * @param {string} clubSlug - Slug du club (ex: 'liverpool', 'paris-saint-germain')
     * @returns {Array} - Tableau de 2 produits phares
     */
    getProduitsPharesClub(clubSlug) {
        const clubInfo = this.getClubInfo(clubSlug);
        
        return [
            // 1️⃣ E-SIM DU CLUB
            {
                id: `esim-${clubSlug}`,
                type: 'esim',
                nom: `e-SIM ${clubInfo.name}`,
                description: `e-SIM officielle ${clubInfo.name} - Données illimitées en Europe, cashback 5% sur chaque achat`,
                prix: 9.99,
                prixBarré: 14.99,
                reduction: 33,
                emoji: '📱',
                image: clubInfo.esimImage,
                couleur1: clubInfo.couleur1,
                couleur2: clubInfo.couleur2,
                stock: 'instock',
                badges: ['🔥 BEST SELLER', '⚡ ACTIVATION INSTANTANÉE'],
                specifications: [
                    '📡 Données illimitées en UE',
                    '🌍 Roaming 100+ pays',
                    '💰 Cashback 5% sur chaque achat',
                    '⚡ Activation en 2 minutes',
                    `🎨 Design aux couleurs ${clubInfo.name}`,
                    '🔒 Sécurité maximale'
                ],
                avantages: [
                    'Pas de changement de SIM physique',
                    'Compatible iPhone & Android récents',
                    'Support client 7j/7',
                    'Cashback automatique sur wallet'
                ]
            },
            
            // 2️⃣ MASTERCARD DU CLUB
            {
                id: `mastercard-${clubSlug}`,
                type: 'mastercard',
                nom: `Mastercard ${clubInfo.name}`,
                description: `Mastercard officielle ${clubInfo.name} - Design exclusif, cashback 3% sur tous vos achats`,
                prix: 0.00, // GRATUITE
                prixBarré: 29.99,
                reduction: 100,
                emoji: '💳',
                image: clubInfo.mastercardImage,
                couleur1: clubInfo.couleur1,
                couleur2: clubInfo.couleur2,
                stock: 'instock',
                badges: ['🆓 GRATUITE', '💎 ÉDITION LIMITÉE'],
                specifications: [
                    '💳 Mastercard World Elite',
                    '💰 Cashback 3% sur tous achats',
                    '🎨 Design exclusif aux couleurs du club',
                    '🌍 Acceptée partout dans le monde',
                    '🔒 Sécurité 3D Secure',
                    '📲 Apple Pay & Google Pay',
                    '✈️ Assurance voyage incluse',
                    '🎁 Offres VIP club'
                ],
                avantages: [
                    'Livraison gratuite en 48h',
                    'Sans frais de tenue de compte',
                    'Plafonds adaptables',
                    'Support prioritaire 24/7'
                ]
            }
        ];
    },
    
    /**
     * Informations visuelles par club
     */
    getClubInfo(clubSlug) {
        const clubsData = {
            'olympique-de-marseille': {
                name: 'OM',
                couleur1: '#0099CC',
                couleur2: '#FFFFFF',
                esimImage: 'https://via.placeholder.com/400x250/0099CC/FFFFFF?text=e-SIM+OM',
                mastercardImage: 'https://via.placeholder.com/400x250/0099CC/FFFFFF?text=Mastercard+OM'
            },
            'paris-saint-germain': {
                name: 'PSG',
                couleur1: '#004170',
                couleur2: '#DA020E',
                esimImage: 'https://via.placeholder.com/400x250/004170/DA020E?text=e-SIM+PSG',
                mastercardImage: 'https://via.placeholder.com/400x250/004170/DA020E?text=Mastercard+PSG'
            },
            'olympique-lyonnais': {
                name: 'OL',
                couleur1: '#D50029',
                couleur2: '#003F87',
                esimImage: 'https://via.placeholder.com/400x250/D50029/003F87?text=e-SIM+OL',
                mastercardImage: 'https://via.placeholder.com/400x250/D50029/003F87?text=Mastercard+OL'
            },
            'as-monaco': {
                name: 'AS Monaco',
                couleur1: '#E30613',
                couleur2: '#FFFFFF',
                esimImage: 'https://via.placeholder.com/400x250/E30613/FFFFFF?text=e-SIM+Monaco',
                mastercardImage: 'https://via.placeholder.com/400x250/E30613/FFFFFF?text=Mastercard+Monaco'
            },
            'losc-lille': {
                name: 'LOSC',
                couleur1: '#E2001A',
                couleur2: '#FFFFFF',
                esimImage: 'https://via.placeholder.com/400x250/E2001A/FFFFFF?text=e-SIM+LOSC',
                mastercardImage: 'https://via.placeholder.com/400x250/E2001A/FFFFFF?text=Mastercard+LOSC'
            },
            'rc-lens': {
                name: 'RC Lens',
                couleur1: '#FFCC00',
                couleur2: '#DD0000',
                esimImage: 'https://via.placeholder.com/400x250/FFCC00/DD0000?text=e-SIM+Lens',
                mastercardImage: 'https://via.placeholder.com/400x250/FFCC00/DD0000?text=Mastercard+Lens'
            },
            'sco-angers': {
                name: 'SCO Angers',
                couleur1: '#000000',
                couleur2: '#FFFFFF',
                esimImage: 'https://via.placeholder.com/400x250/000000/FFFFFF?text=e-SIM+Angers',
                mastercardImage: 'https://via.placeholder.com/400x250/000000/FFFFFF?text=Mastercard+Angers'
            },
            'stade-rennais': {
                name: 'Stade Rennais',
                couleur1: '#FF0000',
                couleur2: '#000000',
                esimImage: 'https://via.placeholder.com/400x250/FF0000/000000?text=e-SIM+Rennes',
                mastercardImage: 'https://via.placeholder.com/400x250/FF0000/000000?text=Mastercard+Rennes'
            },
            'ogc-nice': {
                name: 'OGC Nice',
                couleur1: '#FF0000',
                couleur2: '#000000',
                esimImage: 'https://via.placeholder.com/400x250/FF0000/000000?text=e-SIM+Nice',
                mastercardImage: 'https://via.placeholder.com/400x250/FF0000/000000?text=Mastercard+Nice'
            },
            'liverpool': {
                name: 'Liverpool FC',
                couleur1: '#C8102E',
                couleur2: '#00B2A9',
                esimImage: 'https://via.placeholder.com/400x250/C8102E/00B2A9?text=e-SIM+Liverpool',
                mastercardImage: 'https://via.placeholder.com/400x250/C8102E/00B2A9?text=Mastercard+Liverpool'
            },
            'arsenal': {
                name: 'Arsenal FC',
                couleur1: '#EF0107',
                couleur2: '#023474',
                esimImage: 'https://via.placeholder.com/400x250/EF0107/023474?text=e-SIM+Arsenal',
                mastercardImage: 'https://via.placeholder.com/400x250/EF0107/023474?text=Mastercard+Arsenal'
            },
            'manchester-city': {
                name: 'Manchester City',
                couleur1: '#6CABDD',
                couleur2: '#1C2C5B',
                esimImage: 'https://via.placeholder.com/400x250/6CABDD/1C2C5B?text=e-SIM+City',
                mastercardImage: 'https://via.placeholder.com/400x250/6CABDD/1C2C5B?text=Mastercard+City'
            },
            'bayern-munich': {
                name: 'Bayern Munich',
                couleur1: '#DC052D',
                couleur2: '#0066B2',
                esimImage: 'https://via.placeholder.com/400x250/DC052D/0066B2?text=e-SIM+Bayern',
                mastercardImage: 'https://via.placeholder.com/400x250/DC052D/0066B2?text=Mastercard+Bayern'
            },
            'real-madrid': {
                name: 'Real Madrid',
                couleur1: '#FFFFFF',
                couleur2: '#00529B',
                esimImage: 'https://via.placeholder.com/400x250/FFFFFF/00529B?text=e-SIM+Madrid',
                mastercardImage: 'https://via.placeholder.com/400x250/FFFFFF/00529B?text=Mastercard+Madrid'
            },
            'galatasaray': {
                name: 'Galatasaray SK',
                couleur1: '#FE001E',
                couleur2: '#FFCE00',
                esimImage: 'https://via.placeholder.com/400x250/FE001E/FFCE00?text=e-SIM+Galatasaray',
                mastercardImage: 'https://via.placeholder.com/400x250/FE001E/FFCE00?text=Mastercard+Galatasaray'
            },
            'fenerbahce': {
                name: 'Fenerbahçe SK',
                couleur1: '#FFCC00',
                couleur2: '#003399',
                esimImage: 'https://via.placeholder.com/400x250/FFCC00/003399?text=e-SIM+Fenerbahce',
                mastercardImage: 'https://via.placeholder.com/400x250/FFCC00/003399?text=Mastercard+Fenerbahce'
            },
            'besiktas': {
                name: 'Beşiktaş JK',
                couleur1: '#000000',
                couleur2: '#FFFFFF',
                esimImage: 'https://via.placeholder.com/400x250/000000/FFFFFF?text=e-SIM+Besiktas',
                mastercardImage: 'https://via.placeholder.com/400x250/000000/FFFFFF?text=Mastercard+Besiktas'
            }
        };
        
        return clubsData[clubSlug] || {
            name: 'Club',
            couleur1: '#000000',
            couleur2: '#FFFFFF',
            esimImage: 'https://via.placeholder.com/400x250/000000/FFFFFF?text=e-SIM',
            mastercardImage: 'https://via.placeholder.com/400x250/000000/FFFFFF?text=Mastercard'
        };
    },
    
    /**
     * Génère le HTML pour afficher les produits phares
     * avec un design premium différent des autres produits
     */
    renderProduitsPharesHTML(clubSlug) {
        const produits = this.getProduitsPharesClub(clubSlug);
        
        return `
            <div style="grid-column: 1/-1; margin-bottom: 20px;">
                <div style="background: linear-gradient(135deg, rgba(16,185,129,0.1), rgba(59,130,246,0.1)); border-radius: 20px; padding: 25px; border: 2px solid rgba(16,185,129,0.3);">
                    <h3 style="margin: 0 0 20px 0; font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
                        🏆 PRODUITS PHARES
                        <span style="font-size: 12px; background: rgba(16,185,129,0.2); padding: 5px 12px; border-radius: 20px; font-weight: 600;">Exclusifs</span>
                    </h3>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
                        ${produits.map(p => `
                            <div class="product-card produit-phare" onclick="toggleProduitPhare('${p.id}')" id="product-${p.id}" 
                                 style="background: linear-gradient(145deg, ${p.couleur1}15, ${p.couleur2}15); border: 2px solid ${p.couleur1}40; position: relative; overflow: visible; cursor: pointer; transition: all 0.3s;">
                                
                                <!-- Badges absolus -->
                                <div style="position: absolute; top: -10px; left: 10px; display: flex; gap: 8px; z-index: 2;">
                                    ${p.badges.map(badge => `
                                        <span style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 6px 12px; border-radius: 20px; font-size: 10px; font-weight: 700; box-shadow: 0 4px 10px rgba(16,185,129,0.3);">
                                            ${badge}
                                        </span>
                                    `).join('')}
                                </div>
                                
                                ${p.reduction > 0 ? `
                                    <div style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; padding: 8px 14px; border-radius: 12px; font-size: 13px; font-weight: 900; z-index: 2; box-shadow: 0 4px 10px rgba(239,68,68,0.4);">
                                        -${p.reduction}%
                                    </div>
                                ` : ''}
                                
                                <!-- Image/Emoji grand format -->
                                <div style="font-size: 80px; text-align: center; margin: 30px 0 15px 0; filter: drop-shadow(0 10px 20px rgba(0,0,0,0.2));">
                                    ${p.emoji}
                                </div>
                                
                                <!-- Nom -->
                                <div style="font-size: 18px; font-weight: 700; margin-bottom: 8px; text-align: center; color: #fff;">
                                    ${p.nom}
                                </div>
                                
                                <!-- Description courte -->
                                <div style="font-size: 12px; opacity: 0.8; text-align: center; margin-bottom: 15px; line-height: 1.4;">
                                    ${p.description.substring(0, 80)}...
                                </div>
                                
                                <!-- Prix -->
                                <div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 15px;">
                                    ${p.prixBarré > p.prix ? `
                                        <span style="text-decoration: line-through; opacity: 0.5; font-size: 15px;">${p.prixBarré.toFixed(2)} €</span>
                                    ` : ''}
                                    <div style="color: #10b981; font-size: 26px; font-weight: 900;">
                                        ${p.prix === 0 ? 'GRATUIT' : p.prix.toFixed(2) + ' €'}
                                    </div>
                                </div>
                                
                                <!-- Bouton CTA -->
                                <button style="width: 100%; padding: 14px; background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 12px; font-weight: 700; font-size: 14px; cursor: pointer; transition: all 0.3s; box-shadow: 0 4px 15px rgba(16,185,129,0.3);"
                                        onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 20px rgba(16,185,129,0.4)'"
                                        onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 15px rgba(16,185,129,0.3)'"
                                        onclick="event.stopPropagation(); toggleProduitPhare('${p.id}')">
                                    ✅ SÉLECTIONNER
                                </button>
                                
                                <!-- Voir détails -->
                                <div style="text-align: center; margin-top: 10px; font-size: 11px; opacity: 0.7; cursor: pointer;" onclick="event.stopPropagation(); voirDetailsProduitPhare('${p.id}')">
                                    📋 Voir toutes les caractéristiques
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }
};

// Export pour utilisation dans app-universal-simple.html
if (typeof window !== 'undefined') {
    window.PRODUITS_PHARES = PRODUITS_PHARES;
}
