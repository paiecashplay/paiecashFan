import { Hono } from 'hono'
import type { Context } from 'hono'
import { requireAuth, CloudflareEnv } from './auth'

type AppContext = Context<{ Bindings: CloudflareEnv }>

const vendorStreams = new Hono<{ Bindings: CloudflareEnv }>()

// Génération d'UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Créer un Live Input sur Cloudflare Stream
async function createCloudflareStreamLiveInput(
  c: AppContext,
  name: string,
  metadata: any = {}
): Promise<any> {
  const accountId = c.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = c.env.CLOUDFLARE_API_TOKEN
  
  if (!accountId || !apiToken) {
    throw new Error('Cloudflare Stream non configuré')
  }
  
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs`
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      meta: {
        name,
        ...metadata
      },
      recording: {
        mode: 'automatic', // Enregistrement automatique
        timeoutSeconds: 0, // Pas de timeout
        requireSignedURLs: false
      }
    })
  })
  
  const data = await response.json()
  
  if (!response.ok) {
    console.error('Erreur Cloudflare Stream:', data)
    throw new Error(data.errors?.[0]?.message || 'Erreur création Live Input')
  }
  
  return data.result
}

// POST /api/vendor/stream/start - Démarrer un nouveau stream vendeur
vendorStreams.post('/start', requireAuth, async (c) => {
  const userId = (c as any).userId
  const { title, description, clubId, clubName, category } = await c.req.json()
  
  if (!title || !clubId || !clubName) {
    return c.json({ error: 'Titre, club ID et nom du club requis' }, 400)
  }
  
  const db = c.env.DB
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    // Récupérer les infos du vendeur
    const vendor = await db.prepare(
      'SELECT id, username, display_name FROM users WHERE id = ?'
    ).bind(userId).first()
    
    if (!vendor) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404)
    }
    
    // Créer un Live Input sur Cloudflare Stream
    const liveInputName = `${clubName} - ${title} - ${vendor.display_name}`
    const liveInput = await createCloudflareStreamLiveInput(c, liveInputName, {
      vendor_id: userId,
      vendor_username: vendor.username,
      club_id: clubId,
      club_name: clubName,
      category: category || 'shopping'
    })
    
    const streamId = generateUUID()
    const cloudflareStreamUid = liveInput.uid
    const rtmpsUrl = liveInput.rtmps.url
    const streamKey = liveInput.rtmps.streamKey
    const playbackUrl = `https://customer-${c.env.CLOUDFLARE_ACCOUNT_ID}.cloudflarestream.com/${cloudflareStreamUid}/iframe`
    
    // Insérer dans la base de données
    await db.prepare(`
      INSERT INTO vendor_streams (
        id, vendor_id, vendor_username, vendor_display_name,
        club_id, club_name, title, description, category,
        cloudflare_stream_uid, cloudflare_rtmps_url, cloudflare_stream_key, cloudflare_playback_url,
        status, started_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'starting', datetime('now'))
    `).bind(
      streamId,
      userId,
      vendor.username,
      vendor.display_name,
      clubId,
      clubName,
      title,
      description || null,
      category || 'shopping',
      cloudflareStreamUid,
      rtmpsUrl,
      streamKey,
      playbackUrl
    ).run()
    
    return c.json({
      success: true,
      stream: {
        id: streamId,
        cloudflareStreamUid,
        title,
        clubName,
        category,
        status: 'starting',
        // Configuration pour le vendeur (OBS, Larix, etc.)
        rtmpsConfig: {
          url: rtmpsUrl,
          streamKey,
          fullUrl: `${rtmpsUrl}${streamKey}`
        },
        // URLs pour les spectateurs
        playbackUrl,
        embedCode: `<iframe src="${playbackUrl}" style="border: none; position: absolute; top: 0; height: 100%; width: 100%;" allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;" allowfullscreen="true"></iframe>`
      },
      instructions: {
        mobile: 'Utilisez Larix Broadcaster (iOS/Android) ou StreamLabs Mobile',
        desktop: 'Utilisez OBS Studio avec les paramètres RTMPS ci-dessus',
        steps: [
          '1. Copier l\'URL RTMPS et la Stream Key',
          '2. Configurer votre app de streaming',
          '3. Démarrer la diffusion',
          '4. Votre stream apparaîtra automatiquement sur PaieCashFan'
        ]
      }
    })
    
  } catch (error: any) {
    console.error('Erreur démarrage stream vendeur:', error)
    return c.json({ 
      error: 'Erreur lors du démarrage du stream', 
      details: error.message 
    }, 500)
  }
})

