// ====================================
// CORRECTIONS v2.6.0 - PaieCashPlay
// ====================================

// === AUTOCOMPLÉTION AMIS ===

function envoyerArgentAmi() {
    const amis = [
        { nom: 'Marc Durand', telephone: '+33 6 12 34 56 78', email: 'marc@email.com' },
        { nom: 'Sophie Martin', telephone: '+33 6 23 45 67 89', email: 'sophie@email.com' },
        { nom: 'Julien Bernard', telephone: '+33 6 34 56 78 90', email: 'julien@email.com' },
        { nom: 'Emma Dubois', telephone: '+33 6 45 67 89 01', email: 'emma@email.com' },
        { nom: 'Thomas Petit', telephone: '+33 6 56 78 90 12', email: 'thomas@email.com' },
        { nom: 'Cameron', telephone: '+33 6 67 89 01 23', email: 'cameron@email.com' }
    ];
    
    const nomAmi = prompt('👥 Envoyer de l\'argent à un ami\n\nEntrez le nom (les premiers caractères suffisent) :\n\n' + amis.map(a => `• ${a.nom}`).join('\n'));
    
    if (!nomAmi) return;
    
    // Recherche d'ami
    const amiTrouve = amis.find(a => a.nom.toLowerCase().startsWith(nomAmi.toLowerCase()));
    
    if (!amiTrouve) {
        alert('❌ Ami non trouvé.\n\nAmis disponibles :\n' + amis.map(a => `• ${a.nom}`).join('\n'));
        return;
    }
    
    const montant = prompt(`💸 Envoyer de l'argent à ${amiTrouve.nom}\n\nMontant (en €) :`);
    if (!montant || isNaN(montant) || montant <= 0) return;
    
    const montantNum = parseFloat(montant);
    
    // Code secret si > 30€
    if (montantNum > 30) {
        const code = prompt('🔒 Code de sécurité OBLIGATOIRE\n\n(Le montant dépasse 30€)\n\nEntrez votre code secret à 4 chiffres :');
        if (!code || code.length !== 4) {
            alert('❌ Code invalide. Transfert annulé.');
            return;
        }
    }
    
    alert(`✅ Transfert instantané effectué par PaieCash\n\n💸 ${montant}€ envoyés à ${amiTrouve.nom}\n📱 ${amiTrouve.telephone}\n⚡ Transfert instantané\n\n📧 ${amiTrouve.nom} a reçu l'argent immédiatement`);
    
    // Ajouter à l'historique
    if (typeof ajouterTransaction === 'function') {
        ajouterTransaction({
            type: 'Transfert',
            description: `Envoi instantané à ${amiTrouve.nom}`,
            montant: -montantNum,
            devise: 'EUR',
            statut: 'Complété'
        });
    }
}

// === ENVOI OM COIN AVEC AUTOCOMPLÉTION ===

function envoyerOMCoin() {
    const amis = [
        { nom: 'Marc Durand', wallet: '0x742...3a' },
        { nom: 'Sophie Martin', wallet: '0x823...5b' },
        { nom: 'Julien Bernard', wallet: '0x934...8c' },
        { nom: 'Emma Dubois', wallet: '0xa45...2d' },
        { nom: 'Thomas Petit', wallet: '0xb56...7e' },
        { nom: 'Cameron', wallet: '0xc67...9f' }
    ];
    
    const nomAmi = prompt('🏟️ Envoyer des OM Coins\n\nEntrez le nom de l\'ami :\n\n' + amis.map(a => `• ${a.nom} (${a.wallet})`).join('\n'));
    
    if (!nomAmi) return;
    
    const amiTrouve = amis.find(a => a.nom.toLowerCase().startsWith(nomAmi.toLowerCase()));
    
    if (!amiTrouve) {
        alert('❌ Ami non trouvé.');
        return;
    }
    
    const montant = prompt(`🏟️ Envoyer des OM Coins à ${amiTrouve.nom}\n\nMontant (en OMC) :`);
    if (!montant || isNaN(montant) || montant <= 0) return;
    
    const montantNum = parseFloat(montant);
    
    alert(`✅ Envoi effectué par PaieCash\n\n🏟️ ${montant} OMC envoyés à ${amiTrouve.nom}\n💳 Wallet: ${amiTrouve.wallet}\n⚡ Transaction instantanée`);
    
    if (typeof ajouterTransaction === 'function') {
        ajouterTransaction({
            type: 'Envoi OM Coin',
            description: `Envoi à ${amiTrouve.nom}`,
            montant: -montantNum,
            devise: 'OMC',
            statut: 'Complété'
        });
    }
}

