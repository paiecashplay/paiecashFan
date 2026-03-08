import { Hono } from 'hono'
import Stripe from 'stripe'

const games = new Hono<{ Bindings: CloudflareBindings }>()

// ═══════════════════════════════════════════════════════════
// UTILITAIRES ÉCOSYSTÈME
// ═══════════════════════════════════════════════════════════

interface Commission {
  clubCommission: number
  socialActionFee: number
  paiecashRevenue: number
}

/**
 * Calculer la répartition financière
 * NOUVEAU MODÈLE:
 * - Club: 10% (commission classique)
 * - Actions sociales: 1% (bonus partage, parrainage)
 * - PaieCash: 89% (publicité, hébergement, salariés)
 * - Sponsor: 0€ (paie pour visibilité seulement)
 */
function calculateCommissions(amount: number): Commission {
  const clubCommission = amount * 0.10    // 10% pour le club
  const socialActionFee = amount * 0.01   // 1% pour actions sociales
  const paiecashRevenue = amount * 0.89   // 89% pour PaieCash
  
  return {
    clubCommission,
    socialActionFee,
    paiecashRevenue
  }
}

/**
 * Enregistrer une transaction de jeu avec commission club
 */
async function recordGameTransaction(
  DB: any,
  data: {
    user_id: string
    organization_id: string
    game_type: string
    game_id: string
    amount_paid: number
    sponsor_id?: string
    pack_type?: string
    discount_applied?: number
    referral_code?: string
    referral_bonus?: number
    payment_method: string
    payment_id?: string
  }
): Promise<string> {
  const commissions = calculateCommissions(data.amount_paid)
  const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  
  await DB.prepare(`
    INSERT INTO game_transactions (
      id, user_id, organization_id, game_type, game_id,
      amount_paid, club_commission, social_action_fee, paiecash_revenue,
      platform_fee, prize_pool, sponsor_amount,
      sponsor_id, pack_type, discount_applied,
      referral_code, referral_bonus, payment_method, payment_id, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')
  `).bind(
    transactionId,
    data.user_id,
    data.organization_id,
    data.game_type,
    data.game_id,
    data.amount_paid,
    commissions.clubCommission,
    commissions.socialActionFee,
    commissions.paiecashRevenue,
    0.0, // platform_fee (legacy)
    0.0, // prize_pool (legacy)
    0.0, // sponsor_amount (legacy)
    data.sponsor_id || null,
    data.pack_type || 'solo',
    data.discount_applied || 0.0,
    data.referral_code || null,
    data.referral_bonus || 0.0,
    data.payment_method,
    data.payment_id || null
  ).run()
  
  return transactionId
}

/**
 * Enregistrer une interaction sponsor
 */
async function recordSponsorInteraction(
  DB: any,
  data: {
    sponsor_id: string
    organization_id: string
    user_id: string
    game_type: string
    interaction_type: 'view' | 'play' | 'share' | 'win'
    prize_viewed?: string
    prize_won?: string
    engagement_score?: number
  }
) {
  const interactionId = `int-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  
  await DB.prepare(`
    INSERT INTO sponsor_interactions (
      id, sponsor_id, organization_id, user_id, game_type,
      interaction_type, prize_viewed, prize_won, engagement_score
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    interactionId,
    data.sponsor_id,
    data.organization_id,
    data.user_id,
    data.game_type,
    data.interaction_type,
    data.prize_viewed || null,
    data.prize_won || null,
    data.engagement_score || 0.0
  ).run()
}

