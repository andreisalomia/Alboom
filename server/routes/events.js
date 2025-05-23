const express = require('express');
const router = express.Router();
const Event = require('../models/Event');
const auth = require('../middleware/auth'); // sau cum verifici userul

// 1. Participare la eveniment
router.post('/:id/participate', auth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    // dacă userul e deja înscris
    if (ev.participants.includes(req.user.id)) {
      return res.status(400).json({ message: 'Already participating' });
    }

    ev.participants.push(req.user.id);
    await ev.save();
    res.json({ participantsCount: ev.participants.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Renunţare (cancel) la participare
router.delete('/:id/participate', auth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id);
    if (!ev) return res.status(404).json({ message: 'Event not found' });

    ev.participants = ev.participants.filter(
      userId => userId.toString() !== req.user.id
    );
    await ev.save();
    res.json({ participantsCount: ev.participants.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 3. Listă participanţi
router.get('/:id/participants', auth, async (req, res) => {
  try {
    const ev = await Event.findById(req.params.id).populate('participants', 'name email');
    if (!ev) return res.status(404).json({ message: 'Event not found' });
    res.json({ participants: ev.participants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