// === ÉCHANGE DE COINS (Clubs + EURC + USDT) ===

function echangerCoin(coinActuel, montantActuel) {
    const coins = [
        { nom: 'OM Coin', code: 'OMC', taux: 1.0 },
        { nom: 'PSG Coin', code: 'PSC', taux: 1.0 },
        { nom: 'OL Coin', code: 'OLC', taux: 1.0 },
        { nom: 'Monaco Coin', code: 'ASC', taux: 1.0 },
        { nom: 'LOSC Coin', code: 'LSC', taux: 1.0 },
        { nom: 'Lens Coin', code: 'RCL', taux: 1.0 },
        { nom: 'EURC', code: 'EURC', taux: 1.0 },
        { nom: 'USDT', code: 'USDT', taux: 1.0 }
    ];
    
    const listeCoin = coins.filter(c => c.code !== coinActuel).map((c, i) => `${i+1}. ${c.nom} (${c.code})`).join('\n');
    
    const choix = prompt(`🔄 Échanger ${coinActuel}\n\nSolde actuel : ${montantActuel} ${coinActuel}\n\nVers quel coin ?\n\n${listeCoin}\n\nEntrez le numéro :`);
    
    if (!choix) return;
    
    const index = parseInt(choix) - 1;
    const coinsDisponibles = coins.filter(c => c.code !== coinActuel);
    
    if (index < 0 || index >= coinsDisponibles.length) {
        alert('❌ Choix invalide');
        return;
    }
    
    const coinCible = coinsDisponibles[index];
    
    const montant = prompt(`💱 Échanger ${coinActuel} → ${coinCible.code}\n\nMontant à échanger (en ${coinActuel}) :\n(Taux : 1:1 sans frais)`);
    
    if (!montant || isNaN(montant) || montant <= 0 || montant > montantActuel) {
        alert('❌ Montant invalide');
        return;
    }
    
    const montantNum = parseFloat(montant);
    
    alert(`✅ Échange effectué par PaieCash\n\n🔄 ${montant} ${coinActuel} → ${montant} ${coinCible.code}\n💱 Taux : 1:1 (sans frais)\n⚡ Transaction instantanée\n\n📊 Nouveau solde :\n• ${coinActuel} : ${montantActuel - montantNum}\n• ${coinCible.code} : augmenté de ${montant}`);
    
    if (typeof ajouterTransaction === 'function') {
        ajouterTransaction({
            type: 'Échange',
            description: `${coinActuel} → ${coinCible.code}`,
            montant: montantNum,
            devise: coinCible.code,
            statut: 'Complété'
        });
    }
}

// === ACHAT DE COINS AVEC DÉBIT ===

