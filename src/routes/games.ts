import { Hono } from 'hono'
import Stripe from 'stripe'

const games = new Hono<{ Bindings: CloudflareBindings }>()

// POST /api/games/scratch/play - Jouer au jeu SCRATCH
games.post('/scratch/play', async (c) => {
  try {
    const { DB, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY } = c.env
    
    if (!DB) {
      return c.json({ 
        success: false, 
        error: 'Base de données non disponible' 
      }, 500)
    }

    const body = await c.req.json()
    const {
      user_id,
      organization_id,
      payment_method = 'card', // 'card', 'wallet', 'mobile'
      amount = 1.0 // Prix fixe 1€
    } = body

    // Vérifier que le user existe
    const user = await DB.prepare(`
      SELECT id, display_name, email FROM users WHERE id = ?
    `).bind(user_id).first()

    if (!user) {
      // Créer utilisateur temporaire
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
    }

    // Si paiement par carte, créer une session Stripe
    if (payment_method === 'card') {
      if (!STRIPE_SECRET_KEY) {
        return c.json({ 
          success: false, 
          error: 'Stripe non configuré' 
        }, 500)
      }

      const stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2024-12-18.acacia'
      })

      const origin = c.req.header('origin') || c.req.header('referer')?.split('/').slice(0, 3).join('/') || 'http://localhost:3000'

      // Créer session Checkout Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'SCRATCH - Ticket à gratter',
                description: '1 ticket à gratter avec chance de gagner des lots exclusifs !',
              },
              unit_amount: 100, // 1.00 € = 100 centimes
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/scratch-result.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/app-universal-simple.html?club=Marseille&payment=cancelled`,
        metadata: {
          game_type: 'scratch',
          user_id,
          organization_id,
          amount: amount.toString(),
          payment_method: 'card'
        }
      })

      return c.json({
        success: true,
        payment_required: true,
        session_id: session.id,
        checkout_url: session.url
      })
    }

    // Paiement wallet ou mobile (direct play)
    if (payment_method === 'wallet' || payment_method === 'mobile') {
      // Logique de tirage au sort
      const isWinner = Math.random() < 0.10 // 10% de chance de gagner

      let prizeData = null
      if (isWinner) {
        // Récupérer un lot aléatoire pondéré
        const prizes = await DB.prepare(`
          SELECT * FROM scratch_prizes WHERE organization_id = ?
        `).bind(organization_id).all()

        if (!prizes.results || prizes.results.length === 0) {
          return c.json({ 
            success: false, 
            error: 'Aucun lot disponible pour cette organisation' 
          }, 500)
        }

        // Tirage pondéré par probabilité
        const totalProb = prizes.results.reduce((sum: number, p: any) => sum + p.probability, 0)
        let random = Math.random() * totalProb
        
        for (const prize of prizes.results) {
          random -= prize.probability
          if (random <= 0) {
            prizeData = prize
            break
          }
        }
      }

      // Enregistrer la partie
      const gameId = `scratch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      
      await DB.prepare(`
        INSERT INTO scratch_games (
          id, user_id, organization_id, amount_paid, 
          is_winner, prize_id, prize_name, prize_value, 
          scratched_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        gameId,
        user_id,
        organization_id,
        amount,
        isWinner ? 1 : 0,
        prizeData ? prizeData.id : null,
        prizeData ? prizeData.name : null,
        prizeData ? prizeData.value : null
      ).run()

      return c.json({
        success: true,
        payment_required: false,
        game_id: gameId,
        is_winner: isWinner,
        prize: prizeData ? {
          id: prizeData.id,
          name: prizeData.name,
          description: prizeData.description,
          value: prizeData.value,
          category: prizeData.category
        } : null
      })
    }

    return c.json({ 
      success: false, 
      error: 'Méthode de paiement non supportée' 
    }, 400)

  } catch (error) {
    console.error('Erreur jeu SCRATCH:', error)
    return c.json({
      success: false,
      error: 'Erreur lors du jeu SCRATCH',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// GET /api/games/scratch/result/:sessionId - Récupérer résultat après paiement Stripe
games.get('/scratch/result/:sessionId', async (c) => {
  try {
    const { DB, STRIPE_SECRET_KEY } = c.env
    
    if (!STRIPE_SECRET_KEY) {
      return c.json({ success: false, error: 'Stripe non configuré' }, 500)
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia'
    })

    const sessionId = c.req.param('sessionId')
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (session.payment_status !== 'paid') {
      return c.json({
        success: false,
        error: 'Paiement non complété'
      }, 400)
    }

    // Vérifier si le jeu a déjà été joué
    const metadata = session.metadata
    if (!metadata) {
      return c.json({ success: false, error: 'Métadonnées manquantes' }, 400)
    }

    const { user_id, organization_id } = metadata

    // Vérifier si un résultat existe déjà
    const existingGame = await DB.prepare(`
      SELECT * FROM scratch_games 
      WHERE user_id = ? 
      AND organization_id = ?
      AND created_at >= datetime('now', '-5 minutes')
      ORDER BY created_at DESC
      LIMIT 1
    `).bind(user_id, organization_id).first()

    if (existingGame) {
      // Résultat déjà généré
      const prize = existingGame.is_winner ? {
        id: existingGame.prize_id,
        name: existingGame.prize_name,
        value: existingGame.prize_value
      } : null

      return c.json({
        success: true,
        game_id: existingGame.id,
        is_winner: Boolean(existingGame.is_winner),
        prize,
        already_played: true
      })
    }

    // Générer le résultat maintenant
    const isWinner = Math.random() < 0.10 // 10% de chance

    let prizeData = null
    if (isWinner) {
      const prizes = await DB.prepare(`
        SELECT * FROM scratch_prizes WHERE organization_id = ?
      `).bind(organization_id).all()

      if (prizes.results && prizes.results.length > 0) {
        const totalProb = prizes.results.reduce((sum: number, p: any) => sum + p.probability, 0)
        let random = Math.random() * totalProb
        
        for (const prize of prizes.results) {
          random -= prize.probability
          if (random <= 0) {
            prizeData = prize
            break
          }
        }
      }
    }

    // Enregistrer le résultat
    const gameId = `scratch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    await DB.prepare(`
      INSERT INTO scratch_games (
        id, user_id, organization_id, amount_paid, 
        is_winner, prize_id, prize_name, prize_value, 
        scratched_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      gameId,
      user_id,
      organization_id,
      1.0,
      isWinner ? 1 : 0,
      prizeData ? prizeData.id : null,
      prizeData ? prizeData.name : null,
      prizeData ? prizeData.value : null
    ).run()

    return c.json({
      success: true,
      game_id: gameId,
      is_winner: isWinner,
      prize: prizeData ? {
        id: prizeData.id,
        name: prizeData.name,
        description: prizeData.description,
        value: prizeData.value,
        category: prizeData.category
      } : null,
      already_played: false
    })

  } catch (error) {
    console.error('Erreur récupération résultat SCRATCH:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// GET /api/games/scratch/prizes/:organizationId - Récupérer la liste des lots
games.get('/scratch/prizes/:organizationId', async (c) => {
  try {
    const { DB } = c.env
    
    if (!DB) {
      return c.json({ 
        success: false, 
        error: 'Base de données non disponible' 
      }, 500)
    }

    const organizationId = c.req.param('organizationId')

    const prizes = await DB.prepare(`
      SELECT id, name, description, value, category, probability
      FROM scratch_prizes 
      WHERE organization_id = ?
      ORDER BY value DESC
    `).bind(organizationId).all()

    return c.json({
      success: true,
      prizes: prizes.results || []
    })

  } catch (error) {
    console.error('Erreur récupération lots SCRATCH:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default games
