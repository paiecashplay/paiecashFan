/**
 * Club Shop API Routes
 * Gestion des boutiques clubs avec paiement Lyra
 */

import { Hono } from 'hono'
import type { Bindings } from '../types'

const shop = new Hono<{ Bindings: Bindings }>()

/**
 * GET /api/shop/products/:clubId
 * Récupérer les produits d'un club
 */
shop.get('/products/:clubId', async (c) => {
  try {
    const { DB } = c.env
    const clubId = c.req.param('clubId')
    const category = c.req.query('category')

    let query = 'SELECT * FROM club_products WHERE club_id = ? AND is_active = 1'
    const bindings: any[] = [clubId]

    if (category) {
      query += ' AND category = ?'
      bindings.push(category)
    }

    query += ' ORDER BY category, name'

    const result = await DB.prepare(query).bind(...bindings).all()

    return c.json({
      success: true,
      clubId,
      products: result.results || [],
      total: result.results?.length || 0
    })

  } catch (error) {
    console.error('❌ Erreur récupération produits:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500)
  }
})

/**
 * GET /api/shop/product/:productId
 * Récupérer un produit spécifique
 */
shop.get('/product/:productId', async (c) => {
  try {
    const { DB } = c.env
    const productId = c.req.param('productId')

    const product = await DB.prepare(
      'SELECT * FROM club_products WHERE id = ? AND is_active = 1'
    ).bind(productId).first()

    if (!product) {
      return c.json({
        success: false,
        error: 'Produit non trouvé'
      }, 404)
    }

    return c.json({
      success: true,
      product
    })

  } catch (error) {
    console.error('❌ Erreur récupération produit:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500)
  }
})

/**
 * POST /api/shop/order/create
 * Créer une commande
 */
shop.post('/order/create', async (c) => {
  try {
    const { DB } = c.env
    const body = await c.req.json<{
      user_id: string
      club_id: string
      products: Array<{
        product_id: string
        name: string
        price: number
        quantity: number
      }>
      customer_email: string
      customer_name?: string
      shipping_address?: any
    }>()

    const { user_id, club_id, products, customer_email, customer_name, shipping_address } = body

    // Validation
    if (!user_id || !club_id || !products || products.length === 0) {
      return c.json({
        success: false,
        error: 'Paramètres manquants'
      }, 400)
    }

    // Calculer total
    const total_amount = products.reduce((sum, p) => sum + (p.price * p.quantity), 0)

    // Générer ID commande
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const invoiceNumber = `INV-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Créer commande
    await DB.prepare(`
      INSERT INTO club_orders (
        id, user_id, club_id, products, total_amount,
        payment_method, payment_id, status,
        customer_email, customer_name, shipping_address,
        invoice_number, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      orderId,
      user_id,
      club_id,
      JSON.stringify(products),
      total_amount,
      'lyra',
      orderId, // payment_id = orderId pour Lyra
      'pending',
      customer_email,
      customer_name || null,
      shipping_address ? JSON.stringify(shipping_address) : null,
      invoiceNumber
    ).run()

    console.log('✅ Commande créée:', {
      orderId,
      total_amount,
      products: products.length
    })

    return c.json({
      success: true,
      order: {
        id: orderId,
        total_amount,
        products,
        invoice_number: invoiceNumber,
        status: 'pending'
      }
    })

  } catch (error) {
    console.error('❌ Erreur création commande:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500)
  }
})

/**
 * POST /api/shop/order/confirm
 * Confirmer paiement d'une commande
 */
shop.post('/order/confirm', async (c) => {
  try {
    const { DB } = c.env
    const body = await c.req.json<{
      order_id: string
      lyra_transaction_uuid?: string
    }>()

    const { order_id, lyra_transaction_uuid } = body

    if (!order_id) {
      return c.json({
        success: false,
        error: 'order_id requis'
      }, 400)
    }

    // Mettre à jour statut
    await DB.prepare(`
      UPDATE club_orders 
      SET status = 'paid',
          lyra_transaction_uuid = ?,
          paid_at = datetime('now')
      WHERE id = ?
    `).bind(lyra_transaction_uuid || null, order_id).run()

    // Récupérer commande mise à jour
    const order = await DB.prepare(
      'SELECT * FROM club_orders WHERE id = ?'
    ).bind(order_id).first()

    console.log('✅ Commande confirmée:', {
      order_id,
      status: 'paid'
    })

    return c.json({
      success: true,
      order
    })

  } catch (error) {
    console.error('❌ Erreur confirmation commande:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500)
  }
})

/**
 * GET /api/shop/orders/:userId
 * Récupérer commandes d'un utilisateur
 */
shop.get('/orders/:userId', async (c) => {
  try {
    const { DB } = c.env
    const userId = c.req.param('userId')

    const result = await DB.prepare(`
      SELECT * FROM club_orders 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).bind(userId).all()

    return c.json({
      success: true,
      orders: result.results || []
    })

  } catch (error) {
    console.error('❌ Erreur récupération commandes:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500)
  }
})

/**
 * GET /api/shop/order/:orderId
 * Récupérer détails d'une commande
 */
shop.get('/order/:orderId', async (c) => {
  try {
    const { DB } = c.env
    const orderId = c.req.param('orderId')

    const order = await DB.prepare(
      'SELECT * FROM club_orders WHERE id = ?'
    ).bind(orderId).first()

    if (!order) {
      return c.json({
        success: false,
        error: 'Commande non trouvée'
      }, 404)
    }

    // Parser JSON fields
    const orderData = {
      ...order,
      products: JSON.parse(order.products as string),
      shipping_address: order.shipping_address ? JSON.parse(order.shipping_address as string) : null
    }

    return c.json({
      success: true,
      order: orderData
    })

  } catch (error) {
    console.error('❌ Erreur récupération commande:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, 500)
  }
})

export default shop
