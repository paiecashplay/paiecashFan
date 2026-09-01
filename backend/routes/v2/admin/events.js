const express = require('express');
const router = express.Router();

const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} = require('../../../db/events');

const { requireAuth, requireRole } = require('../../../middleware/auth');

// Toutes les routes de ce fichier sont réservées au super_admin
router.use(requireAuth);
router.use(requireRole('super_admin'));


// GET /api/v2/admin/events
// Récupérer tous les événements, publiés ou non
router.get('/', async (req, res) => {
  try {
    const events = await getAllEvents();

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    console.error('GET /api/v2/admin/events error:', error);

    return res.status(500).json({
      success: false,
      message: 'Impossible de récupérer les événements',
    });
  }
});


// GET /api/v2/admin/events/:id
// Récupérer un événement précis
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const event = await getEventById(id);

    if (!event) {
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
    console.error('GET /api/v2/admin/events/:id error:', error);

    return res.status(500).json({
      success: false,
      message: "Impossible de récupérer l'événement",
    });
  }
});


// POST /api/v2/admin/events
// Créer un nouvel événement
router.post('/', async (req, res) => {
  try {
    const {
      name,
      slug,
      short_name,
      description,
      image_url,
      logo_url,
      event_type,
      sport,
      organizer,
      start_date,
      end_date,
      location_name,
      city,
      host_countries,
      venue,
      source_name,
      source_url,
      status,
      is_published,
      features,
      metadata,
      display_order,
    } = req.body;

    if (!name || !slug || !event_type) {
      return res.status(400).json({
        success: false,
        message: 'Les champs name, slug et event_type sont obligatoires',
      });
    }

    const event = await createEvent({
      name,
      slug,
      short_name,
      description,
      image_url,
      logo_url,
      event_type,
      sport,
      organizer,
      start_date,
      end_date,
      location_name,
      city,
      host_countries,
      venue,
      source_name,
      source_url,
      status,
      is_published,
      features,
      metadata,
      display_order,
    });

    return res.status(201).json({
      success: true,
      message: 'Événement créé avec succès',
      data: event,
    });
  } catch (error) {
    console.error('POST /api/v2/admin/events error:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Un événement avec ce slug existe déjà',
      });
    }

    return res.status(500).json({
      success: false,
      message: "Impossible de créer l'événement",
    });
  }
});


// PATCH /api/v2/admin/events/:id
// Modifier un événement
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingEvent = await getEventById(id);

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Événement introuvable',
      });
    }

    const event = await updateEvent(id, req.body);

    return res.status(200).json({
      success: true,
      message: 'Événement modifié avec succès',
      data: event,
    });
  } catch (error) {
    console.error('PATCH /api/v2/admin/events/:id error:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Un événement avec ce slug existe déjà',
      });
    }

    return res.status(500).json({
      success: false,
      message: "Impossible de modifier l'événement",
    });
  }
});


// DELETE /api/v2/admin/events/:id
// Supprimer un événement
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const existingEvent = await getEventById(id);

    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: 'Événement introuvable',
      });
    }

    await deleteEvent(id);

    return res.status(200).json({
      success: true,
      message: 'Événement supprimé avec succès',
    });
  } catch (error) {
    console.error('DELETE /api/v2/admin/events/:id error:', error);

    return res.status(500).json({
      success: false,
      message: "Impossible de supprimer l'événement",
    });
  }
});

module.exports = router;