function acheterCoinAvecDebit(coinNom, coinCode, soldeActuel) {
    const montant = prompt(`💰 Acheter ${coinNom} (${coinCode})\n\nTaux : 1 ${coinCode} = 1 EUR\n\nMontant à acheter (en EUR) :`);
    
    if (!montant || isNaN(montant) || montant <= 0) return;
    
    const montantNum = parseFloat(montant);
    
    // Vérifier si le solde OM Coin est suffisant (exemple: 2450 OMC)
    const soldeOMC = 2450;
    
    if (montantNum > soldeOMC) {
        alert(`❌ Solde OM Coin insuffisant\n\nSolde disponible : ${soldeOMC} OMC\nMontant demandé : ${montant} EUR\n\n💡 Rechargez votre wallet d'abord`);
        return;
    }
    
    alert(`✅ Achat effectué par PaieCash\n\n💰 ${montant} ${coinCode} achetés\n💳 Débité : ${montant} OMC\n🏦 Taux : 1:1\n⚡ Transaction instantanée\n\n📊 Nouveaux soldes :\n• OM Coin : ${soldeOMC - montantNum} OMC\n• ${coinCode} : ${soldeActuel + montantNum}`);
    
    if (typeof ajouterTransaction === 'function') {
        ajouterTransaction({
            type: 'Achat Coin',
            description: `Achat de ${montant} ${coinCode}`,
            montant: -montantNum,
            devise: 'OMC',
            statut: 'Complété'
        });
        
        ajouterTransaction({
            type: 'Achat Coin',
            description: `Reçu ${montant} ${coinCode}`,
            montant: montantNum,
            devise: coinCode,
            statut: 'Complété'
        });
    }
}

// === BNPL AMÉLIORÉ AVEC COMMISSION 1.5% ===

function choisirBNPL(prix, nomProduit) {
    const options = `💳 BNPL - Paiement en plusieurs fois\n\nProduit : ${nomProduit}\nMontant total : ${prix}€\n\nChoisissez votre formule :\n\n1️⃣ 3x SANS FRAIS : ${(prix / 3).toFixed(2)}€/mois\n2️⃣ 4x SANS FRAIS : ${(prix / 4).toFixed(2)}€/mois\n3️⃣ 6x avec frais 1.5% : ${((prix * 1.015) / 6).toFixed(2)}€/mois\n   (Commission : ${(prix * 0.015).toFixed(2)}€)\n\nEntrez 3, 4 ou 6 :`;
    
    const choice = prompt(options);
    
    if (!choice || !['3', '4', '6'].includes(choice)) {
        alert('❌ Choix invalide. Paiement annulé.');
        return false;
    }
    
    const months = parseInt(choice);
    const hasFees = months === 6;
    const commission = hasFees ? prix * 0.015 : 0;
    const total = prix + commission;
    const monthly = total / months;
    
    const confirmer = confirm(`💳 Confirmer le paiement BNPL\n\n🛍️ ${nomProduit}\n💰 Prix : ${prix}€\n📅 ${months} mensualités de ${monthly.toFixed(2)}€\n${hasFees ? '⚠️ Commission 1.5% : ' + commission.toFixed(2) + '€' : '✅ Sans frais'}\n💳 Total à payer : ${total.toFixed(2)}€\n\n✅ Confirmer ?`);
    
    if (!confirmer) {
        alert('❌ Paiement annulé');
        return false;
    }
    
    alert(`✅ Paiement BNPL validé par PaieCash\n\n🛍️ ${nomProduit}\n💰 ${prix}€ en ${months}x\n\n📅 Échéancier :\n• ${months} mensualités de ${monthly.toFixed(2)}€\n• Prélèvement automatique\n${hasFees ? '• Commission 1.5% : ' + commission.toFixed(2) + '€' : '• Sans frais'}\n\n✅ Achat immédiat, paiement différé !\n\n📧 Récapitulatif envoyé par email\n\n❌ [Annuler cette transaction]`);
    
    if (typeof ajouterTransaction === 'function') {
        ajouterTransaction({
            type: 'BNPL ' + months + 'x',
            description: `${nomProduit} (${months} mensualités)`,
            montant: -monthly,
            devise: 'EUR',
            statut: 'Validé'  // Changé de "En cours" à "Validé"
        });
    }
    
    return true;
}

// === SYSTÈME D'INVITATION AMIS ===

