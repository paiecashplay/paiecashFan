const express = require('express');
const router = express.Router();
const chatDb = require('../db/chat');
const multer = require('multer');
const path = require('path');
const supabase = require('../db/supabase');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB for avatars
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (types.test(ext) || types.test(file.mimetype)) return cb(null, true);
    cb(new Error('Only images are allowed'));
  },
});

const getConversationId = (uid1, uid2) => [uid1, uid2].sort().join('_');

router.post('/profile', async (req, res) => {
  try {
    let { username, avatarUrl } = req.body;
    
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ success: false, error: 'Username is required' });
    }

    // Sanitize and format username
    username = username.replace(/[^a-zA-Z0-9_ ]/g, '').trim().substring(0, 20);
    if (username.length < 3) {
      username = username + '_user';
    }

    const { data, error } = await chatDb.upsertChatProfile(req.user.id, username, avatarUrl);
    
    if (error) {
      return res.status(500).json({ success: false, error });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const fileName = `avatars/${req.user.id}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('post-images') // Using existing bucket for simplicity, or create 'avatars'
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage.from('post-images').getPublicUrl(fileName);

    // Update the profile with the new avatar URL
    // We fetch existing profile first to preserve username
    const { data: profile } = await supabase.from('chat_profiles').select('username').eq('user_id', req.user.id).single();
    const username = profile?.username || req.user.name || 'User';

    const { data, error } = await chatDb.upsertChatProfile(req.user.id, username, publicUrl);
    if (error) throw error;

    res.status(200).json({ success: true, avatarUrl: publicUrl });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/users', async (req, res) => {
  try {
    const { q, limit } = req.query;
    const parsedLimit = limit ? parseInt(limit, 10) : 20;

    let data, error;
    
    if (!q || typeof q !== 'string' || q.length < 2) {
      // Return suggested users if no query is provided
      const result = await chatDb.getSuggestedUsers(req.user.id, parsedLimit);
      data = result.data;
      error = result.error;
    } else {
      const result = await chatDb.searchUsers(q, req.user.id, parsedLimit);
      data = result.data;
      error = result.error;
    }
    
    if (error) {
      return res.status(500).json({ success: false, error });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/friends', async (req, res) => {
  try {
    const { data, error } = await chatDb.getFriends(req.user.id);
    
    if (error) {
      return res.status(500).json({ success: false, error });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/requests/pending', async (req, res) => {
  try {
    const { data, error } = await chatDb.getPendingRequests(req.user.id);
    
    if (error) {
      return res.status(500).json({ success: false, error });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/requests', async (req, res) => {
  try {
    const { receiverId } = req.body;
    
    if (!receiverId) {
      return res.status(400).json({ success: false, error: 'receiverId is required' });
    }
    
    if (receiverId === req.user.id) {
      return res.status(400).json({ success: false, error: 'Cannot send friend request to yourself' });
    }

    const { data, error } = await chatDb.sendFriendRequest(req.user.id, receiverId);
    
    if (error) {
      return res.status(400).json({ success: false, error });
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.patch('/requests/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;
    
    if (status !== 'accepted' && status !== 'declined') {
      return res.status(400).json({ success: false, error: 'Status must be either accepted or declined' });
    }

    const { data, error } = await chatDb.updateRequestStatus(requestId, status, req.user.id);
    
    if (error) {
      return res.status(400).json({ success: false, error });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/messages', async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({ success: false, error: 'receiverId and content are required' });
    }

    const trimmedContent = content.trim();
    if (trimmedContent.length === 0 || trimmedContent.length > 2000) {
      return res.status(400).json({ success: false, error: 'Content length must be between 1 and 2000 characters' });
    }

    const conversationId = getConversationId(req.user.id, receiverId);
    const { data, error } = await chatDb.sendMessage(conversationId, req.user.id, receiverId, trimmedContent);
    
    if (error) {
      return res.status(400).json({ success: false, error });
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/messages/:friendId', async (req, res) => {
  try {
    const { friendId } = req.params;
    const { limit, offset } = req.query;
    
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const parsedOffset = offset ? parseInt(offset, 10) : 0;
    const conversationId = getConversationId(req.user.id, friendId);
    
    const { data, error } = await chatDb.getMessages(conversationId, req.user.id, parsedLimit, parsedOffset);
    
    if (error) {
      return res.status(400).json({ success: false, error });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.patch('/messages/read/:friendId', async (req, res) => {
  try {
    const { friendId } = req.params;
    const conversationId = getConversationId(req.user.id, friendId);
    
    const { error } = await chatDb.markMessagesRead(conversationId, req.user.id);
    
    if (error) {
      return res.status(400).json({ success: false, error });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/unread-count', async (req, res) => {
  try {
    const { data, error } = await chatDb.getTotalUnreadCount(req.user.id);
    
    if (error) {
      return res.status(500).json({ success: false, error });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.patch('/online-status', async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isOnline must be a boolean' });
    }

    const { error } = await chatDb.setOnlineStatus(req.user.id, isOnline);
    
    if (error) {
      return res.status(500).json({ success: false, error });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.post('/online-status-beacon', async (req, res) => {
  try {
    const { isOnline } = req.body;
    
    if (typeof isOnline !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isOnline must be a boolean' });
    }

    const { error } = await chatDb.setOnlineStatus(req.user.id, isOnline);
    
    if (error) {
      return res.status(500).json({ success: false, error });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
