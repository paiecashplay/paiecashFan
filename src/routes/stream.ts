import { Hono } from 'hono'

const stream = new Hono()

// Type definitions
interface CloudflareEnv {
  CLOUDFLARE_ACCOUNT_ID?: string
  CLOUDFLARE_API_TOKEN?: string
  STREAM_ENABLED?: string
}

// Helper function to call Cloudflare Stream API
async function callStreamAPI(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  accountId?: string,
  apiToken?: string
) {
  const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`
  
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${apiToken}`,
    'Content-Type': 'application/json'
  }
  
  const options: RequestInit = {
    method,
    headers
  }
  
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body)
  }
  
  const response = await fetch(`${baseUrl}${endpoint}`, options)
  const data = await response.json()
  
  return {
    success: response.ok,
    status: response.status,
    data
  }
}

// ==========================================
// CLOUDFLARE STREAM LIVE ENDPOINTS
// ==========================================

// Create a new live stream input
stream.post('/live/create', async (c) => {
  const env = c.env as CloudflareEnv
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = env
  
  // For development: return mock data if credentials not configured
  if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_API_TOKEN || 
      CLOUDFLARE_ACCOUNT_ID === 'your_account_id_here') {
    return c.json({
      success: true,
      mock: true,
      message: 'Using mock data. Configure CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in .dev.vars',
      liveInput: {
        uid: `mock_live_${Date.now()}`,
        rtmps: {
          url: 'rtmps://live.cloudflare.com:443/live/',
          streamKey: 'mock_stream_key_12345'
        },
        rtmpsPlayback: {
          url: 'https://customer-subdomain.cloudflare.com/mock_live_123/manifest/video.m3u8',
          streamKey: 'mock_playback_key'
        },
        webRTC: {
          url: 'https://customer-subdomain.cloudflare.com/mock_live_123/webrtc/play'
        },
        created: new Date().toISOString(),
        status: 'ready'
      }
    })
  }
  
  const { title, description, club, category } = await c.req.json()
  
  const result = await callStreamAPI(
    '/live_inputs',
    'POST',
    {
      meta: {
        name: title || 'Live Stream',
        title: title || 'Live Stream',
        description: description || '',
        club: club || '',
        category: category || 'matches'
      },
      recording: {
        mode: 'automatic',
        timeoutSeconds: 10
      }
    },
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN
  )
  
  if (!result.success) {
    return c.json({
      success: false,
      error: 'Failed to create live input',
      details: result.data
    }, result.status)
  }
  
  return c.json({
    success: true,
    liveInput: result.data.result
  })
})

// Get live stream status
stream.get('/live/:liveInputId', async (c) => {
  const env = c.env as CloudflareEnv
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = env
  const liveInputId = c.req.param('liveInputId')
  
  // Mock data for development
  if (!CLOUDFLARE_ACCOUNT_ID || CLOUDFLARE_ACCOUNT_ID === 'your_account_id_here' || 
      liveInputId.startsWith('mock_')) {
    return c.json({
      success: true,
      mock: true,
      liveInput: {
        uid: liveInputId,
        status: 'live',
        rtmps: {
          url: 'rtmps://live.cloudflare.com:443/live/',
          streamKey: 'mock_stream_key_12345'
        },
        webRTC: {
          url: `https://customer-subdomain.cloudflare.com/${liveInputId}/webrtc/play`
        },
        meta: {
          name: 'Live Stream Test',
          title: 'PSG vs Marseille - Le Classico',
          club: 'Paris SG',
          category: 'matches'
        },
        recording: {
          mode: 'automatic',
          requireSignedURLs: false
        },
        created: new Date().toISOString()
      }
    })
  }
  
  const result = await callStreamAPI(
    `/live_inputs/${liveInputId}`,
    'GET',
    undefined,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN
  )
  
  if (!result.success) {
    return c.json({
      success: false,
      error: 'Failed to get live input',
      details: result.data
    }, result.status)
  }
  
  return c.json({
    success: true,
    liveInput: result.data.result
  })
})