function inviterAmis() {
    const lienInvitation = 'https://paiecash.om/invite/ETOT' + Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const choix = prompt(`👥 Inviter des amis et gagner !\n\n🎁 Avantages :\n• +50 points par ami inscrit\n• +2% cashback sur leurs achats\n• Bonus fidélité cumulés\n\nComment inviter ?\n\n1️⃣ Copier le lien d'invitation\n2️⃣ Partager par SMS\n3️⃣ Partager par Email\n4️⃣ Afficher le QR Code\n\nEntrez 1, 2, 3 ou 4 :`);
    
    if (choix === '1') {
        navigator.clipboard.writeText(lienInvitation);
        alert(`✅ Lien copié !\n\n🔗 ${lienInvitation}\n\n📋 Partagez ce lien avec vos amis !\n\n🎁 +50 points par ami inscrit\n💰 +2% cashback sur leurs achats`);
    } else if (choix === '2') {
        alert(`📱 Partage par SMS\n\nMessage à envoyer :\n\n"Rejoins-moi sur PaieCashPlay OM ! 🏟️\nGagne des points et profite d'offres exclusives !\n\n${lienInvitation}\n\nÀ bientôt ! ⚽"`);
    } else if (choix === '3') {
        alert(`📧 Partage par Email\n\nObjet : Rejoins PaieCashPlay OM !\n\nMessage :\n\nSalut,\n\nJe t'invite à rejoindre PaieCashPlay, l'app des fans de l'OM ! 🏟️\n\nAvantages :\n• Points fidélité\n• Cashback sur achats\n• Billetterie prioritaire\n• NFT collectors\n\nInscris-toi ici : ${lienInvitation}\n\nÀ bientôt ! ⚽`);
    } else if (choix === '4') {
        alert(`📱 QR Code d'Invitation\n\n[QR CODE]\n${lienInvitation}\n\n📸 Faites scanner ce QR Code à vos amis !`);
    }
}

// === MISSIONS PARTAGEABLES ===

function partagerMission(missionNom, recompense) {
    const choix = prompt(`📤 Partager la mission "${missionNom}"\n\nRécompense : ${recompense}\n\nOù partager ?\n\n1️⃣ WhatsApp\n2️⃣ Facebook\n3️⃣ Twitter\n4️⃣ Instagram\n5️⃣ Copier le lien\n\nEntrez 1, 2, 3, 4 ou 5 :`);
    
    const lien = `https://paiecash.om/missions/${missionNom.toLowerCase().replace(/ /g, '-')}`;
    
    if (choix === '1') {
        alert(`📱 Partage WhatsApp\n\n"J'ai complété la mission "${missionNom}" sur PaieCashPlay ! 🏟️\n\nRécompense : ${recompense}\n\nRejoins-moi !\n${lien}"`);
    } else if (choix === '5') {
        navigator.clipboard.writeText(lien);
        alert(`✅ Lien copié !\n\n🔗 ${lien}`);
    }
}

// === INFO BNPL ===

function afficherInfoBNPL() {
    alert(`💳 BNPL - Buy Now Pay Later\n\n🛍️ Payez vos achats en plusieurs fois !\n\nFormules disponibles :\n\n1️⃣ 3x SANS FRAIS\n   Divisez en 3 mensualités\n   Idéal pour 50-200€\n\n2️⃣ 4x SANS FRAIS\n   Divisez en 4 mensualités\n   Idéal pour 200-500€\n\n3️⃣ 6x avec frais 1.5%\n   Divisez en 6 mensualités\n   Commission 1.5% du montant\n   Ex: 300€ → 6x 50.75€\n\n✅ Disponible partout :\n• Boutique club\n• Billetterie\n• NFT Marketplace\n• Produits partenaires\n\n💡 Achetez maintenant, payez plus tard !`);
}

console.log('✅ Corrections v2.6.0 chargées');
