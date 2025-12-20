/**
 * PaieCashFan - SMS Payment System
 * Système de paiement par SMS sécurisé
 */

class SMSPayment {
    constructor() {
        this.pendingTransactions = new Map();
        this.maxAmount = 50; // Montant maximum par transaction SMS (en €)
        this.codeExpiryTime = 5 * 60 * 1000; // 5 minutes en millisecondes
    }
    
    /**
     * Initier un paiement par SMS
     * @param {object} paymentData - Données du paiement
     * @returns {Promise<object>} Résultat de l'initiation
     */
    async initiatePayment(paymentData) {
        const { 
            phoneNumber, 
            amount, 
            description, 
            type = 'purchase' // 'purchase', 'ticket', 'merchandise'
        } = paymentData;
        
        // Validations
        if (!this.validatePhoneNumber(phoneNumber)) {
            throw new Error('Numéro de téléphone invalide. Format attendu : +33 6 XX XX XX XX');
        }
        
        if (amount > this.maxAmount) {
            throw new Error(`Le montant maximum par SMS est de ${this.maxAmount}€. Utilisez le paiement crypto pour les montants supérieurs.`);
        }
        
        if (amount < 0.5) {
            throw new Error('Le montant minimum est de 0.50€');
        }
        
        // Générer un code de validation à 6 chiffres
        const validationCode = this.generateValidationCode();
        
        // Créer un ID de transaction
        const transactionId = this.generateTransactionId();
        
        // Stocker la transaction en attente
        this.pendingTransactions.set(transactionId, {
            phoneNumber,
            amount,
            description,
            type,
            validationCode,
            status: 'pending',
            createdAt: Date.now(),
            expiresAt: Date.now() + this.codeExpiryTime
        });
        
        // Simuler l'envoi du SMS (en production, appel à une API SMS réelle)
        await this.sendSMS(phoneNumber, validationCode, amount);
        
        // Nettoyer après expiration
        setTimeout(() => {
            if (this.pendingTransactions.has(transactionId)) {
                const transaction = this.pendingTransactions.get(transactionId);
                if (transaction.status === 'pending') {
                    transaction.status = 'expired';
                    this.pendingTransactions.delete(transactionId);
                }
            }
        }, this.codeExpiryTime);
        
        return {
            success: true,
            transactionId,
            message: `Un code de validation a été envoyé au ${this.maskPhoneNumber(phoneNumber)}`,
            expiresIn: this.codeExpiryTime / 1000 // En secondes
        };
    }
    
    /**
     * Valider un paiement avec le code SMS
     * @param {string} transactionId - ID de la transaction
     * @param {string} code - Code de validation reçu par SMS
     * @returns {Promise<object>} Résultat de la validation
     */
    async validatePayment(transactionId, code) {
        const transaction = this.pendingTransactions.get(transactionId);
        
        if (!transaction) {
            throw new Error('Transaction introuvable ou expirée');
        }
        
        if (transaction.status !== 'pending') {
            throw new Error(`Transaction déjà ${transaction.status === 'validated' ? 'validée' : 'expirée'}`);
        }
        
        if (Date.now() > transaction.expiresAt) {
            transaction.status = 'expired';
            this.pendingTransactions.delete(transactionId);
            throw new Error('Le code a expiré. Veuillez recommencer le paiement.');
        }
        
        // Vérifier le code
        if (code !== transaction.validationCode) {
            throw new Error('Code de validation incorrect');
        }
        
        // Valider la transaction
        transaction.status = 'validated';
        transaction.validatedAt = Date.now();
        
        // Simuler le traitement du paiement (en production, débiter via opérateur mobile)
        await this.processPayment(transaction);
        
        // Finaliser
        transaction.status = 'completed';
        
        // Sauvegarder dans l'historique
        this.saveToHistory(transaction);
        
        // Nettoyer
        this.pendingTransactions.delete(transactionId);
        
        return {
            success: true,
            transactionId,
            amount: transaction.amount,
            message: 'Paiement validé avec succès !',
            receipt: this.generateReceipt(transaction)
        };
    }
    
