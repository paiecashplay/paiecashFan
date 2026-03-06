import { Hono } from 'hono'

type Bindings = {
  DB: D1Database
}

const tombola = new Hono<{ Bindings: Bindings }>()

// ==========================================
// UTILS - Calcul automatique prix d'entrée
// ==========================================

/**
 * Calcule le prix d'entrée optimal basé sur la valeur du lot
 * Formule: Prix entrée = (Valeur lot × Coefficient) ÷ Participants cibles
 * 
 * Coefficients par tranche:
 * - < 100€ : 1% (petits lots)
 * - 100-500€ : 2% (lots moyens)
 * - 500-2000€ : 5% (gros lots)
 * - > 2000€ : 10% (jackpots)
 */
function calculateEntryFee(lotValue: number, targetParticipants: number): number {
  // Déterminer le coefficient selon la valeur du lot
  let coefficient: number;
  
  if (lotValue < 100) {
    coefficient = 0.015; // 1.5% pour petits lots (augmenté)
  } else if (lotValue < 500) {
    coefficient = 0.025; // 2.5% pour lots moyens (augmenté)
  } else if (lotValue < 2000) {
    coefficient = 0.08;  // 8% pour gros lots (augmenté)
  } else {
    coefficient = 0.12;  // 12% pour jackpots (augmenté)
  }
  
  // Calcul: (Valeur × Coefficient) ÷ Participants
  const calculatedFee = (lotValue * coefficient) / targetParticipants;
  
  // 2. Vérification de rentabilité minimale (30% de marge)
  // Revenu minimum requis = lotValue × 1.3 (coût + 30%)
  const minRevenueRequired = lotValue * 1.3;
  const minFeeForProfitability = minRevenueRequired / targetParticipants;
  
  // Prendre le maximum entre calcul attractif et rentabilité garantie
  const safeFee = Math.max(calculatedFee, minFeeForProfitability);
  
  // Arrondir à 0.50€ près (0.50, 1.00, 1.50, 2.00, etc.)
  const roundedFee = Math.ceil(safeFee * 2) / 2;
  
  // Minimum 0.50€, Maximum 50€
  return Math.max(0.50, Math.min(50.00, roundedFee));
}

/**
 * Calcule le nombre minimum de participants pour couvrir le coût du lot
 */
function calculateMinParticipants(costToClub: number, entryFee: number): number {
  if (costToClub === 0) {
    // Lot sponsorisé: minimum symbolique
    return Math.ceil(entryFee * 100); // Ex: 1€ → 100 participants
  }
  
  // Calcul: Coût ÷ Prix entrée (avec marge 20%)
  const minParticipants = Math.ceil((costToClub * 1.2) / entryFee);
  
  // Minimum 50 participants, maximum 50000
  return Math.max(50, Math.min(50000, minParticipants));
}

/**
 * Affiche les infos de calcul pour debug
 */
function getCalculationDetails(lotValue: number, costToClub: number, targetParticipants: number) {
  const entryFee = calculateEntryFee(lotValue, targetParticipants);
  const minParticipants = calculateMinParticipants(costToClub, entryFee);
  const totalRevenue = entryFee * targetParticipants;
  const profit = totalRevenue - costToClub;
  const profitMargin = costToClub > 0 ? ((profit / costToClub) * 100).toFixed(1) : 'N/A';
  
  return {
    lot_value: lotValue,
    cost_to_club: costToClub,
    entry_fee: entryFee,
    target_participants: targetParticipants,
    min_participants: minParticipants,
    total_revenue: totalRevenue,
    profit: profit,
    profit_margin: `${profitMargin}%`,
    coefficient: lotValue < 100 ? '1%' : lotValue < 500 ? '2%' : lotValue < 2000 ? '5%' : '10%'
  };
}

// ==========================================
// LOTS - Catalogue
// ==========================================

