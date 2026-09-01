const express = require('express');
const router = express.Router();

const {
  getPublishedEvents,
  getEventBySlug,
} = require('../../db/events');

// GET /api/v2/events
// Retourne uniquement les événements publiés
router.get('/', async (req, res) => {
  try {
    const events = await getPublishedEvents();

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('GET /api/v2/events error:', error);

    return res.status(500).json({
      success: false,
      message: 'Impossible de récupérer les événements',
    });
  }
});

// GET /api/v2/events/:slug
// Retourne un événement publié à partir de son slug
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const event = await getEventBySlug(slug);

    if (!event || !event.is_published) {
      return res.status(404).json({
        success: false,
        message: 'Événement introuvable',
      });
    }

    return res.status(200).json({
      success: true,
      data: event,
    });
  } catch (error) {
    console.error('GET /api/v2/events/:slug error:', error);

    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer l'événement",
    });
  }
});

module.exports = router;