// List all live inputs
stream.get('/live', async (c) => {
  const env = c.env as CloudflareEnv
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = env
  
  // Mock data for development
  if (!CLOUDFLARE_ACCOUNT_ID || CLOUDFLARE_ACCOUNT_ID === 'your_account_id_here') {
    const mockLiveStreams = [
      {
        uid: 'mock_live_001',
        status: 'live',
        meta: {
          name: 'PSG vs Marseille - Le Classico',
          club: 'Paris SG',
          category: 'matches',
          viewers: 12847
        },
        webRTC: {
          url: 'https://customer-subdomain.cloudflare.com/mock_live_001/webrtc/play'
        },
        created: new Date(Date.now() - 3600000).toISOString()
      },
      {
        uid: 'mock_live_002',
        status: 'live',
        meta: {
          name: 'Tirage LOTO en Direct - Super Cagnotte 50K',
          club: 'Tous les clubs',
          category: 'loto',
          viewers: 5621
        },
        webRTC: {
          url: 'https://customer-subdomain.cloudflare.com/mock_live_002/webrtc/play'
        },
        created: new Date(Date.now() - 1800000).toISOString()
      },
      {
        uid: 'mock_live_003',
        status: 'live',
        meta: {
          name: 'Live Shopping - Maillots Signes Collection Exclusive',
          club: 'Boutique Officielle',
          category: 'shopping',
          viewers: 3204
        },
        webRTC: {
          url: 'https://customer-subdomain.cloudflare.com/mock_live_003/webrtc/play'
        },
        created: new Date(Date.now() - 900000).toISOString()
      }
    ]
    
    return c.json({
      success: true,
      mock: true,
      message: 'Using mock data. Configure credentials in .dev.vars',
      liveInputs: mockLiveStreams,
      total: mockLiveStreams.length
    })
  }
  
  const result = await callStreamAPI(
    '/live_inputs',
    'GET',
    undefined,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN
  )
  
  if (!result.success) {
    return c.json({
      success: false,
      error: 'Failed to list live inputs',
      details: result.data
    }, result.status)
  }
  
  return c.json({
    success: true,
    liveInputs: result.data.result,
    total: result.data.result?.length || 0
  })
})

// Delete a live input
stream.delete('/live/:liveInputId', async (c) => {
  const env = c.env as CloudflareEnv
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = env
  const liveInputId = c.req.param('liveInputId')
  
  // Mock data for development
  if (!CLOUDFLARE_ACCOUNT_ID || CLOUDFLARE_ACCOUNT_ID === 'your_account_id_here' || 
      liveInputId.startsWith('mock_')) {
    return c.json({
      success: true,
      mock: true,
      message: 'Mock live input deleted',
      liveInputId
    })
  }
  
  const result = await callStreamAPI(
    `/live_inputs/${liveInputId}`,
    'DELETE',
    undefined,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN
  )
  
  if (!result.success) {
    return c.json({
      success: false,
      error: 'Failed to delete live input',
      details: result.data
    }, result.status)
  }
  
  return c.json({
    success: true,
    message: 'Live input deleted successfully'
  })
})

// ==========================================
// CLOUDFLARE STREAM VOD ENDPOINTS
// ==========================================

// Upload video via URL
stream.post('/videos/upload-url', async (c) => {
  const env = c.env as CloudflareEnv
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = env
  const { url, title, description, club, category } = await c.req.json()
  
  // Mock data for development
  if (!CLOUDFLARE_ACCOUNT_ID || CLOUDFLARE_ACCOUNT_ID === 'your_account_id_here') {
    return c.json({
      success: true,
      mock: true,
      message: 'Using mock data. Configure credentials in .dev.vars',
      video: {
        uid: `mock_video_${Date.now()}`,
        playback: {
          hls: `https://customer-subdomain.cloudflarestream.com/mock_video_123/manifest/video.m3u8`,
          dash: `https://customer-subdomain.cloudflarestream.com/mock_video_123/manifest/video.mpd`
        },
        thumbnail: `https://customer-subdomain.cloudflarestream.com/mock_video_123/thumbnails/thumbnail.jpg`,
        preview: `https://customer-subdomain.cloudflarestream.com/mock_video_123/watch`,
        meta: { title, description, club, category },
        status: { state: 'ready' },
        created: new Date().toISOString()
      }
    })
  }
  
  const result = await callStreamAPI(
    '/copy',
    'POST',
    {
      url,
      meta: { name: title, title, description, club, category },
      requireSignedURLs: false
    },
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN
  )
  
  if (!result.success) {
    return c.json({
      success: false,
      error: 'Failed to upload video',
      details: result.data
    }, result.status)
  }
  
  return c.json({
    success: true,
    video: result.data.result
  })
})

