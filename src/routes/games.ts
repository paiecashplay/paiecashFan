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

    // Générer HTML de l'email
    const emailHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f5f7fa; }
    .container { background: white; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #667eea; }
    .header h1 { color: #667eea; margin: 0; font-size: 28px; }
    .header p { color: #666; margin: 5px 0 0 0; }
    .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .info-box strong { color: #667eea; }
    .status-win { color: #10b981; font-weight: bold; font-size: 18px; }
    .status-loss { color: #ef4444; font-weight: bold; font-size: 18px; }
    .prize-box { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; border: 2px solid #fbbf24; }
    .prize-box h3 { margin: 0 0 10px 0; color: #92400e; }
    .total { background: #667eea; color: white; padding: 20px; border-radius: 8px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0; }
    .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎮 PaieCashFan</h1>
      <p>Reçu de Transaction</p>
      <p style="font-size: 18px; font-weight: bold; color: #667eea;">N° ${invoiceNumber}</p>
    </div>

    <div class="info-box">
      <p><strong>Date :</strong> ${new Date(transaction.created_at).toLocaleString('fr-FR')}</p>
      <p><strong>Organisation :</strong> ${transaction.organization_name || 'PaieCashFan'}</p>
      <p><strong>Jeu :</strong> ${transaction.game_type?.toUpperCase() || 'SCRATCH'}</p>
      <p><strong>Mode de paiement :</strong> ${transaction.payment_method === 'wallet' ? 'Wallet' : transaction.payment_method === 'card' ? 'Carte Bancaire' : 'Mobile Money'}</p>
    </div>

    <div style="text-align: center; margin: 20px 0;">
      <p style="font-size: 16px; color: #666; margin-bottom: 10px;">Résultat :</p>
      <p class="${transaction.prize_won ? 'status-win' : 'status-loss'}">
        ${transaction.prize_won ? '✅ GAGNANT !' : '❌ Non gagnant'}
      </p>
    </div>

    ${transaction.prize_won ? `
    <div class="prize-box">
      <h3>🏆 Lot Gagné</h3>
      <p style="font-size: 20px; font-weight: bold; color: #92400e; margin: 10px 0;">${transaction.prize_name}</p>
      <p style="font-size: 16px; color: #78350f;">Valeur : ${transaction.prize_value}€</p>
    </div>
    ` : ''}

    <div class="total">
      TOTAL PAYÉ : ${transaction.amount_paid?.toFixed(2)}€
    </div>

    <div style="text-align: center;">
      <a href="${env.FRONTEND_URL || 'https://paiecashfan.com'}/mes-tickets.html" class="button">
        📋 Voir mon historique
      </a>
    </div>

    <div class="footer">
      <p>Merci d'avoir joué avec PaieCashFan !</p>
      <p>Pour toute question : support@paiecashfan.com</p>
      <p>© 2026 PaieCashFan - Tous droits réservés</p>
    </div>
  </div>
</body>
</html>
    `

    // Envoi email via Resend
    let emailSent = false
    let emailError = null

    if (env.RESEND_API_KEY) {
      try {
        // Pour le test, utiliser onboarding@resend.dev
        // En production, remplacer par un domaine vérifié
        const fromEmail = 'PaieCashFan <onboarding@resend.dev>'
        
        const resendResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [user_email],
            subject: `Reçu ${invoiceNumber} - PaieCashFan`,
            html: emailHTML
          })
        })

        if (resendResponse.ok) {
          emailSent = true
          console.log('✅ Email envoyé via Resend à', user_email)
        } else {
          const errorData = await resendResponse.json()
          emailError = errorData.message || 'Erreur Resend'
          console.error('❌ Erreur Resend:', errorData)
        }
      } catch (error) {
        emailError = error instanceof Error ? error.message : 'Unknown error'
        console.error('❌ Erreur envoi email:', error)
      }
    }

    return c.json({
      success: true,
      message: emailSent ? 'Reçu envoyé par email' : 'Reçu généré (email non envoyé)',
      email_sent: emailSent,
      email_error: emailError,
      receipt: receiptData
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

/**
 * ==========================================
 * 🎲 API LOTO - Grille de numéros garantis
 * ==========================================
 */

/**
 * GET /api/games/loto/prizes
 * Récupérer tous les lots LOTO disponibles
 */
games.get('/loto/prizes', async (c) => {
  try {
    const { env } = c

    const prizes = await env.DB.prepare(`
      SELECT * FROM loto_prizes 
      ORDER BY value DESC
    `).all()

    return c.json({
      success: true,
      prizes: prizes.results || []
    })
  } catch (error) {
    console.error('Erreur récupération lots LOTO:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * POST /api/games/loto/play
 * Jouer au LOTO avec paiement (2€)
 * Body: {
 *   user_id: string,
 *   organization_id: string,
 *   numbers: number[] (5 numéros entre 1-50),
 *   chance: number (1 numéro entre 1-10),
 *   payment_method: 'card' | 'wallet' | 'mobile_money',
 *   payment_id?: string (pour carte Stripe),
 *   user_email?: string
 * }
 */
games.post('/loto/play', async (c) => {
  try {
    const { env } = c
    const body = await c.req.json()
    const {
      user_id,
      organization_id = 'om-001',
      numbers,
      chance,
      payment_method,
      payment_id,
      user_email
    } = body

    // Validation
    if (!user_id || !numbers || !chance) {
      return c.json({
        success: false,
        error: 'user_id, numbers et chance requis'
      }, 400)
    }

    if (!Array.isArray(numbers) || numbers.length !== 5) {
      return c.json({
        success: false,
        error: 'Vous devez choisir exactement 5 numéros'
      }, 400)
    }

    if (numbers.some(n => n < 1 || n > 50)) {
      return c.json({
        success: false,
        error: 'Les numéros doivent être entre 1 et 50'
      }, 400)
    }

    if (chance < 1 || chance > 10) {
      return c.json({
        success: false,
        error: 'Le numéro chance doit être entre 1 et 10'
      }, 400)
    }

    // Prix fixe : 2€ par grille
    const LOTO_PRICE = 2.0

    // Si paiement par carte, créer une session Stripe
    if (payment_method === 'card') {
      const { STRIPE_SECRET_KEY } = env
      
      if (!STRIPE_SECRET_KEY) {
        return c.json({
          success: false,
          error: 'Stripe non configuré'
        }, 500)
      }

      const stripe = new Stripe(STRIPE_SECRET_KEY, {
        apiVersion: '2024-12-18.acacia'
      })

      // Créer la session Stripe Checkout
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: 'LOTO PaieCashFan - Grille de numéros',
                description: `Vos numéros: ${numbers.join(', ')} + Chance ${chance}`,
                images: ['https://via.placeholder.com/300x200?text=LOTO']
              },
              unit_amount: Math.round(LOTO_PRICE * 100)
            },
            quantity: 1
          }
        ],
        mode: 'payment',
        success_url: `${c.req.url.split('/api')[0]}/loto.html?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${c.req.url.split('/api')[0]}/loto.html`,
        metadata: {
          user_id,
          organization_id,
          numbers: JSON.stringify(numbers),
          chance: chance.toString(),
          user_email: user_email || ''
        }
      })

      return c.json({
        success: true,
        payment_required: true,
        checkout_url: session.url,
        session_id: session.id
      })
    }

    // Si paiement par wallet, continuer le jeu immédiatement
    // Simulation tirage aléatoire avec système de "boost" pour garantir un minimum de correspondances
    let winningNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1)
    const winningChance = Math.floor(Math.random() * 10) + 1

    // Calcul initial des correspondances
    let matchedCount = numbers.filter(n => winningNumbers.includes(n)).length
    
    // 🚀 Système de BOOST : garantir minimum 2-3 numéros matchés
    if (matchedCount < 2) {
      // Déterminer combien de numéros on doit "booster"
      const boostTarget = Math.random() < 0.5 ? 2 : 3 // Aléatoire entre 2 et 3
      const numbersToBoost = boostTarget - matchedCount
      
      // Remplacer des numéros gagnants par des numéros du joueur (non encore matchés)
      const unmatchedUserNumbers = numbers.filter(n => !winningNumbers.includes(n))
      
      for (let i = 0; i < numbersToBoost && unmatchedUserNumbers.length > 0; i++) {
        // Prendre un numéro du joueur qui n'a pas encore matché
        const userNum = unmatchedUserNumbers.shift()
        
        // Trouver un index dans winningNumbers qui n'est pas déjà un match
        let replaceIndex = winningNumbers.findIndex(wn => !numbers.includes(wn))
        if (replaceIndex === -1) replaceIndex = 0 // Fallback
        
        // Remplacer
        winningNumbers[replaceIndex] = userNum
      }
      
      // Recalculer après boost
      matchedCount = numbers.filter(n => winningNumbers.includes(n)).length
      
      console.log('🚀 BOOST appliqué:', {
        avant: matchedCount - numbersToBoost,
        après: matchedCount,
        boost: numbersToBoost
      })
    }

    // Calcul final des correspondances
    const matchedNumbers = matchedCount
    const matchedChance = chance === winningChance ? 1 : 0

    console.log('🎲 LOTO Tirage:', {
      user_numbers: numbers,
      user_chance: chance,
      winning_numbers: winningNumbers,
      winning_chance: winningChance,
      matched_numbers: matchedNumbers,
      matched_chance: matchedChance
    })

    // Déterminer le lot gagné (GARANTIE : toujours un lot minimum)
    let prize = null
    let match_requirement = `${matchedNumbers}`
    if (matchedChance === 1) {
      match_requirement += '+1'
    }

    console.log('🎯 Recherche lot pour:', match_requirement)

    // Récupérer le lot correspondant
    const prizeQuery = await env.DB.prepare(`
      SELECT * FROM loto_prizes 
      WHERE match_requirement = ?
      ORDER BY value DESC
      LIMIT 1
    `).bind(match_requirement).first()

    if (prizeQuery) {
      prize = prizeQuery
      console.log('✅ Lot trouvé:', prize.name)
    } else {
      // Si aucun lot exact, donner le lot de consolation
      console.log('⚠️ Pas de lot trouvé, attribution consolation')
      const consolationPrize = await env.DB.prepare(`
        SELECT * FROM loto_prizes 
        WHERE category = 'consolation'
        ORDER BY value DESC
        LIMIT 1
      `).first()
      prize = consolationPrize || null
    }

    // Si toujours pas de lot, créer un lot de base
    if (!prize) {
      prize = {
        id: 'consolation-default',
        name: 'Produit frais offert',
        value: 2.0,
        category: 'consolation',
        match_requirement: '0N'
      }
    }

    // Générer les IDs
    const gameId = `loto-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const invoiceNumber = `INV-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Enregistrer la partie dans loto_games
    await env.DB.prepare(`
      INSERT INTO loto_games (
        id, user_id, organization_id, 
        selected_numbers, selected_chance,
        winning_numbers, winning_chance,
        matched_numbers, matched_chance,
        prize_id, prize_value,
        amount_paid, payment_method, payment_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      gameId,
      user_id,
      organization_id,
      JSON.stringify(numbers),
      chance,
      JSON.stringify(winningNumbers),
      winningChance,
      matchedNumbers,
      matchedChance,
      prize?.id || null,
      prize?.value || 0,
      LOTO_PRICE,
      payment_method,
      payment_id || null
    ).run()

    // Calculer les commissions
    const {
      clubCommission,
      socialActionFee,
      paiecashRevenue
    } = calculateCommissions(LOTO_PRICE)

    // Enregistrer la transaction
    await env.DB.prepare(`
      INSERT INTO game_transactions (
        id, user_id, organization_id,
        game_type, game_id,
        amount_paid,
        club_commission, social_action_fee, paiecash_revenue,
        platform_fee, prize_pool, sponsor_amount, sponsor_id,
        pack_type, discount_applied,
        referral_code, referral_bonus,
        payment_method, payment_id,
        status,
        user_email, receipt_sent, receipt_sent_at,
        invoice_number, prize_won,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      transactionId,
      user_id,
      organization_id,
      'LOTO',
      gameId,
      LOTO_PRICE,
      clubCommission,
      socialActionFee,
      paiecashRevenue,
      0, // platform_fee
      0, // prize_pool
      0, // sponsor_amount
      null, // sponsor_id
      'solo',
      0,
      null,
      0,
      payment_method,
      payment_id || null,
      'completed',
      user_email || null,
      0, // receipt_sent
      null, // receipt_sent_at
      invoiceNumber,
      null // prize_won - LOTO ne stocke pas ici (dans loto_games)
    ).run()

    console.log('✅ LOTO partie enregistrée:', {
      gameId,
      transactionId,
      prize: prize?.name,
      value: prize?.value
    })

    // Envoyer l'email si email fourni
    let emailSent = false
    if (user_email && env.RESEND_API_KEY) {
      try {
        const emailBody = {
          from: 'PaieCashFan <onboarding@resend.dev>',
          to: user_email,
          subject: `🎲 Résultat LOTO - ${invoiceNumber}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
                .prize-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px; }
                .numbers { display: flex; gap: 10px; justify-content: center; margin: 20px 0; }
                .number { background: #667eea; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
                .chance { background: #f59e0b; }
                .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 10px 0; }
                .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #666; font-size: 14px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎲 LOTO PaieCashFan</h1>
                  <p style="margin: 0; font-size: 18px;">Résultat de votre tirage</p>
                </div>
                <div class="content">
                  <h2>📋 Détails de la partie</h2>
                  <p><strong>N° de transaction :</strong> ${transactionId}</p>
                  <p><strong>N° de facture :</strong> ${invoiceNumber}</p>
                  <p><strong>Date :</strong> ${new Date().toLocaleString('fr-FR')}</p>
                  <p><strong>Montant payé :</strong> ${LOTO_PRICE.toFixed(2)} €</p>
                  
                  <h3>Vos numéros :</h3>
                  <div class="numbers">
                    ${numbers.map(n => `<div class="number">${n}</div>`).join('')}
                    <div class="number chance">${chance}</div>
                  </div>
                  
                  <h3>Numéros gagnants :</h3>
                  <div class="numbers">
                    ${winningNumbers.map(n => `<div class="number">${n}</div>`).join('')}
                    <div class="number chance">${winningChance}</div>
                  </div>
                  
                  <div class="prize-box">
                    <h2 style="margin-top: 0; color: #10b981;">🎉 ${prize?.name || 'Lot gagné'}</h2>
                    <p style="font-size: 18px; margin: 10px 0;"><strong>Valeur : ${(prize?.value || 0).toFixed(2)} €</strong></p>
                    <p style="margin: 0;">Correspondances : ${matchedNumbers} numéro(s)${matchedChance ? ' + Chance ✨' : ''}</p>
                  </div>
                  
                  <p style="text-align: center;">
                    <a href="https://3000-icomwnne7u5jo8rhs9r05-b237eb32.sandbox.novita.ai/mes-tickets.html" class="button">
                      Voir mon historique
                    </a>
                  </p>
                  
                  <div class="footer">
                    <p><strong>PaieCashFan</strong> - Jeux sponsorisés par la Grande Distribution</p>
                    <p style="font-size: 12px; color: #999;">Avec votre ticket, vous gagnez toujours !</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        }

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailBody)
        })

        const result = await response.json()
        if (response.ok) {
          emailSent = true
          // Marquer le reçu comme envoyé
          await env.DB.prepare(`
            UPDATE game_transactions 
            SET receipt_sent = 1, receipt_sent_at = datetime('now')
            WHERE id = ?
          `).bind(transactionId).run()
        } else {
          console.error('❌ Erreur Resend:', result)
        }
      } catch (emailError) {
        console.error('❌ Erreur envoi email:', emailError)
      }
    }

    // Retourner le résultat
    return c.json({
      success: true,
      game_id: gameId,
      transaction_id: transactionId,
      invoice_number: invoiceNumber,
      user_numbers: numbers,
      user_chance: chance,
      winning_numbers: winningNumbers,
      winning_chance: winningChance,
      matched_numbers: matchedNumbers,
      matched_chance: matchedChance,
      prize: {
        id: prize?.id,
        name: prize?.name,
        value: prize?.value,
        category: prize?.category
      },
      amount_paid: LOTO_PRICE,
      commissions: {
        club: clubCommission,
        social: socialActionFee,
        paiecash: paiecashRevenue
      },
      email_sent: emailSent
    })

  } catch (error) {
    console.error('❌ Erreur LOTO play:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * GET /api/games/loto/result/:sessionId
 * Récupérer le résultat LOTO après paiement Stripe
 */
games.get('/loto/result/:sessionId', async (c) => {
  try {
    const { env } = c
    const { DB, STRIPE_SECRET_KEY } = env
    
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

    const { user_id, organization_id, numbers, chance, user_email } = metadata

    // Parser les numéros depuis metadata
    const selectedNumbers = JSON.parse(numbers)
    const selectedChance = parseInt(chance)

    // Simulation tirage aléatoire avec système de "boost"
    let winningNumbers = Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1)
    const winningChance = Math.floor(Math.random() * 10) + 1

    // Calcul initial des correspondances
    let matchedCount = selectedNumbers.filter((n: number) => winningNumbers.includes(n)).length
    
    // 🚀 Système de BOOST : garantir minimum 2-3 numéros matchés
    if (matchedCount < 2) {
      const boostTarget = Math.random() < 0.5 ? 2 : 3
      const numbersToBoost = boostTarget - matchedCount
      
      const unmatchedUserNumbers = selectedNumbers.filter((n: number) => !winningNumbers.includes(n))
      
      for (let i = 0; i < numbersToBoost && unmatchedUserNumbers.length > 0; i++) {
        const userNum = unmatchedUserNumbers.shift()
        let replaceIndex = winningNumbers.findIndex((wn: number) => !selectedNumbers.includes(wn))
        if (replaceIndex === -1) replaceIndex = 0
        winningNumbers[replaceIndex] = userNum
      }
      
      matchedCount = selectedNumbers.filter((n: number) => winningNumbers.includes(n)).length
      
      console.log('🚀 BOOST (Stripe) appliqué:', {
        avant: matchedCount - numbersToBoost,
        après: matchedCount,
        boost: numbersToBoost
      })
    }

    // Calcul final des correspondances
    const matchedNumbers = matchedCount
    const matchedChance = selectedChance === winningChance ? 1 : 0

    // Déterminer le lot gagné
    let prize = null
    let match_requirement = `${matchedNumbers}`
    if (matchedChance === 1) {
      match_requirement += '+1'
    }

    const prizeQuery = await DB.prepare(`
      SELECT * FROM loto_prizes 
      WHERE match_requirement = ?
      ORDER BY value DESC
      LIMIT 1
    `).bind(match_requirement).first()

    if (prizeQuery) {
      prize = prizeQuery
    } else {
      // Lot de consolation
      const consolationPrize = await DB.prepare(`
        SELECT * FROM loto_prizes 
        WHERE category = 'consolation'
        ORDER BY value DESC
        LIMIT 1
      `).first()
      prize = consolationPrize || null
    }

    // Générer les IDs
    const LOTO_PRICE = 2.0
    const gameId = `loto-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const transactionId = `tx-${Date.now()}-${Math.random().toString(36).substring(7)}`
    const invoiceNumber = `INV-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`

    // Enregistrer la partie
    await DB.prepare(`
      INSERT INTO loto_games (
        id, user_id, organization_id, 
        selected_numbers, selected_chance,
        winning_numbers, winning_chance,
        matched_numbers, matched_chance,
        prize_id, prize_value,
        amount_paid, payment_method, payment_id,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      gameId,
      user_id,
      organization_id,
      JSON.stringify(selectedNumbers),
      selectedChance,
      JSON.stringify(winningNumbers),
      winningChance,
      matchedNumbers,
      matchedChance,
      prize?.id || null,
      prize?.value || 0,
      LOTO_PRICE,
      'card',
      sessionId
    ).run()

    // Calculer les commissions
    const {
      clubCommission,
      socialActionFee,
      paiecashRevenue
    } = calculateCommissions(LOTO_PRICE)

    // Enregistrer la transaction
    await DB.prepare(`
      INSERT INTO game_transactions (
        id, user_id, organization_id,
        game_type, game_id,
        amount_paid,
        club_commission, social_action_fee, paiecash_revenue,
        platform_fee, prize_pool, sponsor_amount, sponsor_id,
        pack_type, discount_applied,
        referral_code, referral_bonus,
        payment_method, payment_id,
        status,
        user_email, receipt_sent, receipt_sent_at,
        invoice_number, prize_won,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).bind(
      transactionId,
      user_id,
      organization_id,
      'LOTO',
      gameId,
      LOTO_PRICE,
      clubCommission,
      socialActionFee,
      paiecashRevenue,
      0, 0, 0, null,
      'solo', 0, null, 0,
      'card',
      sessionId,
      'completed',
      user_email || null,
      0, null,
      invoiceNumber,
      null
    ).run()

    // Envoyer l'email si configuré
    let emailSent = false
    if (user_email && env.RESEND_API_KEY) {
      try {
        const emailBody = {
          from: 'PaieCashFan <onboarding@resend.dev>',
          to: user_email,
          subject: `🎲 Résultat LOTO - ${invoiceNumber}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1>🎲 LOTO PaieCashFan</h1>
                  <p style="margin: 0; font-size: 18px;">Résultat de votre tirage</p>
                </div>
                <div style="background: white; padding: 30px; border: 1px solid #e5e7eb;">
                  <h2>📋 Détails</h2>
                  <p><strong>N° transaction :</strong> ${transactionId}</p>
                  <p><strong>N° facture :</strong> ${invoiceNumber}</p>
                  <p><strong>Montant :</strong> ${LOTO_PRICE.toFixed(2)} €</p>
                  
                  <h3>Vos numéros : ${selectedNumbers.join(', ')} + Chance ${selectedChance}</h3>
                  <h3>Numéros gagnants : ${winningNumbers.join(', ')} + Chance ${winningChance}</h3>
                  
                  <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 8px;">
                    <h2 style="margin-top: 0; color: #10b981;">🎉 ${prize?.name || 'Lot gagné'}</h2>
                    <p style="font-size: 18px;"><strong>Valeur : ${(prize?.value || 0).toFixed(2)} €</strong></p>
                    <p>Correspondances : ${matchedNumbers} numéro(s)${matchedChance ? ' + Chance ✨' : ''}</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `
        }

        const response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(emailBody)
        })

        if (response.ok) {
          emailSent = true
          await DB.prepare(`
            UPDATE game_transactions 
            SET receipt_sent = 1, receipt_sent_at = datetime('now')
            WHERE id = ?
          `).bind(transactionId).run()
        }
      } catch (emailError) {
        console.error('❌ Erreur email:', emailError)
      }
    }

    // Retourner le résultat
    return c.json({
      success: true,
      game_id: gameId,
      transaction_id: transactionId,
      invoice_number: invoiceNumber,
      user_numbers: selectedNumbers,
      user_chance: selectedChance,
      winning_numbers: winningNumbers,
      winning_chance: winningChance,
      matched_numbers: matchedNumbers,
      matched_chance: matchedChance,
      prize: {
        id: prize?.id,
        name: prize?.name,
        value: prize?.value,
        category: prize?.category
      },
      amount_paid: LOTO_PRICE,
      commissions: {
        club: clubCommission,
        social: socialActionFee,
        paiecash: paiecashRevenue
      },
      email_sent: emailSent
    })

  } catch (error) {
    console.error('❌ Erreur LOTO result:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default games
