import { Hono } from 'hono'
import type { Context } from 'hono'
import { requireAuth, CloudflareEnv } from './auth'

type AppContext = Context<{ Bindings: CloudflareEnv }>

const costreaming = new Hono<{ Bindings: CloudflareEnv }>()

// Génération d'UUID v4 simple
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Appel API Cloudflare Calls
async function callCloudflareCallsAPI(
  c: AppContext,
  endpoint: string,
  method: string = 'GET',
  body?: any
): Promise<any> {
  const accountId = c.env.CLOUDFLARE_ACCOUNT_ID
  const apiToken = c.env.CLOUDFLARE_API_TOKEN
  
  if (!accountId || !apiToken) {
    throw new Error('Cloudflare Calls non configuré (ACCOUNT_ID ou API_TOKEN manquant)')
  }
  
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/calls${endpoint}`
  
  const options: RequestInit = {
    method,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json'
    }
  }
  
  if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    options.body = JSON.stringify(body)
  }
  
  const response = await fetch(url, options)
  const data = await response.json()
  
  if (!response.ok) {
    console.error('Erreur API Cloudflare Calls:', data)
    throw new Error(data.errors?.[0]?.message || 'Erreur API Cloudflare Calls')
  }
  
  return data.result
}

// POST /api/costreaming/start - Démarrer un nouveau stream
costreaming.post('/start', requireAuth, async (c) => {
  const userId = (c as any).userId
  const { title, description, category, maxParticipants, isPublic } = await c.req.json()
  
  if (!title) {
    return c.json({ error: 'Titre requis' }, 400)
  }
  
  const db = c.env.DB
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    // Créer une nouvelle room Cloudflare Calls
    const roomData = await callCloudflareCallsAPI(c, '/apps', 'POST', {
      name: `PaieCashFan - ${title}`,
      uid: generateUUID()
    })
    
    const streamId = generateUUID()
    const cloudflareRoomId = roomData.uid || roomData.id
    
    // Créer le stream dans la base de données
    await db.prepare(`
      INSERT INTO active_streams (
        id, host_user_id, cloudflare_room_id, title, description,
        category, is_public, max_participants, current_participants,
        status, started_at, recording_enabled
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'active', datetime('now'), 1)
    `).bind(
      streamId,
      userId,
      cloudflareRoomId,
      title,
      description || null,
      category || 'general',
      isPublic !== false ? 1 : 0,
      maxParticipants || 10
    ).run()
    
    // Ajouter l'host comme premier participant
    const participantId = generateUUID()
    await db.prepare(`
      INSERT INTO stream_participants (
        id, stream_id, user_id, role, joined_at, is_active
      ) VALUES (?, ?, ?, 'host', datetime('now'), 1)
    `).bind(participantId, streamId, userId).run()
    
    // Générer un token pour rejoindre la room
    const sessionToken = await callCloudflareCallsAPI(
      c, 
      `/apps/${cloudflareRoomId}/sessions`, 
      'POST',
      { uid: userId }
    )
    
    return c.json({
      success: true,
      stream: {
        id: streamId,
        roomId: cloudflareRoomId,
        title,
        description,
        category: category || 'general',
        isPublic: isPublic !== false,
        maxParticipants: maxParticipants || 10,
        currentParticipants: 1,
        status: 'active',
        sessionToken: sessionToken.sessionToken,
        iceServers: sessionToken.iceServers || []
      }
    })
    
  } catch (error: any) {
    console.error('Erreur lors du démarrage du stream:', error)
    return c.json({ 
      error: 'Erreur lors du démarrage du stream', 
      details: error.message 
    }, 500)
  }
})

// GET /api/costreaming/active - Liste des streams actifs
costreaming.get('/active', async (c) => {
  const db = c.env.DB
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    const category = c.req.query('category')
    const isPublic = c.req.query('public') !== 'false'
    
    let query = `
      SELECT 
        s.*,
        u.username as host_username,
        u.display_name as host_display_name,
        u.avatar_url as host_avatar_url,
        (SELECT COUNT(*) FROM stream_participants WHERE stream_id = s.id AND is_active = 1) as participant_count
      FROM active_streams s
      JOIN users u ON s.host_user_id = u.id
      WHERE s.status = 'active'
    `
    
    const params: any[] = []
    
    if (isPublic) {
      query += ' AND s.is_public = 1'
    }
    
    if (category && category !== 'all') {
      query += ' AND s.category = ?'
      params.push(category)
    }
    
    query += ' ORDER BY s.started_at DESC'
    
    const stmt = params.length > 0 
      ? db.prepare(query).bind(...params)
      : db.prepare(query)
    
    const result = await stmt.all()
    
    return c.json({
      success: true,
      streams: result.results || [],
      count: result.results?.length || 0
    })
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération des streams:', error)
    return c.json({ 
      error: 'Erreur lors de la récupération des streams', 
      details: error.message 
    }, 500)
  }
})

// GET /api/costreaming/:streamId - Détails d'un stream
costreaming.get('/:streamId', async (c) => {
  const streamId = c.req.param('streamId')
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    const stream = await db.prepare(`
      SELECT 
        s.*,
        u.username as host_username,
        u.display_name as host_display_name,
        u.avatar_url as host_avatar_url
      FROM active_streams s
      JOIN users u ON s.host_user_id = u.id
      WHERE s.id = ?
    `).bind(streamId).first()
    
    if (!stream) {
      return c.json({ error: 'Stream non trouvé' }, 404)
    }
    
    // Récupérer les participants actifs
    const participants = await db.prepare(`
      SELECT 
        p.*,
        u.username,
        u.display_name,
        u.avatar_url
      FROM stream_participants p
      JOIN users u ON p.user_id = u.id
      WHERE p.stream_id = ? AND p.is_active = 1
      ORDER BY p.joined_at ASC
    `).bind(streamId).all()
    
    return c.json({
      success: true,
      stream: {
        ...stream,
        participants: participants.results || []
      }
    })
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération du stream:', error)
    return c.json({ 
      error: 'Erreur lors de la récupération du stream', 
      details: error.message 
    }, 500)
  }
})

// POST /api/costreaming/:streamId/join - Rejoindre un stream
costreaming.post('/:streamId/join', requireAuth, async (c) => {
  const streamId = c.req.param('streamId')
  const userId = c.get('userId')
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    // Vérifier que le stream existe et est actif
    const stream = await db.prepare(
      'SELECT * FROM active_streams WHERE id = ? AND status = \'active\''
    ).bind(streamId).first()
    
    if (!stream) {
      return c.json({ error: 'Stream non trouvé ou terminé' }, 404)
    }
    
    // Vérifier le nombre de participants
    const participantCount = await db.prepare(
      'SELECT COUNT(*) as count FROM stream_participants WHERE stream_id = ? AND is_active = 1'
    ).bind(streamId).first()
    
    if (participantCount && participantCount.count >= stream.max_participants) {
      return c.json({ error: 'Le stream a atteint le nombre maximum de participants' }, 403)
    }
    
    // Vérifier si l'utilisateur n'est pas déjà dans le stream
    const existingParticipant = await db.prepare(
      'SELECT * FROM stream_participants WHERE stream_id = ? AND user_id = ? AND is_active = 1'
    ).bind(streamId, userId).first()
    
    if (existingParticipant) {
      return c.json({ error: 'Vous êtes déjà dans ce stream' }, 409)
    }
    
    // Générer un token de session Cloudflare Calls
    const sessionToken = await callCloudflareCallsAPI(
      c,
      `/apps/${stream.cloudflare_room_id}/sessions`,
      'POST',
      { uid: userId }
    )
    
    // Ajouter le participant
    const participantId = generateUUID()
    await db.prepare(`
      INSERT INTO stream_participants (
        id, stream_id, user_id, role, joined_at, is_active
      ) VALUES (?, ?, ?, 'participant', datetime('now'), 1)
    `).bind(participantId, streamId, userId).run()
    
    // Mettre à jour le compteur de participants
    await db.prepare(
      'UPDATE active_streams SET current_participants = current_participants + 1 WHERE id = ?'
    ).bind(streamId).run()
    
    return c.json({
      success: true,
      sessionToken: sessionToken.sessionToken,
      iceServers: sessionToken.iceServers || [],
      stream: {
        id: streamId,
        roomId: stream.cloudflare_room_id,
        title: stream.title
      }
    })
    
  } catch (error: any) {
    console.error('Erreur lors de la connexion au stream:', error)
    return c.json({ 
      error: 'Erreur lors de la connexion au stream', 
      details: error.message 
    }, 500)
  }
})

// POST /api/costreaming/:streamId/leave - Quitter un stream
costreaming.post('/:streamId/leave', requireAuth, async (c) => {
  const streamId = c.req.param('streamId')
  const userId = (c as any).userId
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    // Marquer le participant comme inactif
    await db.prepare(`
      UPDATE stream_participants 
      SET is_active = 0, left_at = datetime('now')
      WHERE stream_id = ? AND user_id = ? AND is_active = 1
    `).bind(streamId, userId).run()
    
    // Mettre à jour le compteur
    await db.prepare(
      'UPDATE active_streams SET current_participants = current_participants - 1 WHERE id = ?'
    ).bind(streamId).run()
    
    return c.json({ success: true, message: 'Vous avez quitté le stream' })
    
  } catch (error: any) {
    console.error('Erreur lors de la sortie du stream:', error)
    return c.json({ 
      error: 'Erreur lors de la sortie du stream', 
      details: error.message 
    }, 500)
  }
})

// POST /api/costreaming/:streamId/end - Terminer un stream (host uniquement)
costreaming.post('/:streamId/end', requireAuth, async (c) => {
  const streamId = c.req.param('streamId')
  const userId = c.get('userId')
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    // Vérifier que l'utilisateur est le host
    const stream = await db.prepare(
      'SELECT * FROM active_streams WHERE id = ? AND host_user_id = ?'
    ).bind(streamId, userId).first()
    
    if (!stream) {
      return c.json({ error: 'Stream non trouvé ou vous n\'êtes pas l\'hôte' }, 403)
    }
    
    // Terminer le stream
    await db.prepare(`
      UPDATE active_streams 
      SET status = 'ended', ended_at = datetime('now')
      WHERE id = ?
    `).bind(streamId).run()
    
    // Marquer tous les participants comme inactifs
    await db.prepare(`
      UPDATE stream_participants 
      SET is_active = 0, left_at = datetime('now')
      WHERE stream_id = ? AND is_active = 1
    `).bind(streamId).run()
    
    return c.json({ success: true, message: 'Stream terminé' })
    
  } catch (error: any) {
    console.error('Erreur lors de la fin du stream:', error)
    return c.json({ 
      error: 'Erreur lors de la fin du stream', 
      details: error.message 
    }, 500)
  }
})

export default costreaming