// Get video details
stream.get('/videos/:videoId', async (c) => {
  const env = c.env as CloudflareEnv
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = env
  const videoId = c.req.param('videoId')
  
  // Mock data for development
  if (!CLOUDFLARE_ACCOUNT_ID || CLOUDFLARE_ACCOUNT_ID === 'your_account_id_here' || 
      videoId.startsWith('mock_')) {
    return c.json({
      success: true,
      mock: true,
      video: {
        uid: videoId,
        playback: {
          hls: `https://customer-subdomain.cloudflarestream.com/${videoId}/manifest/video.m3u8`,
          dash: `https://customer-subdomain.cloudflarestream.com/${videoId}/manifest/video.mpd`
        },
        thumbnail: `https://customer-subdomain.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg`,
        preview: `https://customer-subdomain.cloudflarestream.com/${videoId}/watch`,
        iframe: `https://customer-subdomain.cloudflarestream.com/${videoId}/iframe`,
        meta: {
          name: 'Video Test',
          title: 'Match Highlights PSG vs OM',
          club: 'Paris SG',
          category: 'highlights'
        },
        status: { state: 'ready' },
        duration: 180,
        created: new Date().toISOString()
      }
    })
  }
  
  const result = await callStreamAPI(
    `/${videoId}`,
    'GET',
    undefined,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN
  )
  
  if (!result.success) {
    return c.json({
      success: false,
      error: 'Failed to get video',
      details: result.data
    }, result.status)
  }
  
  return c.json({
    success: true,
    video: result.data.result
  })
})

// List all videos
stream.get('/videos', async (c) => {
  const env = c.env as CloudflareEnv
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = env
  
  // Mock data for development
  if (!CLOUDFLARE_ACCOUNT_ID || CLOUDFLARE_ACCOUNT_ID === 'your_account_id_here') {
    const mockVideos = [
      {
        uid: 'mock_video_001',
        playback: {
          hls: 'https://customer-subdomain.cloudflarestream.com/mock_video_001/manifest/video.m3u8'
        },
        thumbnail: 'https://customer-subdomain.cloudflarestream.com/mock_video_001/thumbnails/thumbnail.jpg',
        iframe: 'https://customer-subdomain.cloudflarestream.com/mock_video_001/iframe',
        meta: {
          name: 'PSG vs OM - Highlights',
          club: 'Paris SG',
          category: 'highlights'
        },
        status: { state: 'ready' },
        duration: 180,
        created: new Date(Date.now() - 86400000).toISOString()
      },
      {
        uid: 'mock_video_002',
        playback: {
          hls: 'https://customer-subdomain.cloudflarestream.com/mock_video_002/manifest/video.m3u8'
        },
        thumbnail: 'https://customer-subdomain.cloudflarestream.com/mock_video_002/thumbnails/thumbnail.jpg',
        iframe: 'https://customer-subdomain.cloudflarestream.com/mock_video_002/iframe',
        meta: {
          name: 'Live Shopping Replay - Maillots',
          club: 'Boutique Officielle',
          category: 'shopping'
        },
        status: { state: 'ready' },
        duration: 3600,
        created: new Date(Date.now() - 172800000).toISOString()
      }
    ]
    
    return c.json({
      success: true,
      mock: true,
      message: 'Using mock data. Configure credentials in .dev.vars',
      videos: mockVideos,
      total: mockVideos.length
    })
  }
  
  const result = await callStreamAPI(
    '',
    'GET',
    undefined,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN
  )
  
  if (!result.success) {
    return c.json({
      success: false,
      error: 'Failed to list videos',
      details: result.data
    }, result.status)
  }
  
  return c.json({
    success: true,
    videos: result.data.result,
    total: result.data.result?.length || 0
  })
})

// Delete a video
stream.delete('/videos/:videoId', async (c) => {
  const env = c.env as CloudflareEnv
  const { CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_API_TOKEN } = env
  const videoId = c.req.param('videoId')
  
  // Mock data for development
  if (!CLOUDFLARE_ACCOUNT_ID || CLOUDFLARE_ACCOUNT_ID === 'your_account_id_here' || 
      videoId.startsWith('mock_')) {
    return c.json({
      success: true,
      mock: true,
      message: 'Mock video deleted',
      videoId
    })
  }
  
  const result = await callStreamAPI(
    `/${videoId}`,
    'DELETE',
    undefined,
    CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN
  )
  
  if (!result.success) {
    return c.json({
      success: false,
      error: 'Failed to delete video',
      details: result.data
    }, result.status)
  }
  
  return c.json({
    success: true,
    message: 'Video deleted successfully'
  })
})

// ==========================================
// INTEGRATION WITH EXISTING STREAMS
// ==========================================

