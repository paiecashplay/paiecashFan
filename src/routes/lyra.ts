/**
 * Lyra (PayZen) Payment Integration
 * API REST pour les paiements des boutiques clubs
 * Documentation: https://docs.lyra.com/fr/rest/V4.0/api/
 */

import { Hono } from 'hono'
import type { Bindings } from '../types'

const lyra = new Hono<{ Bindings: Bindings }>()

/**
 * Interface pour les paramètres de paiement Lyra
 */
interface LyraPaymentParams {
  amount: number // Montant en centimes (ex: 2000 = 20.00€)
  currency: string // EUR, USD, etc.
  orderId: string // Identifiant unique de la commande
  customer?: {
    email?: string
    reference?: string
  }
  metadata?: Record<string, string>
}

/**
 * Interface pour la réponse Lyra
 */
interface LyraPaymentResponse {
  status: string
  answer: {
    formToken?: string
    _type?: string
    orderStatus?: string
    orderDetails?: {
      orderId: string
      orderTotalAmount: number
      orderEffectiveAmount: number
      orderCurrency: string
    }
    transactions?: Array<{
      uuid: string
      transactionStatusLabel: string
      amount: number
    }>
  }
}

/**
 * Fonction utilitaire pour créer l'authentification Basic Auth
 */
function createLyraAuthHeader(username: string, password: string): string {
  const credentials = `${username}:${password}`
  return `Basic ${btoa(credentials)}`
}

/**
 * POST /api/lyra/create-payment
 * Créer un paiement Lyra et obtenir un formToken
 */
lyra.post('/create-payment', async (c) => {
  try {
    const { LYRA_API_URL, LYRA_USERNAME, LYRA_PASSWORD } = c.env

    if (!LYRA_API_URL || !LYRA_USERNAME || !LYRA_PASSWORD) {
      return c.json({
        success: false,
        error: 'Lyra non configuré. Veuillez ajouter LYRA_API_URL, LYRA_USERNAME et LYRA_PASSWORD.'
      }, 500)
    }

    const body = await c.req.json<LyraPaymentParams>()
    const { amount, currency = 'EUR', orderId, customer, metadata } = body

    // Validation
    if (!amount || !orderId) {
      return c.json({
        success: false,
        error: 'Paramètres manquants: amount et orderId sont requis'
      }, 400)
    }

    // Préparer la requête Lyra
    const lyraPayload = {
      amount,
      currency,
      orderId,
      customer: customer || {},
      metadata: metadata || {}
    }

    console.log('🔵 Création paiement Lyra:', {
      amount: amount / 100,
      currency,
      orderId
    })

    // Appeler l'API Lyra
    const response = await fetch(`${LYRA_API_URL}/api-payment/V4/Charge/CreatePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': createLyraAuthHeader(LYRA_USERNAME, LYRA_PASSWORD)
      },
      body: JSON.stringify(lyraPayload)
    })

    const data = await response.json<LyraPaymentResponse>()

    if (!response.ok) {
      console.error('❌ Erreur Lyra:', data)
      return c.json({
        success: false,
        error: 'Erreur lors de la création du paiement Lyra',
        details: data
      }, response.status)
    }

    console.log('✅ Paiement Lyra créé:', {
      formToken: data.answer?.formToken?.substring(0, 20) + '...',
      orderId
    })

    return c.json({
      success: true,
      formToken: data.answer?.formToken,
      orderId,
      amount,
      currency
    })

  } catch (error) {
    console.error('❌ Erreur création paiement Lyra:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500)
  }
})

/**
 * POST /api/lyra/verify-payment
 * Vérifier le statut d'un paiement Lyra
 */
lyra.post('/verify-payment', async (c) => {
  try {
    const { LYRA_API_URL, LYRA_USERNAME, LYRA_PASSWORD } = c.env

    if (!LYRA_API_URL || !LYRA_USERNAME || !LYRA_PASSWORD) {
      return c.json({
        success: false,
        error: 'Lyra non configuré'
      }, 500)
    }

    const body = await c.req.json<{ orderId: string }>()
    const { orderId } = body

    if (!orderId) {
      return c.json({
        success: false,
        error: 'orderId requis'
      }, 400)
    }

    console.log('🔍 Vérification paiement Lyra:', orderId)

    // Appeler l'API Lyra pour vérifier
    const response = await fetch(`${LYRA_API_URL}/api-payment/V4/Charge/Get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': createLyraAuthHeader(LYRA_USERNAME, LYRA_PASSWORD)
      },
      body: JSON.stringify({ orderId })
    })

    const data = await response.json<LyraPaymentResponse>()

    if (!response.ok) {
      console.error('❌ Erreur vérification Lyra:', data)
      return c.json({
        success: false,
        error: 'Erreur lors de la vérification du paiement',
        details: data
      }, response.status)
    }

    const isPaid = data.answer?.orderStatus === 'PAID'
    const transaction = data.answer?.transactions?.[0]

    console.log(isPaid ? '✅ Paiement vérifié: PAYÉ' : '⚠️ Paiement non complété')

    return c.json({
      success: true,
      isPaid,
      status: data.answer?.orderStatus,
      transaction: transaction ? {
        uuid: transaction.uuid,
        status: transaction.transactionStatusLabel,
        amount: transaction.amount
      } : null,
      orderDetails: data.answer?.orderDetails
    })

  } catch (error) {
    console.error('❌ Erreur vérification paiement Lyra:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500)
  }
})

/**
 * POST /api/lyra/webhook
 * Webhook pour recevoir les notifications de paiement de Lyra
 */
lyra.post('/webhook', async (c) => {
  try {
    const body = await c.req.json()

    console.log('📬 Webhook Lyra reçu:', {
      orderId: body.orderId,
      status: body.orderStatus
    })

    // TODO: Traiter le webhook (mettre à jour la base de données, etc.)
    // Pour l'instant on log simplement

    return c.json({
      success: true,
      message: 'Webhook traité'
    })

  } catch (error) {
    console.error('❌ Erreur traitement webhook Lyra:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500)
  }
})

/**
 * GET /api/lyra/config
 * Retourner la configuration publique pour le frontend
 */
lyra.get('/config', async (c) => {
  const { LYRA_API_URL, LYRA_USERNAME, LYRA_PUBLIC_KEY } = c.env

  if (!LYRA_API_URL || !LYRA_USERNAME) {
    return c.json({
      success: false,
      error: 'Lyra non configuré'
    }, 500)
  }

  // En environnement de test Lyra, la clé publique = username
  const publicKey = LYRA_PUBLIC_KEY || LYRA_USERNAME

  return c.json({
    success: true,
    apiUrl: LYRA_API_URL,
    publicKey: publicKey,
    // Note: Ne JAMAIS exposer le password
  })
})

export default lyra
