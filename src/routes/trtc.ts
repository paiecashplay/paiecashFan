import { Hono } from 'hono'
import { createHmac } from 'crypto'

type Bindings = {
  TRTC_SDK_APP_ID: string
  TRTC_SECRET_KEY: string
}

const app = new Hono<{ Bindings: Bindings }>()

/**
 * Generate TRTC UserSig for authentication
 * @param sdkAppId - Tencent TRTC SDK App ID
 * @param userId - User identifier
 * @param secretKey - Secret key from Tencent Cloud
 * @param expire - Expiration time in seconds (default: 86400 = 24h)
 */
function genUserSig(sdkAppId: string, userId: string, secretKey: string, expire: number = 86400): string {
  const current = Math.floor(Date.now() / 1000)
  
  const sigDoc = {
    'TLS.ver': '2.0',
    'TLS.identifier': userId,
    'TLS.sdkappid': parseInt(sdkAppId),
    'TLS.expire': expire,
    'TLS.time': current
  }

  const sig = JSON.stringify(sigDoc)
  const zippedSig = Buffer.from(sig, 'utf8')
  
  const hmac = createHmac('sha256', secretKey)
  hmac.update(zippedSig)
  const hash = hmac.digest()

  const signature = Buffer.concat([hash, zippedSig]).toString('base64')
  
  return signature
    .replace(/\+/g, '*')
    .replace(/\//g, '-')
    .replace(/=/g, '_')
}

/**
 * POST /api/trtc/usersig
 * Generate UserSig for a user to join TRTC room
 * Body: { userId: string, roomId?: string }
 */
app.post('/usersig', async (c) => {
  try {
    const { userId, roomId } = await c.req.json()

    if (!userId) {
      return c.json({ error: 'userId requis' }, 400)
    }

    const sdkAppId = c.env.TRTC_SDK_APP_ID
    const secretKey = c.env.TRTC_SECRET_KEY

    if (!sdkAppId || !secretKey) {
      return c.json({ error: 'Credentials TRTC non configurés' }, 500)
    }

    // Generate UserSig (valid for 24 hours)
    const userSig = genUserSig(sdkAppId, userId, secretKey, 86400)

    return c.json({
      success: true,
      sdkAppId: parseInt(sdkAppId),
      userId,
      userSig,
      roomId: roomId || `room_${Date.now()}`,
      expire: 86400
    })
  } catch (error: any) {
    console.error('Error generating UserSig:', error)
    return c.json({ error: error.message || 'Erreur serveur' }, 500)
  }
})

/**
 * POST /api/trtc/join-room
 * Generate credentials for joining a specific club room
 * Body: { club: string, userId?: string }
 */
app.post('/join-room', async (c) => {
  try {
    const { club, userId: providedUserId } = await c.req.json()

    if (!club) {
      return c.json({ error: 'club requis' }, 400)
    }

    // Generate userId if not provided: club_randomID
    const userId = providedUserId || `${club.toLowerCase()}_${Math.random().toString(36).substring(2, 8)}`
    
    // Room ID based on club name
    const roomId = `${club.toLowerCase()}_live`

    const sdkAppId = c.env.TRTC_SDK_APP_ID
    const secretKey = c.env.TRTC_SECRET_KEY

    if (!sdkAppId || !secretKey) {
      return c.json({ error: 'Credentials TRTC non configurés' }, 500)
    }

    // Generate UserSig
    const userSig = genUserSig(sdkAppId, userId, secretKey, 86400)

    return c.json({
      success: true,
      sdkAppId: parseInt(sdkAppId),
      userId,
      userSig,
      roomId,
      club,
      expire: 86400
    })
  } catch (error: any) {
    console.error('Error joining room:', error)
    return c.json({ error: error.message || 'Erreur serveur' }, 500)
  }
})

export default app
