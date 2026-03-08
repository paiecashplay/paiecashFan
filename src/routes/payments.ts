import { Hono } from 'hono'
import Stripe from 'stripe'

const payments = new Hono<{ Bindings: CloudflareBindings }>()

// POST /api/payments/create-checkout-session
payments.post('/create-checkout-session', async (c) => {
  try {
    const { STRIPE_SECRET_KEY } = c.env
    
    if (!STRIPE_SECRET_KEY) {
      return c.json({ 
        success: false, 
        error: 'Stripe non configuré' 
      }, 500)
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia'
    })

    const body = await c.req.json()
    const {
      campaign_id,
      campaign_name,
      prize_name,
      entries_count = 1,
      entry_fee,
      user_id
    } = body

    const amount = Math.round(entry_fee * entries_count * 100) // Convertir en centimes

    // Déterminer l'URL de base (origin ou fallback)
    const origin = c.req.header('origin') || c.req.header('referer')?.split('/').slice(0, 3).join('/') || 'http://localhost:3000'

    // Créer la session Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `${campaign_name} - ${prize_name}`,
              description: `${entries_count} participation(s) au tirage`,
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/payment-success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/app-universal-simple.html?club=Marseille&payment=cancelled`,
      metadata: {
        campaign_id,
        user_id,
        entries_count: entries_count.toString(),
        payment_method: 'card'
      }
    })

    return c.json({
      success: true,
      session_id: session.id,
      checkout_url: session.url
    })

  } catch (error) {
    console.error('Erreur création session Stripe:', error)
    return c.json({
      success: false,
      error: 'Erreur lors de la création de la session de paiement',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// POST /api/payments/webhook - Webhook Stripe pour confirmation paiement
payments.post('/webhook', async (c) => {
  try {
    const { STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, DB } = c.env
    
    if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET) {
      return c.json({ error: 'Stripe non configuré' }, 500)
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia'
    })

    const signature = c.req.header('stripe-signature')
    if (!signature) {
      return c.json({ error: 'Signature manquante' }, 400)
    }

    const body = await c.req.text()
    
    let event: Stripe.Event
    
    try {
      event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
    } catch (err) {
      console.error('Erreur signature webhook:', err)
      return c.json({ error: 'Signature invalide' }, 400)
    }

    // Traiter l'événement
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const metadata = session.metadata

      if (metadata && DB) {
        const { campaign_id, user_id, entries_count, payment_method } = metadata

        // Créer l'utilisateur temporaire
        await DB.prepare(`
          INSERT OR IGNORE INTO users (
            id, email, password_hash, username, display_name, created_at, is_active
          ) VALUES (?, ?, '', ?, ?, datetime('now'), 1)
        `).bind(
          user_id,
          `${user_id}@temp.com`,
          user_id,
          `User ${user_id}`
        ).run()

        // Générer numéros de ticket
        const ticketNumbers = Array.from({ length: parseInt(entries_count) }, () => 
          Math.floor(Math.random() * 1000000)
        )

        // Créer participation
        const participationId = `part-${Date.now()}`
        const entryFeePaid = session.amount_total ? session.amount_total / 100 : 0

        await DB.prepare(`
          INSERT INTO participations (
            id, campaign_id, user_id, entry_fee_paid,
            entries_count, ticket_numbers, payment_status
          ) VALUES (?, ?, ?, ?, ?, ?, 'completed')
        `).bind(
          participationId,
          campaign_id,
          user_id,
          entryFeePaid,
          parseInt(entries_count),
          JSON.stringify(ticketNumbers)
        ).run()

        // Créer paiement
        const paymentId = `pay-${Date.now()}`
        await DB.prepare(`
          INSERT INTO tombola_payments (
            id, user_id, campaign_id, participation_id,
            amount, payment_method, provider_transaction_id, status
          ) VALUES (?, ?, ?, ?, ?, 'credit_card', ?, 'completed')
        `).bind(
          paymentId,
          user_id,
          campaign_id,
          participationId,
          entryFeePaid,
          session.id
        ).run()

        // Incrémenter participants
        await DB.prepare(`
          UPDATE campaigns 
          SET current_participants = current_participants + ?
          WHERE id = ?
        `).bind(parseInt(entries_count), campaign_id).run()

        console.log(`✅ Paiement Stripe confirmé: ${session.id}`)
      }
    }

    return c.json({ received: true })

  } catch (error) {
    console.error('Erreur webhook:', error)
    return c.json({ error: 'Erreur webhook' }, 500)
  }
})

// GET /api/payments/session/:sessionId - Vérifier statut session
payments.get('/session/:sessionId', async (c) => {
  try {
    const { STRIPE_SECRET_KEY } = c.env
    
    if (!STRIPE_SECRET_KEY) {
      return c.json({ success: false, error: 'Stripe non configuré' }, 500)
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia'
    })

    const sessionId = c.req.param('sessionId')
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    return c.json({
      success: true,
      status: session.payment_status,
      metadata: session.metadata
    })

  } catch (error) {
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default payments
