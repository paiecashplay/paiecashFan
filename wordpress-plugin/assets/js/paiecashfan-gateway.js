/**
 * PaieCashFan Gateway - JavaScript
 * Version: 1.0.0
 */

(function($) {
    'use strict';

    // Variables globales
    const API_ENDPOINT = paiecashfan_params.api_endpoint;
    const API_KEY = paiecashfan_params.api_key;
    const TESTMODE = paiecashfan_params.testmode;

    /**
     * Initialisation
     */
    $(document).ready(function() {
        initPaymentMethods();
        loadWalletBalance();
    });

    /**
     * Initialiser les méthodes de paiement
     */
    function initPaymentMethods() {
        $('.paiecashfan-payment-method').on('click', function() {
            // Désélectionner toutes les méthodes
            $('.paiecashfan-payment-method').removeClass('selected');
            
            // Sélectionner la méthode cliquée
            $(this).addClass('selected');
            $(this).find('input[type="radio"]').prop('checked', true);

            // Afficher les informations spécifiques à la méthode
            const method = $(this).find('input[type="radio"]').val();
            showPaymentInfo(method);
        });

        // Sélectionner la première méthode par défaut
        $('.paiecashfan-payment-method:first').addClass('selected');
        showPaymentInfo('wallet');
    }

    /**
     * Charger le solde du wallet
     */
    function loadWalletBalance() {
        // Vérifier si l'utilisateur est connecté
        if (!API_KEY) {
            $('#wallet-balance').text('Connectez-vous');
            return;
        }

        // Appel API pour récupérer le solde
        $.ajax({
            url: API_ENDPOINT + '/wallet/balance',
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + API_KEY
            },
            success: function(response) {
                if (response.success && response.balance) {
                    $('#wallet-balance').text(formatCurrency(response.balance, response.currency));
                } else {
                    $('#wallet-balance').text('0.00 €');
                }
            },
            error: function() {
                $('#wallet-balance').text('--');
            }
        });
    }

    /**
     * Afficher les informations de paiement
     */
    function showPaymentInfo(method) {
        const $infoDiv = $('#paiecashfan-payment-info');
        
        let infoHTML = '';

        switch(method) {
            case 'wallet':
                infoHTML = `
                    <h4>💰 Paiement Wallet PaieCashFan</h4>
                    <p>Votre solde sera débité instantanément.</p>
                    <p><strong>Cashback:</strong> +2% sur ce paiement</p>
                `;
                break;

            case 'crypto':
                infoHTML = `
                    <h4>🌐 Paiement Crypto</h4>
                    <p>Choisissez parmi <strong>300+ cryptomonnaies</strong> :</p>
                    <p>USDT, USDC, BTC, ETH, BNB, DOGE, SOL, ADA, etc.</p>
                    <p>Le taux de change sera calculé à l'étape suivante.</p>
                `;
                break;

            case 'stablecoin':
                infoHTML = `
                    <h4>💎 Stablecoin Club</h4>
                    <p>Payez avec le stablecoin de votre club favori :</p>
                    <p>OMC (OM), PSC (PSG), OLC (Lyon), AFC (Arsenal), LFC (Liverpool)...</p>
                    <p><strong>Cashback exclusif:</strong> +3% sur ce paiement !</p>
                `;
                break;
        }

        $infoDiv.html(infoHTML).removeClass('hidden');
    }

    /**
     * Formater une devise
     */
    function formatCurrency(amount, currency = 'EUR') {
        const formatter = new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: currency
        });
        return formatter.format(amount);
    }

    /**
     * Validation avant soumission
     */
    $('form.checkout').on('checkout_place_order_paiecashfan', function() {
        const selectedMethod = $('input[name="paiecashfan_payment_method"]:checked').val();
        
        if (!selectedMethod) {
            alert('Veuillez sélectionner une méthode de paiement PaieCashFan');
            return false;
        }

        // Afficher un loader
        $('form.checkout').block({
            message: '<div class="paiecashfan-loading"></div>',
            overlayCSS: {
                background: '#fff',
                opacity: 0.6
            }
        });

        return true;
    });

})(jQuery);
