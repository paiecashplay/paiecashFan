import { Hono } from 'hono'
import { sign, verify } from 'hono/jwt'
import type { Context } from 'hono'

export interface CloudflareEnv {
  DB?: D1Database
  CLOUDFLARE_ACCOUNT_ID?: string
  CLOUDFLARE_API_TOKEN?: string
  JWT_SECRET?: string
}

type AppContext = Context<{ Bindings: CloudflareEnv }>

const auth = new Hono<{ Bindings: CloudflareEnv }>()

// Génération d'UUID v4 simple
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

// Hash simple de mot de passe (en production, utiliser bcrypt/scrypt)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password + 'salt_paiecashfan_2026')
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Vérification du mot de passe
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const computedHash = await hashPassword(password)
  return computedHash === hash
}

// Middleware d'authentification JWT
export async function requireAuth(c: AppContext, next: Function) {
  const authHeader = c.req.header('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Token manquant' }, 401)
  }
  
  const token = authHeader.substring(7)
  const jwtSecret = c.env.JWT_SECRET || 'paiecashfan_secret_2026_change_me'
  
  try {
    const payload = await verify(token, jwtSecret) as any
    // Stocker les infos user directement dans env pour y accéder partout
    ;(c as any).userId = payload.userId
    ;(c as any).userEmail = payload.email
    await next()
  } catch (error) {
    return c.json({ error: 'Token invalide ou expiré' }, 401)
  }
}

// POST /api/auth/register - Inscription
auth.post('/register', async (c) => {
  const { email, password, username, displayName } = await c.req.json()
  
  // Validation basique
  if (!email || !password || !username) {
    return c.json({ error: 'Email, mot de passe et nom d\'utilisateur requis' }, 400)
  }
  
  if (password.length < 6) {
    return c.json({ error: 'Le mot de passe doit contenir au moins 6 caractères' }, 400)
  }
  
  const db = c.env.DB
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    // Vérifier si l'email ou le username existe déjà
    const existingUser = await db.prepare(
      'SELECT id FROM users WHERE email = ? OR username = ?'
    ).bind(email, username).first()
    
    if (existingUser) {
      return c.json({ error: 'Email ou nom d\'utilisateur déjà utilisé' }, 409)
    }
    
    // Créer le nouvel utilisateur
    const userId = generateUUID()
    const passwordHash = await hashPassword(password)
    const finalDisplayName = displayName || username
    
    await db.prepare(`
      INSERT INTO users (id, email, password_hash, username, display_name, created_at, last_login)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(userId, email, passwordHash, username, finalDisplayName).run()
    
    // Générer le JWT
    const jwtSecret = c.env.JWT_SECRET || 'paiecashfan_secret_2026_change_me'
    const token = await sign({
      userId,
      email,
      username,
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 jours
    }, jwtSecret)
    
    return c.json({
      success: true,
      token,
      user: {
        id: userId,
        email,
        username,
        displayName: finalDisplayName
      }
    })
    
  } catch (error: any) {
    console.error('Erreur lors de l\'inscription:', error)
    return c.json({ error: 'Erreur lors de l\'inscription', details: error.message }, 500)
  }
})

// POST /api/auth/login - Connexion
auth.post('/login', async (c) => {
  const { email, password } = await c.req.json()
  
  if (!email || !password) {
    return c.json({ error: 'Email et mot de passe requis' }, 400)
  }
  
  const db = c.env.DB
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    // Récupérer l'utilisateur
    const user = await db.prepare(
      'SELECT id, email, username, display_name, password_hash, is_active FROM users WHERE email = ?'
    ).bind(email).first()
    
    if (!user) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401)
    }
    
    if (!user.is_active) {
      return c.json({ error: 'Compte désactivé' }, 403)
    }
    
    // Vérifier le mot de passe
    const passwordValid = await verifyPassword(password, user.password_hash as string)
    
    if (!passwordValid) {
      return c.json({ error: 'Email ou mot de passe incorrect' }, 401)
    }
    
    // Mettre à jour last_login
    await db.prepare(
      'UPDATE users SET last_login = datetime(\'now\') WHERE id = ?'
    ).bind(user.id).run()
    
    // Générer le JWT
    const jwtSecret = c.env.JWT_SECRET || 'paiecashfan_secret_2026_change_me'
    const token = await sign({
      userId: user.id,
      email: user.email,
      username: user.username,
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 jours
    }, jwtSecret)
    
    return c.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.display_name
      }
    })
    
  } catch (error: any) {
    console.error('Erreur lors de la connexion:', error)
    return c.json({ error: 'Erreur lors de la connexion', details: error.message }, 500)
  }
})

// GET /api/auth/me - Profil utilisateur
auth.get('/me', requireAuth, async (c) => {
  const userId = (c as any).userId
  const db = c.env.DB
  
  if (!db) {
    return c.json({ error: 'Base de données non disponible' }, 500)
  }
  
  try {
    const user = await db.prepare(
      'SELECT id, email, username, display_name, avatar_url, created_at, last_login FROM users WHERE id = ?'
    ).bind(userId).first()
    
    if (!user) {
      return c.json({ error: 'Utilisateur non trouvé' }, 404)
    }
    
    return c.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at,
        lastLogin: user.last_login
      }
    })
    
  } catch (error: any) {
    console.error('Erreur lors de la récupération du profil:', error)
    return c.json({ error: 'Erreur lors de la récupération du profil', details: error.message }, 500)
  }
})

export default auth
