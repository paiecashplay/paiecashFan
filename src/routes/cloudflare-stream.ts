import { Hono } from 'hono'
import type { Context } from 'hono'

const cloudflareStream = new Hono()

// Types
interface CloudflareStreamInput {
  uid: string
  rtmps: {
    url: string
    streamKey: string
  }
  rtmpsPlayback: {
    url: string
    streamKey: string
  }
  srt: {
    url: string
    streamId: string
    passphrase: string
  }
  webRTC: {
    url: string
  }
  meta: {
    name: string
  }
  created: string
  modified: string
  status?: string
  recording?: {
    mode: 'automatic' | 'off'
    timeoutSeconds?: number
    requireSignedURLs?: boolean
  }
}

interface CloudflareVideo {
  uid: string
  thumbnail: string
  thumbnailTimestampPct: number
  readyToStream: boolean
  status: {
    state: string
    pctComplete: string
    errorReasonCode?: string
    errorReasonText?: string
  }
  meta: {
    name: string
    [key: string]: any
  }
  created: string
  modified: string
  size: number
  preview: string
  duration: number
  input: {
    width: number
    height: number
  }
  playback: {
    hls: string
    dash: string
  }
  watermark?: {
    uid: string
  }
}

interface CreateStreamRequest {
  name: string
  club?: string
  category?: string
  price?: number
  recordingMode?: 'automatic' | 'off'
}

interface UploadVideoRequest {
  url?: string
  file?: File
  name: string
  club?: string
  category?: string
  price?: number
  requireSignedURLs?: boolean
}

/**
 * POST /api/cloudflare-stream/live/create
 * Create a new live stream input
 */
