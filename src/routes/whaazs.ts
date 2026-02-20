import { Hono } from 'hono'
import type { Context } from 'hono'

const whaazs = new Hono()

// Types
interface WhaazStream {
  id: string
  title: string
  creator: string
  club: string
  category: 'matches' | 'creators' | 'shopping'
  isLive: boolean
  viewers: number
  price: number
  thumbnail?: string
  startTime: string
}

interface CreateStreamRequest {
  title: string
  club: string
  category: string
  price: number
  description?: string
}

// Mock Whaazs API responses (replace with real API calls)
const mockStreams: WhaazStream[] = [
  {
    id: '1',
    title: 'PSG vs Olympique Marseille - Le Classico',
    creator: 'Paris SG Official',
    club: 'Paris SG',
    category: 'matches',
    isLive: true,
    viewers: 12847,
    price: 0,
    startTime: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Tirage LOTO en Direct - Super Cagnotte 50K€',
    creator: 'PaieCashFan Official',
    club: 'Tous les clubs',
    category: 'matches',
    isLive: true,
    viewers: 5621,
    price: 0,
    startTime: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Live Shopping - Maillots Signés Collection Exclusive',
    creator: 'FootStore by PCC',
    club: 'Boutique Officielle',
    category: 'shopping',
    isLive: true,
    viewers: 3204,
    price: 0,
    startTime: new Date().toISOString()
  }
]

/**
 * GET /api/whaazs/streams
 * Get all streams or filter by category/club
 */
whaazs.get('/streams', async (c: Context) => {
  try {
    const category = c.req.query('category')
    const club = c.req.query('club')
    const isLive = c.req.query('live')
    
    let filtered = mockStreams
    
    if (category) {
      filtered = filtered.filter(s => s.category === category)
    }
    
    if (club) {
      filtered = filtered.filter(s => s.club === club)
    }
    
    if (isLive === 'true') {
      filtered = filtered.filter(s => s.isLive)
    }
    
    // In production, replace with real Whaazs API call:
    // const response = await fetch('https://api.whaazs.com/v1/streams', {
    //   headers: {
    //     'Authorization': `Bearer ${c.env.WHAAZS_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   }
    // })
    // const data = await response.json()
    
    return c.json({
      success: true,
      data: filtered,
      count: filtered.length,
      totalViewers: filtered.reduce((sum, s) => sum + s.viewers, 0)
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch streams'
    }, 500)
  }
})

/**
 * GET /api/whaazs/streams/:id
 * Get a specific stream by ID
 */
whaazs.get('/streams/:id', async (c: Context) => {
  try {
    const id = c.req.param('id')
    const stream = mockStreams.find(s => s.id === id)
    
    if (!stream) {
      return c.json({
        success: false,
        error: 'Stream not found'
      }, 404)
    }
    
    // In production, replace with real Whaazs API call:
    // const response = await fetch(`https://api.whaazs.com/v1/streams/${id}`, {
    //   headers: {
    //     'Authorization': `Bearer ${c.env.WHAAZS_API_KEY}`
    //   }
    // })
    
    return c.json({
      success: true,
      data: stream
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch stream'
    }, 500)
  }
})

/**
 * POST /api/whaazs/streams
 * Create a new stream
 */
whaazs.post('/streams', async (c: Context) => {
  try {
    const body: CreateStreamRequest = await c.req.json()
    
    // Validate required fields
    if (!body.title || !body.club || !body.category) {
      return c.json({
        success: false,
        error: 'Missing required fields: title, club, category'
      }, 400)
    }
    
    // In production, call Whaazs API to create stream:
    // const response = await fetch('https://api.whaazs.com/v1/streams', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${c.env.WHAAZS_API_KEY}`,
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({
    //     title: body.title,
    //     club: body.club,
    //     category: body.category,
    //     price: body.price || 0,
    //     description: body.description || ''
    //   })
    // })
    // const data = await response.json()
    
    // Mock response
    const newStream: WhaazStream = {
      id: String(Date.now()),
      title: body.title,
      creator: 'Current User',
      club: body.club,
      category: body.category as any,
      isLive: false,
      viewers: 0,
      price: body.price || 0,
      startTime: new Date().toISOString()
    }
    
    mockStreams.push(newStream)
    
    return c.json({
      success: true,
      data: newStream,
      message: 'Stream created successfully'
    }, 201)
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to create stream'
    }, 500)
  }
})