// ═══════════════════════════════════════════════════════════
// POST /api/games/scratch/play - Jouer au SCRATCH
// ═══════════════════════════════════════════════════════════
games.post('/scratch/play', async (c) => {
  try {
    const { DB, STRIPE_SECRET_KEY } = c.env
    
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
      payment_method = 'card',
      amount = 1.0,
      referral_code = null
    } = body

    // Vérifier/créer utilisateur
    const user = await DB.prepare(`
      SELECT id, display_name, email FROM users WHERE id = ?
    `).bind(user_id).first()

    if (!user) {
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

    // Récupérer le sponsor de l'organisation
    const sponsor = await DB.prepare(`
      SELECT id FROM sponsors 
      WHERE organization_id = ? AND is_active = 1 
      LIMIT 1
    `).bind(organization_id).first()

    // Enregistrer interaction sponsor (VIEW)
    if (sponsor) {
      await recordSponsorInteraction(DB, {
        sponsor_id: sponsor.id,
        organization_id,
        user_id,
        game_type: 'scratch',
        interaction_type: 'view',
        engagement_score: 1.0
      })
    }

    // Paiement par carte bancaire → Stripe
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
              unit_amount: Math.round(amount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/scratch-result.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/scratch.html?payment=cancelled`,
        metadata: {
          game_type: 'scratch',
          user_id,
          organization_id,
          amount: amount.toString(),
          payment_method: 'card',
          sponsor_id: sponsor?.id || '',
          referral_code: referral_code || ''
        }
      })

      return c.json({
        success: true,
        payment_required: true,
        session_id: session.id,
        checkout_url: session.url
      })
    }

    // Paiement wallet ou mobile (jeu instantané)
    if (payment_method === 'wallet' || payment_method === 'mobile') {
      // Tirage au sort (10% de chance de gagner)
      const isWinner = Math.random() < 0.10

      let prizeData = null
      if (isWinner) {
        const prizes = await DB.prepare(`
          SELECT * FROM scratch_prizes WHERE organization_id = ? AND is_active = 1
        `).bind(organization_id).all()

        if (!prizes.results || prizes.results.length === 0) {
          return c.json({ 
            success: false, 
            error: 'Aucun lot disponible pour cette organisation' 
          }, 500)
        }

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
          scratched_at, payment_method
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
      `).bind(
        gameId,
        user_id,
        organization_id,
        amount,
        isWinner ? 1 : 0,
        prizeData ? prizeData.id : null,
        prizeData ? prizeData.name : null,
        prizeData ? prizeData.value : null,
        payment_method
      ).run()

      // Enregistrer la transaction avec commission club
      const transactionId = await recordGameTransaction(DB, {
        user_id,
        organization_id,
        game_type: 'scratch',
        game_id: gameId,
        amount_paid: amount,
        sponsor_id: sponsor?.id,
        payment_method,
        referral_code
      })

      // Enregistrer interaction sponsor (PLAY)
      if (sponsor) {
        await recordSponsorInteraction(DB, {
          sponsor_id: sponsor.id,
          organization_id,
          user_id,
          game_type: 'scratch',
          interaction_type: 'play',
          engagement_score: 5.0
        })
      }

      // Si gagnant, enregistrer interaction WIN
      if (isWinner && sponsor && prizeData) {
        await recordSponsorInteraction(DB, {
          sponsor_id: sponsor.id,
          organization_id,
          user_id,
          game_type: 'scratch',
          interaction_type: 'win',
          prize_won: prizeData.id,
          engagement_score: 10.0
        })
      }

      return c.json({
        success: true,
        payment_required: false,
        game_id: gameId,
        transaction_id: transactionId,
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

    const metadata = session.metadata
    if (!metadata) {
      return c.json({ success: false, error: 'Métadonnées manquantes' }, 400)
    }

    const { user_id, organization_id, sponsor_id } = metadata

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
    const isWinner = Math.random() < 0.10

    let prizeData = null
    if (isWinner) {
      const prizes = await DB.prepare(`
        SELECT * FROM scratch_prizes WHERE organization_id = ? AND is_active = 1
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

    const gameId = `scratch-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    
    await DB.prepare(`
      INSERT INTO scratch_games (
        id, user_id, organization_id, amount_paid, 
        is_winner, prize_id, prize_name, prize_value, 
        scratched_at, payment_method, payment_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), 'card', ?)
    `).bind(
      gameId,
      user_id,
      organization_id,
      1.0,
      isWinner ? 1 : 0,
      prizeData ? prizeData.id : null,
      prizeData ? prizeData.name : null,
      prizeData ? prizeData.value : null,
      sessionId
    ).run()

    // Enregistrer transaction avec commission club
    await recordGameTransaction(DB, {
      user_id,
      organization_id,
      game_type: 'scratch',
      game_id: gameId,
      amount_paid: 1.0,
      sponsor_id: sponsor_id || undefined,
      payment_method: 'card',
      payment_id: sessionId
    })

    // Enregistrer interactions sponsor
    if (sponsor_id) {
      await recordSponsorInteraction(DB, {
        sponsor_id,
        organization_id,
        user_id,
        game_type: 'scratch',
        interaction_type: 'play',
        engagement_score: 5.0
      })

      if (isWinner && prizeData) {
        await recordSponsorInteraction(DB, {
          sponsor_id,
          organization_id,
          user_id,
          game_type: 'scratch',
          interaction_type: 'win',
          prize_won: prizeData.id,
          engagement_score: 10.0
        })
      }
    }

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

// GET /api/games/scratch/prizes/:organizationId - Liste des lots
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
      WHERE organization_id = ? AND is_active = 1
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

// ═══════════════════════════════════════════════════════════
// GET /api/games/packs - Liste des packs disponibles
// ═══════════════════════════════════════════════════════════
games.get('/packs', async (c) => {
  try {
    const { DB } = c.env
    
    if (!DB) {
      return c.json({ 
        success: false, 
        error: 'Base de données non disponible' 
      }, 500)
    }

    const organization_id = c.req.query('organization_id')

    let query = `
      SELECT * FROM game_packs 
      WHERE is_active = 1 
      AND (organization_id IS NULL OR organization_id = ?)
      ORDER BY discounted_price ASC
    `

    const packs = await DB.prepare(query).bind(organization_id || null).all()

    return c.json({
      success: true,
      packs: packs.results || []
    })

  } catch (error) {
    console.error('Erreur récupération packs:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ═══════════════════════════════════════════════════════════
// POST /api/games/track-sponsor - Tracking sponsor (FOMO)
// ═══════════════════════════════════════════════════════════
games.post('/track-sponsor', async (c) => {
  try {
    const { DB } = c.env
    if (!DB) {
      return c.json({ success: false, error: 'DB non disponible' }, 500)
    }

    const {
      sponsor_id,
      organization_id,
      user_id,
      interaction_type,
      details
    } = await c.req.json()

    // Scores d'engagement
    const engagementScores: Record<string, number> = {
      view: 1.0,
      click: 3.0,
      play: 5.0,
      win: 10.0,
      purchase: 20.0
    }

    await recordSponsorInteraction(DB, {
      sponsor_id,
      organization_id,
      user_id,
      game_type: 'scratch',
      interaction_type,
      engagement_score: engagementScores[interaction_type] || 1.0
    })

    return c.json({
      success: true,
      message: 'Interaction enregistrée',
      score: engagementScores[interaction_type] || 1.0
    })

  } catch (error) {
    console.error('Erreur tracking sponsor:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ═══════════════════════════════════════════════════════════
// POST /api/games/track-social - Tracking partage social (FOMO)
// ═══════════════════════════════════════════════════════════
games.post('/track-social', async (c) => {
  try {
    const { DB } = c.env
    if (!DB) {
      return c.json({ success: false, error: 'DB non disponible' }, 500)
    }

    const {
      user_id,
      organization_id,
      platform,
      content_type,
      content_id,
      reward_amount,
      game_type = 'scratch'
    } = await c.req.json()

    const shareId = `share-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

    await DB.prepare(`
      INSERT INTO social_shares (
        id, user_id, game_type, platform, bonus_earned
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      shareId,
      user_id,
      game_type,
      platform,
      reward_amount
    ).run()

    return c.json({
      success: true,
      message: 'Partage enregistré',
      reward: reward_amount,
      share_id: shareId
    })

  } catch (error) {
    console.error('Erreur tracking social:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ═══════════════════════════════════════════════════════════
// REÇUS ET HISTORIQUE
// ═══════════════════════════════════════════════════════════

/**
 * Envoyer un reçu par email après une transaction
 * POST /api/games/send-receipt
 */
games.post('/send-receipt', async (c) => {
  try {
    const { env } = c
    const { transaction_id, user_email } = await c.req.json()

    if (!transaction_id || !user_email) {
      return c.json({
        success: false,
        error: 'transaction_id et user_email requis'
      }, 400)
    }

    // Récupérer la transaction
    const transaction = await env.DB.prepare(`
      SELECT 
        gt.*,
        p.name as prize_name,
        p.value as prize_value,
        o.name as organization_name
      FROM game_transactions gt
      LEFT JOIN scratch_prizes p ON gt.game_id = 'scratch-' || substr(gt.id, 4)
      LEFT JOIN organizations o ON gt.organization_id = o.id
      WHERE gt.id = ?
    `).bind(transaction_id).first()

    if (!transaction) {
      return c.json({
        success: false,
        error: 'Transaction introuvable'
      }, 404)
    }

    // Générer le numéro de facture s'il n'existe pas
    let invoiceNumber = transaction.invoice_number
    if (!invoiceNumber) {
      const date = new Date(transaction.created_at)
      const dateStr = date.toISOString().split('T')[0].replace(/-/g, '')
      invoiceNumber = `INV-${dateStr}-${transaction.id.slice(-6).toUpperCase()}`
      
      await env.DB.prepare(`
        UPDATE game_transactions 
        SET invoice_number = ?, user_email = ?, receipt_sent = 1, receipt_sent_at = datetime('now')
        WHERE id = ?
      `).bind(invoiceNumber, user_email, transaction_id).run()
    }

    // Dans un vrai système, vous enverriez un email ici
    // Pour l'instant, on retourne les données du reçu
    const receiptData = {
      invoice_number: invoiceNumber,
      transaction_id: transaction.id,
      date: transaction.created_at,
      user_email: user_email,
      organization: transaction.organization_name || 'PaieCashFan',
      game_type: transaction.game_type?.toUpperCase() || 'SCRATCH',
      amount_paid: transaction.amount_paid,
      payment_method: transaction.payment_method,
      status: transaction.status,
      is_winner: !!transaction.prize_won,
      prize: transaction.prize_won ? {
        name: transaction.prize_name,
        value: transaction.prize_value
      } : null,
      commissions: {
        club: transaction.club_commission,
        social: transaction.social_action_fee,
        paiecash: transaction.paiecash_revenue
      }
    }

    // TODO: Intégrer avec un service email (SendGrid, Resend, etc.)
    // Pour l'instant, le reçu est généré et stocké en base de données
    // L'utilisateur peut le consulter dans /mes-tickets.html ou le télécharger en PDF
    // 
    // Pour activer l'envoi email automatique :
    // 1. Créer un compte sur SendGrid/Resend/Mailgun
    // 2. Obtenir la clé API
    // 3. Configurer : wrangler secret put EMAIL_API_KEY
    // 4. Décommenter le code ci-dessous :
    //
    // await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${env.EMAIL_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: user_email }] }],
    //     from: { email: 'noreply@paiecashfan.com' },
    //     subject: `Reçu ${invoiceNumber} - PaieCashFan`,
    //     content: [{ type: 'text/html', value: invoiceHTML }]
    //   })
    // })

    return c.json({
      success: true,
      message: 'Reçu généré (email non configuré - consultez Mes Tickets)',
      receipt: receiptData,
      note: 'L\'envoi email automatique nécessite la configuration d\'un service email (SendGrid, Resend, etc.)'
    })

  } catch (error) {
    console.error('Erreur envoi reçu:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Récupérer l'historique des tickets d'un utilisateur
 * GET /api/games/my-tickets/:user_id
 */
games.get('/my-tickets/:user_id', async (c) => {
  try {
    const { env } = c
    const user_id = c.req.param('user_id')

    if (!user_id) {
      return c.json({
        success: false,
        error: 'user_id requis'
      }, 400)
    }

    // Récupérer toutes les transactions de l'utilisateur
    const transactions = await env.DB.prepare(`
      SELECT 
        gt.id,
        gt.game_type,
        gt.game_id,
        gt.amount_paid,
        gt.payment_method,
        gt.status,
        gt.created_at,
        gt.invoice_number,
        gt.prize_won,
        gt.club_commission,
        gt.social_action_fee,
        gt.paiecash_revenue,
        p.name as prize_name,
        p.value as prize_value,
        p.description as prize_description,
        o.name as organization_name
      FROM game_transactions gt
      LEFT JOIN scratch_prizes p ON gt.prize_won = p.id
      LEFT JOIN organizations o ON gt.organization_id = o.id
      WHERE gt.user_id = ?
      ORDER BY gt.created_at DESC
    `).bind(user_id).all()

    // Calculer les statistiques
    const stats = {
      total_games: transactions.results?.length || 0,
      total_spent: 0,
      total_won: 0,
      win_count: 0,
      loss_count: 0
    }

    transactions.results?.forEach((tx: any) => {
      stats.total_spent += tx.amount_paid || 0
      if (tx.prize_won) {
        stats.win_count++
        stats.total_won += tx.prize_value || 0
      } else {
        stats.loss_count++
      }
    })

    return c.json({
      success: true,
      tickets: transactions.results || [],
      stats: stats
    })

  } catch (error) {
    console.error('Erreur récupération historique:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Télécharger une facture PDF
 * GET /api/games/invoice/:transaction_id
 */
games.get('/invoice/:transaction_id', async (c) => {
  try {
    const { env } = c
    const transaction_id = c.req.param('transaction_id')

    // Récupérer la transaction
    const transaction = await env.DB.prepare(`
      SELECT 
        gt.*,
        p.name as prize_name,
        p.value as prize_value,
        o.name as organization_name
      FROM game_transactions gt
      LEFT JOIN scratch_prizes p ON gt.prize_won = p.id
      LEFT JOIN organizations o ON gt.organization_id = o.id
      WHERE gt.id = ?
    `).bind(transaction_id).first()

    if (!transaction) {
      return c.json({
        success: false,
        error: 'Transaction introuvable'
      }, 404)
    }

    // Générer HTML de facture
    const invoiceHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Facture ${transaction.invoice_number}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
    .section { background: #f5f7fa; padding: 15px; border-radius: 8px; }
    .section h3 { margin-top: 0; color: #667eea; }
    .total { background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; }
    .footer { margin-top: 30px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #667eea; color: white; }
    .status-win { color: #10b981; font-weight: bold; }
    .status-loss { color: #ef4444; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎮 PaieCashFan</h1>
    <h2>Reçu de Transaction</h2>
    <p><strong>N° ${transaction.invoice_number}</strong></p>
  </div>

  <div class="info-grid">
    <div class="section">
      <h3>Informations Client</h3>
      <p><strong>ID:</strong> ${transaction.user_id}</p>
      <p><strong>Email:</strong> ${transaction.user_email || 'Non renseigné'}</p>
    </div>
    
    <div class="section">
      <h3>Détails Transaction</h3>
      <p><strong>Date:</strong> ${new Date(transaction.created_at).toLocaleString('fr-FR')}</p>
      <p><strong>ID Transaction:</strong> ${transaction.id}</p>
      <p><strong>Organisation:</strong> ${transaction.organization_name || 'PaieCashFan'}</p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Jeu</th>
        <th>Mode de paiement</th>
        <th>Montant</th>
        <th>Statut</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>${transaction.game_type?.toUpperCase() || 'SCRATCH'}</td>
        <td>${transaction.payment_method === 'wallet' ? 'Wallet' : transaction.payment_method === 'card' ? 'Carte Bancaire' : 'Mobile Money'}</td>
        <td>${transaction.amount_paid?.toFixed(2)}€</td>
        <td class="${transaction.prize_won ? 'status-win' : 'status-loss'}">
          ${transaction.prize_won ? '✅ GAGNANT' : '❌ Non gagnant'}
        </td>
      </tr>
    </tbody>
  </table>

  ${transaction.prize_won ? `
  <div class="section">
    <h3>🏆 Lot Gagné</h3>
    <p><strong>${transaction.prize_name}</strong></p>
    <p>Valeur: ${transaction.prize_value}€</p>
  </div>
  ` : ''}

  <div class="total">
    TOTAL PAYÉ: ${transaction.amount_paid?.toFixed(2)}€
  </div>

  <div class="footer">
    <p>Merci d'avoir joué avec PaieCashFan !</p>
    <p>Pour toute question: support@paiecashfan.com</p>
    <p>© 2026 PaieCashFan - Tous droits réservés</p>
  </div>
</body>
</html>
    `

    return c.html(invoiceHTML)

  } catch (error) {
    console.error('Erreur génération facture:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default games
