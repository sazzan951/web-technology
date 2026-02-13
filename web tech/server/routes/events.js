const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  getMyEvents
} = require('../controllers/eventController');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', getEvents);
router.get('/my/events', protect, getMyEvents);
router.get('/:id', getEvent);
router.post('/', protect, adminOnly, createEvent);
router.put('/:id', protect, updateEvent);
router.delete('/:id', protect, deleteEvent);

module.exports = router;