// Get all streams (combines live and VOD for PaieCashFan)
stream.get('/all', async (c) => {
  const env = c.env as CloudflareEnv
  const { CLOUDFLARE_ACCOUNT_ID } = env
  const category = c.req.query('category')
  const club = c.req.query('club')
  const live = c.req.query('live') === 'true'
  
  // For now, use mock data - in production this would combine live and VOD
  const allStreams = [
    {
      id: 'mock_live_001',
      type: 'live',
      title: 'PSG vs Olympique Marseille - Le Classico',
      description: 'Match en direct depuis le Parc des Princes',
      thumbnail: 'https://picsum.photos/800/450?random=1',
      club: 'Paris SG',
      category: 'matches',
      status: 'live',
      viewers: 12847,
      price: 0,
      startTime: new Date(Date.now() - 3600000).toISOString(),
      streamUrl: 'https://customer-subdomain.cloudflarestream.com/mock_live_001/iframe',
      creator: {
        name: 'Paris SG Official',
        avatar: 'https://i.pravatar.cc/150?img=70',
        verified: true
      }
    },
    {
      id: 'mock_live_002',
      type: 'live',
      title: 'Tirage LOTO en Direct - Super Cagnotte 50K',
      description: 'Tirage en direct du LOTO PaieCashFan avec cagnotte de 50 000 EUR',
      thumbnail: 'https://picsum.photos/800/450?random=2',
      club: 'Tous les clubs',
      category: 'loto',
      status: 'live',
      viewers: 5621,
      price: 0,
      startTime: new Date(Date.now() - 1800000).toISOString(),
      streamUrl: 'https://customer-subdomain.cloudflarestream.com/mock_live_002/iframe',
      creator: {
        name: 'PaieCashFan Official',
        avatar: 'https://i.pravatar.cc/150?img=50',
        verified: true
      }
    },
    {
      id: 'mock_live_003',
      type: 'live',
      title: 'Live Shopping - Maillots Signes Collection Exclusive',
      description: 'Vente en direct de maillots signes et produits exclusifs',
      thumbnail: 'https://picsum.photos/800/450?random=3',
      club: 'Boutique Officielle',
      category: 'shopping',
      status: 'live',
      viewers: 3204,
      price: 0,
      startTime: new Date(Date.now() - 900000).toISOString(),
      streamUrl: 'https://customer-subdomain.cloudflarestream.com/mock_live_003/iframe',
      creator: {
        name: 'FootStore by PCC',
        avatar: 'https://i.pravatar.cc/150?img=30',
        verified: true
      }
    },
    {
      id: 'mock_video_001',
      type: 'vod',
      title: 'Olympique Lyonnais vs AS Monaco - Resume',
      description: 'Resume complet du match avec les meilleurs moments',
      thumbnail: 'https://picsum.photos/800/450?random=4',
      club: 'Olympique Lyonnais',
      category: 'highlights',
      status: 'ready',
      viewers: 0,
      price: 2.99,
      duration: 180,
      startTime: new Date(Date.now() - 86400000).toISOString(),
      streamUrl: 'https://customer-subdomain.cloudflarestream.com/mock_video_001/iframe',
      creator: {
        name: 'Ligue 1 Official',
        avatar: 'https://i.pravatar.cc/150?img=60',
        verified: true
      }
    },
    {
      id: 'mock_live_004',
      type: 'live',
      title: 'Conference de Presse - Nouveau Coach AS Monaco',
      description: 'Conference de presse en direct avec le nouvel entraineur',
      thumbnail: 'https://picsum.photos/800/450?random=5',
      club: 'AS Monaco',
      category: 'news',
      status: 'upcoming',
      viewers: 0,
      price: 0,
      startTime: new Date(Date.now() + 7200000).toISOString(),
      streamUrl: 'https://customer-subdomain.cloudflarestream.com/mock_live_004/iframe',
      creator: {
        name: 'AS Monaco Official',
        avatar: 'https://i.pravatar.cc/150?img=71',
        verified: true
      }
    }
  ]
  
  // Filter by category
  let filtered = category 
    ? allStreams.filter(s => s.category === category)
    : allStreams
  
  // Filter by club
  if (club) {
    filtered = filtered.filter(s => s.club === club)
  }
  
  // Filter by live status
  if (live) {
    filtered = filtered.filter(s => s.status === 'live')
  }
  
  return c.json({
    success: true,
    mock: !CLOUDFLARE_ACCOUNT_ID || CLOUDFLARE_ACCOUNT_ID === 'your_account_id_here',
    streams: filtered,
    total: filtered.length,
    stats: {
      live: filtered.filter(s => s.status === 'live').length,
      upcoming: filtered.filter(s => s.status === 'upcoming').length,
      vod: filtered.filter(s => s.type === 'vod').length,
      totalViewers: filtered.reduce((sum, s) => sum + (s.viewers || 0), 0)
    }
  })
})

export default stream
