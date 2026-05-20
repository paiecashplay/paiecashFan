const express = require('express');
const router = express.Router();
const clubChannelsDb = require('../db/clubChannels');

// Get messages for a club channel
router.get('/:clubId/messages', async (req, res) => {
  try {
    const { clubId } = req.params;
    const { limit } = req.query;
    
    const parsedLimit = limit ? parseInt(limit, 10) : 100;
    
    const { data, error } = await clubChannelsDb.getClubMessages(clubId, parsedLimit);
    
    if (error) {
      return res.status(500).json({ success: false, error });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Post a new message
router.post('/:clubId/messages', async (req, res) => {
  try {
    const { clubId } = req.params;
    const { message, message_type, metadata } = req.body;
    
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Message content is required' });
    }

    const trimmedMessage = message.trim();
    if (trimmedMessage.length > 1000) {
      return res.status(400).json({ success: false, error: 'Message exceeds maximum length' });
    }

    // Determine avatar color (fallback to a default based on userId if needed)
    const colors = ['#00ff88', '#3b82f6', '#ec4899', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
    const avatarColor = colors[parseInt(req.user.id.replace(/\D/g, '').slice(0, 4) || '0') % colors.length];

    // Determine username from auth object if possible
    let username = 'Fan';
    if (req.user.name) username = req.user.name;
    else if (req.user.email) username = req.user.email.split('@')[0];

    const { data, error } = await clubChannelsDb.insertClubMessage({
      clubId,
      userId: req.user.id,
      username,
      avatarColor,
      message: trimmedMessage,
      messageType: message_type || 'text',
      metadata,
    });
    
    if (error) {
      return res.status(500).json({ success: false, error });
    }

    res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('Club message error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Pin/Unpin a message (assuming standard auth checking, maybe in the future check if admin/mod)
router.patch('/:clubId/messages/:messageId/pin', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { isPinned } = req.body;
    
    if (typeof isPinned !== 'boolean') {
      return res.status(400).json({ success: false, error: 'isPinned must be a boolean' });
    }

    // TODO: Ideally check if req.user is an admin or mod of the club here
    
    const { data, error } = await clubChannelsDb.pinClubMessage(messageId, isPinned);
    
    if (error) {
      return res.status(500).json({ success: false, error });
    }

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

module.exports = router;