/**
 * POST /api/whaazs/streams/:id/start
 * Start a stream (go live)
 */
whaazs.post('/streams/:id/start', async (c: Context) => {
  try {
    const id = c.req.param('id')
    const stream = mockStreams.find(s => s.id === id)
    
    if (!stream) {
      return c.json({
        success: false,
        error: 'Stream not found'
      }, 404)
    }
    
    // In production, call Whaazs API:
    // const response = await fetch(`https://api.whaazs.com/v1/streams/${id}/start`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${c.env.WHAAZS_API_KEY}`
    //   }
    // })
    
    stream.isLive = true
    
    return c.json({
      success: true,
      data: stream,
      message: 'Stream started successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to start stream'
    }, 500)
  }
})

/**
 * POST /api/whaazs/streams/:id/stop
 * Stop a stream (end live)
 */
whaazs.post('/streams/:id/stop', async (c: Context) => {
  try {
    const id = c.req.param('id')
    const stream = mockStreams.find(s => s.id === id)
    
    if (!stream) {
      return c.json({
        success: false,
        error: 'Stream not found'
      }, 404)
    }
    
    // In production, call Whaazs API:
    // const response = await fetch(`https://api.whaazs.com/v1/streams/${id}/stop`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${c.env.WHAAZS_API_KEY}`
    //   }
    // })
    
    stream.isLive = false
    
    return c.json({
      success: true,
      data: stream,
      message: 'Stream stopped successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to stop stream'
    }, 500)
  }
})

/**
 * GET /api/whaazs/streams/:id/viewers
 * Get current viewer count for a stream
 */
whaazs.get('/streams/:id/viewers', async (c: Context) => {
  try {
    const id = c.req.param('id')
    const stream = mockStreams.find(s => s.id === id)
    
    if (!stream) {
      return c.json({
        success: false,
        error: 'Stream not found'
      }, 404)
    }
    
    return c.json({
      success: true,
      data: {
        streamId: id,
        viewers: stream.viewers,
        isLive: stream.isLive
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch viewer count'
    }, 500)
  }
})

/**
 * POST /api/whaazs/streams/:id/purchase
 * Purchase access to a paid stream with USDC/USDT
 */
whaazs.post('/streams/:id/purchase', async (c: Context) => {
  try {
    const id = c.req.param('id')
    const { walletAddress, amount, currency } = await c.req.json()
    
    const stream = mockStreams.find(s => s.id === id)
    
    if (!stream) {
      return c.json({
        success: false,
        error: 'Stream not found'
      }, 404)
    }
    
    if (stream.price === 0) {
      return c.json({
        success: false,
        error: 'This stream is free'
      }, 400)
    }
    
    // In production:
    // 1. Verify crypto payment via smart contract
    // 2. Call Whaazs API to grant access
    // 3. Return stream access token
    
    return c.json({
      success: true,
      data: {
        streamId: id,
        accessToken: 'mock_access_token_' + Date.now(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        message: 'Purchase successful'
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to process purchase'
    }, 500)
  }
})

/**
 * GET /api/whaazs/categories
 * Get available stream categories with counts
 */
whaazs.get('/categories', async (c: Context) => {
  try {
    const categories = [
      {
        id: 'matches',
        name: 'Matchs',
        icon: 'fa-futbol',
        count: mockStreams.filter(s => s.category === 'matches').length,
        liveCount: mockStreams.filter(s => s.category === 'matches' && s.isLive).length
      },
      {
        id: 'creators',
        name: 'Créateurs',
        icon: 'fa-user-friends',
        count: mockStreams.filter(s => s.category === 'creators').length,
        liveCount: mockStreams.filter(s => s.category === 'creators' && s.isLive).length
      },
      {
        id: 'shopping',
        name: 'Live Shopping',
        icon: 'fa-shopping-bag',
        count: mockStreams.filter(s => s.category === 'shopping').length,
        liveCount: mockStreams.filter(s => s.category === 'shopping' && s.isLive).length
      }
    ]
    
    return c.json({
      success: true,
      data: categories
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to fetch categories'
    }, 500)
  }
})

export default whaazs