// GET /api/vendor/stream/mine - Mes streams (vendeur)
vendorStreams.get('/mine', requireAuth, async (c) => {
  const userId = (c as any).userId
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    const streams = await db.prepare(`
      SELECT * FROM vendor_streams 
      WHERE vendor_id = ? 
      ORDER BY started_at DESC 
      LIMIT 50
    `).bind(userId).all()
    
    return c.json({
      success: true,
      streams: streams.results || [],
      count: streams.results?.length || 0
    })
    
  } catch (error: any) {
    console.error('Erreur récupération streams vendeur:', error)
    return c.json({ 
      error: 'Erreur lors de la récupération des streams', 
      details: error.message 
    }, 500)
  }
})

// GET /api/vendor/stream/:streamId - Détails d'un stream
vendorStreams.get('/:streamId', async (c) => {
  const streamId = c.req.param('streamId')
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    const stream = await db.prepare(
      'SELECT * FROM vendor_streams WHERE id = ?'
    ).bind(streamId).first()
    
    if (!stream) {
      return c.json({ error: 'Stream non trouvé' }, 404)
    }
    
    return c.json({
      success: true,
      stream
    })
    
  } catch (error: any) {
    console.error('Erreur récupération stream:', error)
    return c.json({ 
      error: 'Erreur lors de la récupération du stream', 
      details: error.message 
    }, 500)
  }
})

// POST /api/vendor/stream/:streamId/end - Terminer un stream
vendorStreams.post('/:streamId/end', requireAuth, async (c) => {
  const streamId = c.req.param('streamId')
  const userId = (c as any).userId
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    // Vérifier que le vendeur est le propriétaire
    const stream = await db.prepare(
      'SELECT * FROM vendor_streams WHERE id = ? AND vendor_id = ?'
    ).bind(streamId, userId).first()
    
    if (!stream) {
      return c.json({ error: 'Stream non trouvé ou vous n\'êtes pas le propriétaire' }, 403)
    }
    
    // Calculer la durée
    const startedAt = new Date(stream.started_at as string)
    const endedAt = new Date()
    const durationSeconds = Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)
    
    // Mettre à jour le statut
    await db.prepare(`
      UPDATE vendor_streams 
      SET status = 'ended', ended_at = datetime('now'), duration_seconds = ?
      WHERE id = ?
    `).bind(durationSeconds, streamId).run()
    
    return c.json({ 
      success: true, 
      message: 'Stream terminé',
      duration: durationSeconds
    })
    
  } catch (error: any) {
    console.error('Erreur fin du stream:', error)
    return c.json({ 
      error: 'Erreur lors de la fin du stream', 
      details: error.message 
    }, 500)
  }
})

// GET /api/vendor/streams/live - Tous les streams live (marketplace)
vendorStreams.get('/live', async (c) => {
  const db = c.env.DB
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    const clubId = c.req.query('club')
    const category = c.req.query('category')
    const featured = c.req.query('featured') === 'true'
    const limit = parseInt(c.req.query('limit') || '50')
    
    let query = `
      SELECT * FROM vendor_streams 
      WHERE status = 'live' AND is_public = 1
    `
    const params: any[] = []
    
    if (clubId && clubId !== 'all') {
      query += ' AND club_id = ?'
      params.push(clubId)
    }
    
    if (category && category !== 'all') {
      query += ' AND category = ?'
      params.push(category)
    }
    
    if (featured) {
      query += ' AND is_featured = 1'
    }
    
    query += ' ORDER BY viewers_count DESC, started_at DESC LIMIT ?'
    params.push(limit)
    
    const stmt = params.length > 0 
      ? db.prepare(query).bind(...params)
      : db.prepare(query)
    
    const result = await stmt.all()
    
    return c.json({
      success: true,
      streams: result.results || [],
      count: result.results?.length || 0,
      totalViewers: (result.results || []).reduce((sum: number, s: any) => sum + (s.viewers_count || 0), 0)
    })
    
  } catch (error: any) {
    console.error('Erreur récupération streams live:', error)
    return c.json({ 
      error: 'Erreur lors de la récupération des streams live', 
      details: error.message 
    }, 500)
  }
})

// POST /api/vendor/stream/:streamId/update-viewers - Webhook Cloudflare (mise à jour viewers)
vendorStreams.post('/:streamId/update-viewers', async (c) => {
  const streamId = c.req.param('streamId')
  const { viewers, status } = await c.req.json()
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    // Mettre à jour le nombre de viewers et le peak
    await db.prepare(`
      UPDATE vendor_streams 
      SET viewers_count = ?,
          peak_viewers = MAX(peak_viewers, ?),
          total_views = total_views + 1,
          status = ?
      WHERE id = ?
    `).bind(viewers || 0, viewers || 0, status || 'live', streamId).run()
    
    return c.json({ success: true })
    
  } catch (error: any) {
    console.error('Erreur mise à jour viewers:', error)
    return c.json({ 
      error: 'Erreur lors de la mise à jour des viewers', 
      details: error.message 
    }, 500)
  }
})

export default vendorStreams
