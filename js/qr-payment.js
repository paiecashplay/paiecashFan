// QR Payment System V6.0
class QRPayment {
    constructor() {
        this.demoMode = true;
    }

    generateQRCode(amount, reference) {
        if (this.demoMode) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        qrCode: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%23000' font-size='20'%3EQR Code%3C/text%3E%3C/svg%3E`,
                        reference: reference || 'QR' + Date.now(),
                        amount: amount,
                        expiresAt: Date.now() + (5 * 60 * 1000) // 5 minutes
                    });
                }, 500);
            });
        }
    }

    verifyPayment(reference) {
        if (this.demoMode) {
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve({
                        success: true,
                        status: 'paid',
                        reference: reference
                    });
                }, 1000);
            });
        }
    }
}

window.qrPayment = new QRPayment();
console.log('✅ QR Payment V6.0 chargé');
