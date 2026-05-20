// ═══════════════════════════════════════════════════════════════
// routes/posts.js - Social Posts REST API
// All routes protected by authMiddleware (applied in server.js)
// ═══════════════════════════════════════════════════════════════

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const supabase = require('../db/supabase');
const postsDb = require('../db/posts');

// ─── Multer config (memory storage for Supabase upload) ───────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB for videos
  fileFilter: (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png|gif|webp/;
    const videoTypes = /mp4|webm|mov|avi|quicktime|x-msvideo/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const isImage = imageTypes.test(ext) || imageTypes.test(file.mimetype);
    const isVideo = videoTypes.test(ext) || videoTypes.test(file.mimetype);
    if (isImage || isVideo) return cb(null, true);
    cb(new Error('Only image (jpg, png, gif, webp) and video (mp4, webm, mov) files are allowed'));
  },
});

// ─── Helper: upload media to Supabase Storage ─────────────────
async function uploadMedia(file, userId) {
  const ext = path.extname(file.originalname).toLowerCase();
  const fileName = `${userId}/${Date.now()}${ext}`;

  const { error } = await supabase.storage
    .from('post-images')
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw new Error('Media upload failed: ' + error.message);

  const { data: urlData } = supabase.storage
    .from('post-images')
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

// ─── CREATE POST ──────────────────────────────────────────────
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, data: null, error: 'Content is required' });
    }
    if (content.length > 2000) {
      return res.status(400).json({ success: false, data: null, error: 'Content must be 2000 characters or less' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadMedia(req.file, req.user.id);
    }

    const { data, error } = await postsDb.createPost(req.user.id, content.trim(), imageUrl);
    if (error) return res.status(400).json({ success: false, data: null, error });
    res.status(201).json({ success: true, data, error: '' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: error.message || 'Internal server error' });
  }
});

// ─── GET FEED ─────────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const { data, error } = await postsDb.getFeedPosts(limit, offset, req.user.id);
    if (error) return res.status(500).json({ success: false, data: null, error });
    res.status(200).json({ success: true, data, error: '' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

// ─── GET SINGLE POST ──────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const { data, error } = await postsDb.getPostById(req.params.id, req.user.id);
    if (error) return res.status(404).json({ success: false, data: null, error });
    res.status(200).json({ success: true, data, error: '' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

// ─── UPDATE POST ──────────────────────────────────────────────
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const { content, removeImage } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, data: null, error: 'Content is required' });
    }
    if (content.length > 2000) {
      return res.status(400).json({ success: false, data: null, error: 'Content must be 2000 characters or less' });
    }

    let imageUrl = undefined; // undefined = don't change
    if (req.file) {
      imageUrl = await uploadMedia(req.file, req.user.id);
    } else if (removeImage === 'true' || removeImage === true) {
      imageUrl = null;
    }

    const { data, error } = await postsDb.updatePost(req.params.id, req.user.id, content.trim(), imageUrl);
    if (error) return res.status(400).json({ success: false, data: null, error });
    res.status(200).json({ success: true, data, error: '' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: error.message || 'Internal server error' });
  }
});

// ─── DELETE POST ──────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { data, error } = await postsDb.deletePost(req.params.id, req.user.id);
    if (error) return res.status(400).json({ success: false, data: null, error });
    res.status(200).json({ success: true, data, error: '' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

// ─── TOGGLE LIKE ──────────────────────────────────────────────
router.post('/:id/like', async (req, res) => {
  try {
    const { data, error } = await postsDb.toggleLike(req.params.id, req.user.id);
    if (error) return res.status(400).json({ success: false, data: null, error });
    res.status(200).json({ success: true, data, error: '' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

// ─── GET LIKES ────────────────────────────────────────────────
router.get('/:id/likes', async (req, res) => {
  try {
    const { data, error } = await postsDb.getPostLikes(req.params.id);
    if (error) return res.status(500).json({ success: false, data: null, error });
    res.status(200).json({ success: true, data, error: '' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

// ─── ADD COMMENT ──────────────────────────────────────────────
router.post('/:id/comments', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, data: null, error: 'Content is required' });
    }
    if (content.length > 1000) {
      return res.status(400).json({ success: false, data: null, error: 'Comment must be 1000 characters or less' });
    }
    const { data, error } = await postsDb.addComment(req.params.id, req.user.id, content.trim());
    if (error) return res.status(400).json({ success: false, data: null, error });
    res.status(201).json({ success: true, data, error: '' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

// ─── GET COMMENTS ─────────────────────────────────────────────
router.get('/:id/comments', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const { data, error } = await postsDb.getComments(req.params.id, limit, offset);
    if (error) return res.status(500).json({ success: false, data: null, error });
    res.status(200).json({ success: true, data, error: '' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

// ─── UPDATE COMMENT ───────────────────────────────────────────
router.put('/comments/:commentId', async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, data: null, error: 'Content is required' });
    }
    const { data, error } = await postsDb.updateComment(req.params.commentId, req.user.id, content.trim());
    if (error) return res.status(400).json({ success: false, data: null, error });
    res.status(200).json({ success: true, data, error: '' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

// ─── DELETE COMMENT ───────────────────────────────────────────
router.delete('/comments/:commentId', async (req, res) => {
  try {
    const { data, error } = await postsDb.deleteComment(req.params.commentId, req.user.id);
    if (error) return res.status(400).json({ success: false, data: null, error });
    res.status(200).json({ success: true, data, error: '' });
  } catch (error) {
    res.status(500).json({ success: false, data: null, error: 'Internal server error' });
  }
});

module.exports = router;
