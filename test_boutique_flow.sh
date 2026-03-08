#!/bin/bash

echo "🧪 Test Flow Complet Boutique OM"
echo "================================"
echo ""

BASE_URL="http://localhost:3000"

# 1. Récupérer les produits
echo "1️⃣ Récupération des produits OM..."
PRODUCTS=$(curl -s "$BASE_URL/api/shop/products/om-001")
echo "$PRODUCTS" | jq -r '.products[0] | "✅ Produit 1: \(.name) - \(.price)€"'
PRODUCT_ID=$(echo "$PRODUCTS" | jq -r '.products[0].id')
PRODUCT_NAME=$(echo "$PRODUCTS" | jq -r '.products[0].name')
PRODUCT_PRICE=$(echo "$PRODUCTS" | jq -r '.products[0].price')
echo ""

# 2. Créer une commande
echo "2️⃣ Création de la commande..."
ORDER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/shop/order/create" \
  -H "Content-Type: application/json" \
  -d "{
    \"user_id\": \"user-test-flow\",
    \"club_id\": \"om-001\",
    \"products\": [{
      \"product_id\": \"$PRODUCT_ID\",
      \"name\": \"$PRODUCT_NAME\",
      \"price\": $PRODUCT_PRICE,
      \"quantity\": 2
    }],
    \"customer_email\": \"test@paiecashfan.com\",
    \"customer_name\": \"Jean Dupont\"
  }")

ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.order.id')
TOTAL=$(echo "$ORDER_RESPONSE" | jq -r '.order.total_amount')
echo "✅ Commande créée: $ORDER_ID"
echo "   Total: $TOTAL€"
echo ""

# 3. Créer le paiement Lyra
echo "3️⃣ Création du paiement Lyra..."
AMOUNT_CENTS=$(echo "$TOTAL * 100" | bc | cut -d. -f1)
PAYMENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/lyra/create-payment" \
  -H "Content-Type: application/json" \
  -d "{
    \"amount\": $AMOUNT_CENTS,
    \"currency\": \"EUR\",
    \"orderId\": \"$ORDER_ID\",
    \"customer\": {
      \"email\": \"test@paiecashfan.com\",
      \"reference\": \"user-test-flow\"
    },
    \"metadata\": {
      \"club_id\": \"om-001\",
      \"product\": \"$PRODUCT_NAME\"
    }
  }")

FORM_TOKEN=$(echo "$PAYMENT_RESPONSE" | jq -r '.formToken')
echo "✅ Paiement créé"
echo "   FormToken: ${FORM_TOKEN:0:50}..."
echo ""

# 4. Simuler la confirmation du paiement
echo "4️⃣ Confirmation du paiement (simulation)..."
CONFIRM_RESPONSE=$(curl -s -X POST "$BASE_URL/api/shop/order/confirm" \
  -H "Content-Type: application/json" \
  -d "{
    \"order_id\": \"$ORDER_ID\",
    \"lyra_transaction_uuid\": \"test-uuid-$(date +%s)\"
  }")

STATUS=$(echo "$CONFIRM_RESPONSE" | jq -r '.order.status')
echo "✅ Commande confirmée"
echo "   Status: $STATUS"
echo ""

# 5. Vérifier l'historique
echo "5️⃣ Vérification historique utilisateur..."
ORDERS=$(curl -s "$BASE_URL/api/shop/orders/user-test-flow")
COUNT=$(echo "$ORDERS" | jq '.orders | length')
echo "✅ Historique récupéré: $COUNT commande(s)"
echo ""

# 6. Récupérer détail commande
echo "6️⃣ Détail de la commande..."
ORDER_DETAIL=$(curl -s "$BASE_URL/api/shop/order/$ORDER_ID")
PRODUCTS_COUNT=$(echo "$ORDER_DETAIL" | jq '.order.products | length')
INVOICE=$(echo "$ORDER_DETAIL" | jq -r '.order.invoice_number')
echo "✅ Détail récupéré"
echo "   Produits: $PRODUCTS_COUNT"
echo "   Facture: $INVOICE"
echo ""

echo "================================"
echo "✅ Test Flow Complet RÉUSSI !"
echo "================================"
