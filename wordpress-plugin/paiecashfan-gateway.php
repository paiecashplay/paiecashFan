<?php
/**
 * Plugin Name: PaieCashFan Payment Gateway
 * Plugin URI: https://paiecashfan.com
 * Description: Passerelle de paiement PaieCashFan pour WooCommerce (Wallet + Crypto + Stablecoins)
 * Version: 1.0.0
 * Author: PaieCashFan Team
 * Author URI: https://paiecashfan.com
 * Text Domain: paiecashfan-gateway
 * Domain Path: /languages
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 5.0
 * WC tested up to: 8.0
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 */

defined('ABSPATH') || exit;

// Vérifier si WooCommerce est actif
if (!in_array('woocommerce/woocommerce.php', apply_filters('active_plugins', get_option('active_plugins')))) {
    return;
}

/**
 * Ajouter la passerelle PaieCashFan aux méthodes de paiement WooCommerce
 */
add_filter('woocommerce_payment_gateways', 'paiecashfan_add_gateway_class');
function paiecashfan_add_gateway_class($gateways) {
    $gateways[] = 'WC_PaieCashFan_Gateway';
    return $gateways;
}

/**
 * Charger la classe de la passerelle
 */
add_action('plugins_loaded', 'paiecashfan_init_gateway_class');
function paiecashfan_init_gateway_class() {

    class WC_PaieCashFan_Gateway extends WC_Payment_Gateway {

        /**
         * Constructeur
         */
        public function __construct() {
            $this->id = 'paiecashfan';
            $this->icon = plugins_url('assets/images/paiecashfan-icon.png', __FILE__);
            $this->has_fields = true;
            $this->method_title = __('PaieCashFan', 'paiecashfan-gateway');
            $this->method_description = __('Accepter les paiements via Wallet PaieCashFan, Crypto (USDT, USDC, BTC, ETH) et Stablecoins club', 'paiecashfan-gateway');

            // Supporter le remboursement
            $this->supports = array(
                'products',
                'refunds'
            );

            // Charger les paramètres
            $this->init_form_fields();
            $this->init_settings();

            // Définir les propriétés
            $this->title = $this->get_option('title');
            $this->description = $this->get_option('description');
            $this->enabled = $this->get_option('enabled');
            $this->testmode = 'yes' === $this->get_option('testmode');
            $this->api_endpoint = $this->testmode ? 'https://api-sandbox.paiecashfan.com' : 'https://api.paiecashfan.com';
            $this->api_key = $this->testmode ? $this->get_option('test_api_key') : $this->get_option('api_key');

            // Hooks
            add_action('woocommerce_update_options_payment_gateways_' . $this->id, array($this, 'process_admin_options'));
            add_action('wp_enqueue_scripts', array($this, 'payment_scripts'));
            add_action('woocommerce_api_paiecashfan_webhook', array($this, 'webhook'));
        }

        /**
         * Champs de configuration admin
         */
        public function init_form_fields() {
            $this->form_fields = array(
                'enabled' => array(
                    'title' => __('Activer/Désactiver', 'paiecashfan-gateway'),
                    'label' => __('Activer PaieCashFan Gateway', 'paiecashfan-gateway'),
                    'type' => 'checkbox',
                    'description' => '',
                    'default' => 'no'
                ),
                'title' => array(
                    'title' => __('Titre', 'paiecashfan-gateway'),
                    'type' => 'text',
                    'description' => __('Titre affiché lors du paiement', 'paiecashfan-gateway'),
                    'default' => __('PaieCashFan (Wallet + Crypto)', 'paiecashfan-gateway'),
                    'desc_tip' => true,
                ),
                'description' => array(
                    'title' => __('Description', 'paiecashfan-gateway'),
                    'type' => 'textarea',
                    'description' => __('Description affichée lors du paiement', 'paiecashfan-gateway'),
                    'default' => __('Payez avec votre Wallet PaieCashFan, USDT, USDC, BTC, ETH ou stablecoins club.', 'paiecashfan-gateway'),
                ),
                'testmode' => array(
                    'title' => __('Mode Test', 'paiecashfan-gateway'),
                    'label' => __('Activer le mode test', 'paiecashfan-gateway'),
                    'type' => 'checkbox',
                    'description' => __('Utiliser l\'API sandbox pour les tests', 'paiecashfan-gateway'),
                    'default' => 'yes',
                    'desc_tip' => true,
                ),
                'api_key' => array(
                    'title' => __('Clé API Production', 'paiecashfan-gateway'),
                    'type' => 'password',
                    'description' => __('Obtenir sur https://dashboard.paiecashfan.com/settings/api', 'paiecashfan-gateway'),
                ),
                'test_api_key' => array(
                    'title' => __('Clé API Test', 'paiecashfan-gateway'),
                    'type' => 'password',
                    'description' => __('Clé API pour le mode test', 'paiecashfan-gateway'),
                )
            );
        }

        /**
         * Charger les scripts JS/CSS
         */
        public function payment_scripts() {
            if (!is_cart() && !is_checkout() && !isset($_GET['pay_for_order'])) {
                return;
            }

            if ('no' === $this->enabled) {
                return;
            }

            if (empty($this->api_key)) {
                return;
            }

            wp_enqueue_style('paiecashfan-gateway-styles', plugins_url('assets/css/paiecashfan-gateway.css', __FILE__), array(), '1.0.0');
            wp_enqueue_script('paiecashfan-gateway-js', plugins_url('assets/js/paiecashfan-gateway.js', __FILE__), array('jquery'), '1.0.0', true);

            wp_localize_script('paiecashfan-gateway-js', 'paiecashfan_params', array(
                'api_endpoint' => $this->api_endpoint,
                'api_key' => $this->api_key,
                'testmode' => $this->testmode
            ));
        }

        /**
         * Champs de paiement (sélection méthode)
         */
        public function payment_fields() {
            if ($this->description) {
                echo wpautop(wp_kses_post($this->description));
            }

            echo '<fieldset id="paiecashfan-payment-form" class="paiecashfan-payment-form">';
            echo '<div class="paiecashfan-payment-methods">';
            
            // Méthode 1: Wallet PaieCashFan
            echo '<label class="paiecashfan-payment-method">';
            echo '<input type="radio" name="paiecashfan_payment_method" value="wallet" checked>';
            echo '<span class="method-icon">💰</span>';
            echo '<span class="method-name">' . __('Wallet PaieCashFan', 'paiecashfan-gateway') . '</span>';
            echo '<span class="method-desc">' . __('Solde: <strong id="wallet-balance">--</strong>', 'paiecashfan-gateway') . '</span>';
            echo '</label>';

            // Méthode 2: Crypto (USDT, USDC, BTC, ETH)
            echo '<label class="paiecashfan-payment-method">';
            echo '<input type="radio" name="paiecashfan_payment_method" value="crypto">';
            echo '<span class="method-icon">🌐</span>';
            echo '<span class="method-name">' . __('Crypto', 'paiecashfan-gateway') . '</span>';
            echo '<span class="method-desc">' . __('USDT, USDC, BTC, ETH (300+ cryptos)', 'paiecashfan-gateway') . '</span>';
            echo '</label>';

            // Méthode 3: Stablecoin club
            echo '<label class="paiecashfan-payment-method">';
            echo '<input type="radio" name="paiecashfan_payment_method" value="stablecoin">';
            echo '<span class="method-icon">💎</span>';
            echo '<span class="method-name">' . __('Stablecoin Club', 'paiecashfan-gateway') . '</span>';
            echo '<span class="method-desc">' . __('OMC, PSC, OLC... (+3% cashback)', 'paiecashfan-gateway') . '</span>';
            echo '</label>';

            echo '</div>';
            echo '<div id="paiecashfan-payment-info" class="paiecashfan-payment-info"></div>';
            echo '</fieldset>';
        }

        /**
         * Traiter le paiement
         */
        public function process_payment($order_id) {
            global $woocommerce;
            $order = wc_get_order($order_id);

            // Récupérer la méthode de paiement choisie
            $payment_method = isset($_POST['paiecashfan_payment_method']) ? sanitize_text_field($_POST['paiecashfan_payment_method']) : 'wallet';

            // Appel API PaieCashFan pour créer le paiement
            $payment_data = array(
                'amount' => $order->get_total(),
                'currency' => $order->get_currency(),
                'order_id' => $order->get_id(),
                'order_key' => $order->get_order_key(),
                'payment_method' => $payment_method,
                'customer_email' => $order->get_billing_email(),
                'customer_id' => $order->get_customer_id(),
                'return_url' => $this->get_return_url($order),
                'cancel_url' => wc_get_checkout_url(),
                'webhook_url' => home_url('/wc-api/paiecashfan_webhook/')
            );

            $response = $this->api_request('/payments/create', $payment_data);

            if (is_wp_error($response)) {
                wc_add_notice(__('Erreur de connexion à PaieCashFan. Veuillez réessayer.', 'paiecashfan-gateway'), 'error');
                return;
            }

            if (isset($response['success']) && $response['success']) {
                // Marquer la commande en attente de paiement
                $order->update_status('on-hold', __('En attente du paiement PaieCashFan', 'paiecashfan-gateway'));

                // Stocker l'ID de paiement PaieCashFan
                $order->update_meta_data('_paiecashfan_payment_id', $response['payment_id']);
                $order->save();

                // Vider le panier
                $woocommerce->cart->empty_cart();

                // Si paiement instantané (Wallet), rediriger directement
                if ($payment_method === 'wallet' && isset($response['status']) && $response['status'] === 'completed') {
                    $order->payment_complete($response['payment_id']);
                    $order->add_order_note(__('Paiement PaieCashFan Wallet reçu', 'paiecashfan-gateway'));
                    
                    return array(
                        'result' => 'success',
                        'redirect' => $this->get_return_url($order)
                    );
                }

                // Sinon, rediriger vers la page de paiement PaieCashFan
                return array(
                    'result' => 'success',
                    'redirect' => $response['payment_url']
                );
            } else {
                $error_message = isset($response['message']) ? $response['message'] : __('Erreur inconnue', 'paiecashfan-gateway');
                wc_add_notice(__('Erreur de paiement: ', 'paiecashfan-gateway') . $error_message, 'error');
                return;
            }
        }

        /**
         * Webhook pour recevoir les confirmations de paiement
         */
        public function webhook() {
            $raw_data = file_get_contents('php://input');
            $data = json_decode($raw_data, true);

            // Vérifier la signature du webhook
            $signature = isset($_SERVER['HTTP_X_PAIECASHFAN_SIGNATURE']) ? $_SERVER['HTTP_X_PAIECASHFAN_SIGNATURE'] : '';
            
            if (!$this->verify_webhook_signature($raw_data, $signature)) {
                status_header(401);
                die('Signature invalide');
            }

            // Traiter le webhook
            if (isset($data['event_type']) && $data['event_type'] === 'payment.completed') {
                $order_id = isset($data['order_id']) ? intval($data['order_id']) : 0;
                $payment_id = isset($data['payment_id']) ? sanitize_text_field($data['payment_id']) : '';

                if ($order_id > 0) {
                    $order = wc_get_order($order_id);

                    if ($order && $order->needs_payment()) {
                        $order->payment_complete($payment_id);
                        $order->add_order_note(
                            sprintf(__('Paiement PaieCashFan reçu (ID: %s)', 'paiecashfan-gateway'), $payment_id)
                        );
                    }
                }
            }

            status_header(200);
            die('OK');
        }

        /**
         * Vérifier la signature du webhook
         */
        private function verify_webhook_signature($payload, $signature) {
            $expected_signature = hash_hmac('sha256', $payload, $this->api_key);
            return hash_equals($expected_signature, $signature);
        }

        /**
         * Appel API PaieCashFan
         */
        private function api_request($endpoint, $data = array()) {
            $url = $this->api_endpoint . $endpoint;

            $args = array(
                'method' => 'POST',
                'headers' => array(
                    'Authorization' => 'Bearer ' . $this->api_key,
                    'Content-Type' => 'application/json'
                ),
                'body' => json_encode($data),
                'timeout' => 30
            );

            $response = wp_remote_post($url, $args);

            if (is_wp_error($response)) {
                return $response;
            }

            $body = wp_remote_retrieve_body($response);
            return json_decode($body, true);
        }

        /**
         * Traiter les remboursements
         */
        public function process_refund($order_id, $amount = null, $reason = '') {
            $order = wc_get_order($order_id);
            $payment_id = $order->get_meta('_paiecashfan_payment_id');

            if (!$payment_id) {
                return new WP_Error('error', __('ID de paiement PaieCashFan introuvable', 'paiecashfan-gateway'));
            }

            $refund_data = array(
                'payment_id' => $payment_id,
                'amount' => $amount,
                'reason' => $reason
            );

            $response = $this->api_request('/payments/refund', $refund_data);

            if (is_wp_error($response)) {
                return $response;
            }

            if (isset($response['success']) && $response['success']) {
                $order->add_order_note(
                    sprintf(__('Remboursement PaieCashFan traité: %s', 'paiecashfan-gateway'), wc_price($amount))
                );
                return true;
            } else {
                return new WP_Error('error', $response['message']);
            }
        }
    }
}