    /**
     * Générer un code de validation à 6 chiffres
     */
    generateValidationCode() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    
    /**
     * Générer un ID de transaction unique
     */
    generateTransactionId() {
        return 'SMS-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
    
    /**
     * Valider un numéro de téléphone
     */
    validatePhoneNumber(phone) {
        // Format français : +33 6/7 XX XX XX XX
        const regex = /^\+33[67]\d{8}$|^0[67]\d{8}$/;
        const cleanPhone = phone.replace(/\s/g, '');
        return regex.test(cleanPhone);
    }
    
    /**
     * Masquer partiellement un numéro de téléphone
     */
    maskPhoneNumber(phone) {
        const cleanPhone = phone.replace(/\s/g, '');
        if (cleanPhone.startsWith('+33')) {
            return `+33 ${cleanPhone.substr(3, 1)}** ** ** ${cleanPhone.substr(-2)}`;
        }
        return `${cleanPhone.substr(0, 2)}** ** ** ${cleanPhone.substr(-2)}`;
    }
    
    /**
     * Envoyer le SMS avec le code de validation
     * (Simulation - en production, utiliser Twilio, Nexmo, OVH SMS, etc.)
     */
    async sendSMS(phoneNumber, code, amount) {
        console.log(`📱 SMS envoyé à ${phoneNumber}`);
        console.log(`💬 Message : "Votre code PaieCashFan : ${code}. Montant : ${amount}€. Valide 5 min."`);
        
        // Simuler un délai d'envoi
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // En production, appeler une API SMS :
        /*
        await fetch('https://api.sms-provider.com/send', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer YOUR_API_KEY',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: phoneNumber,
                message: `Votre code PaieCashFan : ${code}. Montant : ${amount}€. Valide 5 min.`,
                from: 'PaieCashFan'
            })
        });
        */
        
        return { success: true };
    }
    
    /**
     * Traiter le paiement (débit via opérateur mobile)
     * (Simulation - en production, intégration avec opérateurs mobiles)
     */
    async processPayment(transaction) {
        console.log(`💳 Traitement paiement SMS : ${transaction.amount}€`);
        
        // Simuler le traitement
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // En production, intégration avec :
        // - Orange Money
        // - SFR Pay
        // - Bouygues Telecom Paiement
        // - Free Mobile Billing
        
        return { success: true };
    }
    
    /**
     * Générer un reçu de paiement
     */
    generateReceipt(transaction) {
        return {
            transactionId: transaction.transactionId || 'N/A',
            date: new Date(transaction.validatedAt).toLocaleString('fr-FR'),
            amount: `${transaction.amount.toFixed(2)}€`,
            description: transaction.description,
            type: transaction.type,
            paymentMethod: 'SMS',
            status: 'Payé'
        };
    }
    
    /**
     * Sauvegarder dans l'historique
     */
    saveToHistory(transaction) {
        const history = JSON.parse(localStorage.getItem('payment_history') || '[]');
        history.unshift({
            ...transaction,
            savedAt: Date.now()
        });
        
        // Garder seulement les 50 dernières transactions
        if (history.length > 50) {
            history.length = 50;
        }
        
        localStorage.setItem('payment_history', JSON.stringify(history));
    }
    
    /**
     * Obtenir l'historique des paiements
     */
    getHistory() {
        return JSON.parse(localStorage.getItem('payment_history') || '[]');
    }
    
    /**
     * Annuler une transaction en attente
     */
    cancelTransaction(transactionId) {
        if (this.pendingTransactions.has(transactionId)) {
            const transaction = this.pendingTransactions.get(transactionId);
            transaction.status = 'cancelled';
            this.pendingTransactions.delete(transactionId);
            return { success: true, message: 'Transaction annulée' };
        }
        return { success: false, message: 'Transaction introuvable' };
    }
    
    /**
     * Obtenir le statut d'une transaction
     */
    getTransactionStatus(transactionId) {
        const transaction = this.pendingTransactions.get(transactionId);
        if (!transaction) {
            // Vérifier dans l'historique
            const history = this.getHistory();
            const historicalTransaction = history.find(t => t.transactionId === transactionId);
            if (historicalTransaction) {
                return { found: true, status: 'completed', ...historicalTransaction };
            }
            return { found: false };
        }
        return { found: true, ...transaction };
    }
}

// Instance globale
window.smsPayment = new SMSPayment();