cloudflareStream.post('/live/create', async (c: Context) => {
  try {
    const body: CreateStreamRequest = await c.req.json()
    const { name, club, category, price, recordingMode } = body
    
    if (!name) {
      return c.json({
        success: false,
        error: 'Missing required field: name'
      }, 400)
    }
    
    // Get Cloudflare credentials from environment
    const accountId = c.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = c.env.CLOUDFLARE_API_TOKEN
    
    if (!accountId || !apiToken) {
      return c.json({
        success: false,
        error: 'Cloudflare credentials not configured. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN'
      }, 500)
    }
    
    // Create live stream input via Cloudflare Stream API
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          meta: {
            name,
            club: club || 'Unknown',
            category: category || 'general',
            price: price || 0
          },
          recording: {
            mode: recordingMode || 'automatic',
            timeoutSeconds: 0,
            requireSignedURLs: false
          }
        })
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return c.json({
        success: false,
        error: 'Failed to create live stream',
        details: data
      }, response.status)
    }
    
    return c.json({
      success: true,
      data: data.result,
      message: 'Live stream created successfully'
    }, 201)
  } catch (error) {
    return c.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * GET /api/cloudflare-stream/live/:id
 * Get live stream input details
 */
cloudflareStream.get('/live/:id', async (c: Context) => {
  try {
    const id = c.req.param('id')
    const accountId = c.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = c.env.CLOUDFLARE_API_TOKEN
    
    if (!accountId || !apiToken) {
      return c.json({
        success: false,
        error: 'Cloudflare credentials not configured'
      }, 500)
    }
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return c.json({
        success: false,
        error: 'Failed to fetch live stream',
        details: data
      }, response.status)
    }
    
    return c.json({
      success: true,
      data: data.result
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

/**
 * GET /api/cloudflare-stream/live
 * List all live stream inputs
 */
cloudflareStream.get('/live', async (c: Context) => {
  try {
    const accountId = c.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = c.env.CLOUDFLARE_API_TOKEN
    
    if (!accountId || !apiToken) {
      return c.json({
        success: false,
        error: 'Cloudflare credentials not configured'
      }, 500)
    }
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return c.json({
        success: false,
        error: 'Failed to fetch live streams',
        details: data
      }, response.status)
    }
    
    return c.json({
      success: true,
      data: data.result,
      count: data.result?.length || 0
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

/**
 * DELETE /api/cloudflare-stream/live/:id
 * Delete a live stream input
 */
cloudflareStream.delete('/live/:id', async (c: Context) => {
  try {
    const id = c.req.param('id')
    const accountId = c.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = c.env.CLOUDFLARE_API_TOKEN
    
    if (!accountId || !apiToken) {
      return c.json({
        success: false,
        error: 'Cloudflare credentials not configured'
      }, 500)
    }
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/live_inputs/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return c.json({
        success: false,
        error: 'Failed to delete live stream',
        details: data
      }, response.status)
    }
    
    return c.json({
      success: true,
      message: 'Live stream deleted successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

/**
 * POST /api/cloudflare-stream/videos/upload
 * Upload a video file or via URL (for VOD)
 */
cloudflareStream.post('/videos/upload', async (c: Context) => {
  try {
    const body: UploadVideoRequest = await c.req.json()
    const { url, name, club, category, price, requireSignedURLs } = body
    
    if (!url && !name) {
      return c.json({
        success: false,
        error: 'Missing required fields: url or file, and name'
      }, 400)
    }
    
    const accountId = c.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = c.env.CLOUDFLARE_API_TOKEN
    
    if (!accountId || !apiToken) {
      return c.json({
        success: false,
        error: 'Cloudflare credentials not configured'
      }, 500)
    }
    
    // Upload via URL (tus protocol)
    if (url) {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/copy`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url,
            meta: {
              name,
              club: club || 'Unknown',
              category: category || 'vod',
              price: price || 0
            },
            requireSignedURLs: requireSignedURLs || false
          })
        }
      )
      
      const data = await response.json()
      
      if (!response.ok) {
        return c.json({
          success: false,
          error: 'Failed to upload video',
          details: data
        }, response.status)
      }
      
      return c.json({
        success: true,
        data: data.result,
        message: 'Video upload initiated'
      }, 201)
    }
    
    return c.json({
      success: false,
      error: 'File upload not yet implemented. Please use URL upload.'
    }, 400)
  } catch (error) {
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

/**
 * GET /api/cloudflare-stream/videos
 * List all videos (VOD)
 */
cloudflareStream.get('/videos', async (c: Context) => {
  try {
    const accountId = c.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = c.env.CLOUDFLARE_API_TOKEN
    
    if (!accountId || !apiToken) {
      return c.json({
        success: false,
        error: 'Cloudflare credentials not configured'
      }, 500)
    }
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return c.json({
        success: false,
        error: 'Failed to fetch videos',
        details: data
      }, response.status)
    }
    
    return c.json({
      success: true,
      data: data.result,
      count: data.result?.length || 0
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

/**
 * GET /api/cloudflare-stream/videos/:id
 * Get video details
 */
cloudflareStream.get('/videos/:id', async (c: Context) => {
  try {
    const id = c.req.param('id')
    const accountId = c.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = c.env.CLOUDFLARE_API_TOKEN
    
    if (!accountId || !apiToken) {
      return c.json({
        success: false,
        error: 'Cloudflare credentials not configured'
      }, 500)
    }
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${id}`,
      {
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return c.json({
        success: false,
        error: 'Failed to fetch video',
        details: data
      }, response.status)
    }
    
    return c.json({
      success: true,
      data: data.result
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

/**
 * DELETE /api/cloudflare-stream/videos/:id
 * Delete a video
 */
cloudflareStream.delete('/videos/:id', async (c: Context) => {
  try {
    const id = c.req.param('id')
    const accountId = c.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = c.env.CLOUDFLARE_API_TOKEN
    
    if (!accountId || !apiToken) {
      return c.json({
        success: false,
        error: 'Cloudflare credentials not configured'
      }, 500)
    }
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${apiToken}`
        }
      }
    )
    
    if (!response.ok) {
      const data = await response.json()
      return c.json({
        success: false,
        error: 'Failed to delete video',
        details: data
      }, response.status)
    }
    
    return c.json({
      success: true,
      message: 'Video deleted successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

/**
 * GET /api/cloudflare-stream/embed/:id
 * Get embed code for a video or live stream
 */
cloudflareStream.get('/embed/:id', async (c: Context) => {
  try {
    const id = c.req.param('id')
    const accountId = c.env.CLOUDFLARE_ACCOUNT_ID
    
    if (!accountId) {
      return c.json({
        success: false,
        error: 'Cloudflare account ID not configured'
      }, 500)
    }
    
    // Generate embed URLs
    const embedUrl = `https://customer-${accountId}.cloudflarestream.com/${id}/iframe`
    const hlsUrl = `https://customer-${accountId}.cloudflarestream.com/${id}/manifest/video.m3u8`
    const dashUrl = `https://customer-${accountId}.cloudflarestream.com/${id}/manifest/video.mpd`
    
    const embedCode = `<iframe
  src="${embedUrl}"
  style="border: none; position: absolute; top: 0; left: 0; height: 100%; width: 100%;"
  allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
  allowfullscreen="true"
></iframe>`
    
    return c.json({
      success: true,
      data: {
        videoId: id,
        embedUrl,
        hlsUrl,
        dashUrl,
        embedCode
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

/**
 * POST /api/cloudflare-stream/videos/:id/watermark
 * Add watermark to video
 */
cloudflareStream.post('/videos/:id/watermark', async (c: Context) => {
  try {
    const id = c.req.param('id')
    const { watermarkUid } = await c.req.json()
    
    const accountId = c.env.CLOUDFLARE_ACCOUNT_ID
    const apiToken = c.env.CLOUDFLARE_API_TOKEN
    
    if (!accountId || !apiToken) {
      return c.json({
        success: false,
        error: 'Cloudflare credentials not configured'
      }, 500)
    }
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${id}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          watermark: {
            uid: watermarkUid
          }
        })
      }
    )
    
    const data = await response.json()
    
    if (!response.ok) {
      return c.json({
        success: false,
        error: 'Failed to add watermark',
        details: data
      }, response.status)
    }
    
    return c.json({
      success: true,
      data: data.result,
      message: 'Watermark added successfully'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Internal server error'
    }, 500)
  }
})

export default cloudflareStream