// GET /api/tombola/lots - Liste tous les lots actifs
tombola.get('/lots', async (c) => {
  const { DB } = c.env
  
  try {
    const result = await DB.prepare(`
      SELECT 
        id, category, lot_type, name, description,
        cost_to_club, perceived_value, frequency,
        source, min_participants, image_url
      FROM lots
      WHERE active = 1
      ORDER BY 
        CASE category
          WHEN 'superbonus' THEN 1
          WHEN 'cash' THEN 2
          WHEN 'experience' THEN 3
          WHEN 'automobile' THEN 4
          WHEN 'voyage' THEN 5
          ELSE 6
        END,
        perceived_value DESC
    `).all()
    
    return c.json({
      success: true,
      lots: result.results,
      count: result.results.length
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch lots',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// GET /api/tombola/lots/:id - Détail d'un lot
tombola.get('/lots/:id', async (c) => {
  const { DB } = c.env
  const lotId = c.req.param('id')
  
  try {
    const result = await DB.prepare(`
      SELECT *
      FROM lots
      WHERE id = ? AND active = 1
    `).bind(lotId).first()
    
    if (!result) {
      return c.json({ success: false, error: 'Lot not found' }, 404)
    }
    
    return c.json({ success: true, lot: result })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch lot',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// GET /api/tombola/lots/category/:category - Lots par catégorie
tombola.get('/lots/category/:category', async (c) => {
  const { DB } = c.env
  const category = c.req.param('category')
  
  try {
    const result = await DB.prepare(`
      SELECT *
      FROM lots
      WHERE category = ? AND active = 1
      ORDER BY perceived_value DESC
    `).bind(category).all()
    
    return c.json({
      success: true,
      category,
      lots: result.results,
      count: result.results.length
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch lots by category',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ==========================================
// CAMPAIGNS - Tirages quotidiens
// ==========================================

// GET /api/tombola/campaigns - Liste des campagnes actives
tombola.get('/campaigns', async (c) => {
  const { DB } = c.env
  const organization = c.req.query('organization') // Filtrer par club
  const status = c.req.query('status') || 'active'
  
  try {
    let query = `
      SELECT 
        c.id, c.name, c.prize_type, c.prize_name,
        c.prize_value, c.entry_fee, c.target_participants,
        c.current_participants, c.start_datetime, c.draw_datetime,
        c.status, c.legal_basis,
        o.name as organization_name, o.short_name as organization_short_name,
        l.image_url as prize_image
      FROM campaigns c
      JOIN organizations o ON c.organization_id = o.id
      LEFT JOIN lot_allocations la ON c.lot_allocation_id = la.id
      LEFT JOIN lots l ON la.lot_id = l.id
      WHERE c.status = ?
    `
    
    const params: any[] = [status]
    
    if (organization) {
      query += ` AND c.organization_id = ?`
      params.push(organization)
    }
    
    query += ` ORDER BY c.draw_datetime ASC`
    
    const result = await DB.prepare(query).bind(...params).all()
    
    return c.json({
      success: true,
      campaigns: result.results,
      count: result.results.length
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch campaigns',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// GET /api/tombola/campaigns/:id - Détail d'une campagne
tombola.get('/campaigns/:id', async (c) => {
  const { DB } = c.env
  const campaignId = c.req.param('id')
  
  try {
    const campaign = await DB.prepare(`
      SELECT 
        c.*,
        o.name as organization_name,
        o.short_name as organization_short_name,
        l.name as lot_name,
        l.description as lot_description,
        l.image_url as lot_image
      FROM campaigns c
      JOIN organizations o ON c.organization_id = o.id
      LEFT JOIN lot_allocations la ON c.lot_allocation_id = la.id
      LEFT JOIN lots l ON la.lot_id = l.id
      WHERE c.id = ?
    `).bind(campaignId).first()
    
    if (!campaign) {
      return c.json({ success: false, error: 'Campaign not found' }, 404)
    }
    
    // Compter les participants
    const participants = await DB.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM participations
      WHERE campaign_id = ? AND payment_status = 'completed'
    `).bind(campaignId).first()
    
    return c.json({
      success: true,
      campaign: {
        ...campaign,
        unique_participants: participants?.count || 0
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch campaign',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// POST /api/tombola/campaigns - Créer une campagne (admin)
tombola.post('/campaigns', async (c) => {
  const { DB } = c.env
  const body = await c.req.json()
  
  const {
    organization_id,
    lot_id,
    name,
    target_participants = 100, // Valeur par défaut
    start_datetime,
    draw_datetime
  } = body
  
  try {
    // Récupérer info du lot
    const lot = await DB.prepare(`
      SELECT * FROM lots WHERE id = ?
    `).bind(lot_id).first()
    
    if (!lot) {
      return c.json({ success: false, error: 'Lot not found' }, 404)
    }
    
    // CALCUL AUTOMATIQUE du prix d'entrée avec coefficient
    const lotValue = lot.perceived_value as number
    const costToClub = lot.cost_to_club as number
    
    console.log('📊 Lot data:', { lotValue, costToClub, target_participants })
    
    const entryFee = calculateEntryFee(lotValue, target_participants)
    const minParticipants = calculateMinParticipants(costToClub, entryFee)
    
    console.log('💰 Calculs:', { entryFee, minParticipants })
    
    // Détails de calcul pour logs
    try {
      const calcDetails = getCalculationDetails(lotValue, costToClub, target_participants)
      console.log('📈 Détails:', calcDetails)
    } catch (e) {
      console.log('⚠️  Warning: Could not generate calculation details')
    }
    
    // Vérifier si allocation existe pour aujourd'hui
    let allocation = await DB.prepare(`
      SELECT * FROM lot_allocations 
      WHERE lot_id = ? AND organization_id = ? AND allocation_date = date('now')
    `).bind(lot_id, organization_id).first()
    
    let allocationId: string
    
    if (allocation) {
      // Utiliser allocation existante
      allocationId = allocation.id as string
      console.log('♻️  Allocation existante réutilisée:', allocationId)
    } else {
      // Créer nouvelle allocation
      allocationId = `alloc-${Date.now()}`
      await DB.prepare(`
        INSERT INTO lot_allocations (
          id, lot_id, organization_id, allocation_date,
          min_participants, status
        ) VALUES (?, ?, ?, date('now'), ?, 'active')
      `).bind(allocationId, lot_id, organization_id, minParticipants).run()
      console.log('✨ Nouvelle allocation créée:', allocationId)
    }
    
    // Créer campagne avec prix calculé
    const campaignId = `campaign-${Date.now()}`
    await DB.prepare(`
      INSERT INTO campaigns (
        id, organization_id, lot_allocation_id, name,
        prize_type, prize_name, prize_value, entry_fee,
        target_participants, min_participants,
        start_datetime, draw_datetime, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `).bind(
      campaignId,
      organization_id,
      allocationId,
      name,
      lot.category,
      lot.name,
      lotValue,
      entryFee, // Prix calculé automatiquement
      target_participants,
      minParticipants,
      start_datetime,
      draw_datetime
    ).run()
    
    // Calcul des détails pour réponse
    const calcDetails = getCalculationDetails(lotValue, costToClub, target_participants)
    
    return c.json({
      success: true,
      campaign_id: campaignId,
      calculation: calcDetails,
      message: `Campagne créée: ${lot.name} - Mise ${entryFee}€ pour lot ${lotValue}€`
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to create campaign',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ==========================================
// PARTICIPATIONS - Entrées utilisateurs
// ==========================================

// POST /api/tombola/participate - Participer à une campagne
tombola.post('/participate', async (c) => {
  const { DB } = c.env
  const body = await c.req.json()
  
  const {
    campaign_id,
    user_id,
    entries_count = 1,
    payment_method = 'credit_card'
  } = body
  
  try {
    // Vérifier campagne
    const campaign = await DB.prepare(`
      SELECT * FROM campaigns WHERE id = ? AND status = 'active'
    `).bind(campaign_id).first()
    
    if (!campaign) {
      return c.json({ success: false, error: 'Campaign not found or inactive' }, 404)
    }
    
    // Générer numéros de ticket
    const ticketNumbers = Array.from({ length: entries_count }, () => 
      Math.floor(Math.random() * 1000000)
    )
    
    // Créer participation
    const participationId = `part-${Date.now()}`
    const entryFeePaid = (campaign.entry_fee as number) * entries_count
    
    await DB.prepare(`
      INSERT INTO participations (
        id, campaign_id, user_id, entry_fee_paid,
        entries_count, ticket_numbers, payment_status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      participationId,
      campaign_id,
      user_id,
      entryFeePaid,
      entries_count,
      JSON.stringify(ticketNumbers)
    ).run()
    
    // Créer paiement
    const paymentId = `pay-${Date.now()}`
    await DB.prepare(`
      INSERT INTO tombola_payments (
        id, user_id, campaign_id, participation_id,
        amount, payment_method, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `).bind(
      paymentId,
      user_id,
      campaign_id,
      participationId,
      entryFeePaid,
      payment_method
    ).run()
    
    return c.json({
      success: true,
      participation_id: participationId,
      payment_id: paymentId,
      ticket_numbers: ticketNumbers,
      amount_to_pay: entryFeePaid,
      message: 'Participation registered, proceed to payment'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to register participation',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// GET /api/tombola/my-participations - Mes participations
tombola.get('/my-participations', async (c) => {
  const { DB } = c.env
  const userId = c.req.query('user_id')
  
  if (!userId) {
    return c.json({ success: false, error: 'user_id required' }, 400)
  }
  
  try {
    const result = await DB.prepare(`
      SELECT 
        p.*, c.name as campaign_name, c.prize_name, c.draw_datetime,
        o.name as organization_name
      FROM participations p
      JOIN campaigns c ON p.campaign_id = c.id
      JOIN organizations o ON c.organization_id = o.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `).bind(userId).all()
    
    return c.json({
      success: true,
      participations: result.results,
      count: result.results.length
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch participations',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ==========================================
// ORGANIZATIONS - Clubs
// ==========================================

// GET /api/tombola/organizations - Liste des clubs
tombola.get('/organizations', async (c) => {
  const { DB } = c.env
  const type = c.req.query('type') || 'professional_club'
  const country = c.req.query('country')
  
  try {
    let query = `SELECT * FROM organizations WHERE type = ? AND status = 'active'`
    const params: any[] = [type]
    
    if (country) {
      query += ` AND country = ?`
      params.push(country)
    }
    
    query += ` ORDER BY tier ASC, name ASC`
    
    const result = await DB.prepare(query).bind(...params).all()
    
    return c.json({
      success: true,
      organizations: result.results,
      count: result.results.length
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch organizations',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// GET /api/tombola/stats - Statistiques globales
tombola.get('/stats', async (c) => {
  const { DB } = c.env
  
  try {
    const activeCampaigns = await DB.prepare(`
      SELECT COUNT(*) as count FROM campaigns WHERE status = 'active'
    `).first()
    
    const totalLots = await DB.prepare(`
      SELECT COUNT(*) as count FROM lots WHERE active = 1
    `).first()
    
    const totalOrganizations = await DB.prepare(`
      SELECT COUNT(*) as count FROM organizations WHERE status = 'active'
    `).first()
    
    const totalParticipations = await DB.prepare(`
      SELECT COUNT(*) as count FROM participations WHERE payment_status = 'completed'
    `).first()
    
    return c.json({
      success: true,
      stats: {
        active_campaigns: activeCampaigns?.count || 0,
        total_lots: totalLots?.count || 0,
        active_organizations: totalOrganizations?.count || 0,
        total_participations: totalParticipations?.count || 0
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch stats',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default tombola
