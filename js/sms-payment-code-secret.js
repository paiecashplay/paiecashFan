// SMS Payment with Secret Code V6.0
class SMSPaymentCodeSecret {
    constructor() {
        this.demoMode = true;
        this.currentCode = null;
        this.attempts = 0;
        this.maxAttempts = 3;
    }

    sendCode(phoneNumber, amount) {
        if (this.demoMode) {
            this.currentCode = Math.floor(100000 + Math.random() * 900000).toString();
            this.attempts = 0;
            this.expiresAt = Date.now() + (5 * 60 * 1000); // 5 minutes

            console.log(`📱 SMS envoyé au ${phoneNumber}`);
            console.log(`🔑 Code secret (DEMO): ${this.currentCode}`);
            
            return {
                success: true,
                message: `Code envoyé au ${phoneNumber}`,
                demoCode: this.currentCode,
                expiresIn: 300
            };
        }
    }

    verifyCode(code) {
        if (this.demoMode) {
            this.attempts++;

            if (Date.now() > this.expiresAt) {
                return {
                    success: false,
                    error: 'Code expiré',
                    remainingAttempts: this.maxAttempts - this.attempts
                };
            }

            if (this.attempts > this.maxAttempts) {
                return {
                    success: false,
                    error: 'Nombre maximum de tentatives atteint',
                    remainingAttempts: 0
                };
            }

            if (code === this.currentCode) {
                return {
                    success: true,
                    message: 'Paiement validé !'
                };
            }

            return {
                success: false,
                error: 'Code incorrect',
                remainingAttempts: this.maxAttempts - this.attempts
            };
        }
    }
}

window.smsPayment = new SMSPaymentCodeSecret();
console.log('✅ SMS Payment Code Secret V6.0 chargé');
