const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const authMiddleware = require('../middleware/authMiddleware');

// POST /api/reports
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { type, targetId, reason, url } = req.body;
    if (!type || !targetId || !url) return res.status(400).json({ message: 'type, targetId, and url required' });

    const existing = await Report.findOne({ reporter: req.user.id, type, targetId });
    if (existing) return res.status(400).json({ message: 'Already reported' });

    const report = new Report({
      reporter: req.user.id,
      type,
      targetId,
      reason: reason || '',
      url
    });
    await report.save();
    res.status(201).json({ message: 'Reported' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to report' });
  }
});

// DELETE /api/reports
router.delete('/', authMiddleware, async (req, res) => {
  try {
    const { type, targetId } = req.body;
    if (!type || !targetId) return res.status(400).json({ message: 'type and targetId required' });

    await Report.deleteOne({ reporter: req.user.id, type, targetId });
    res.json({ message: 'Report removed' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to remove report' });
  }
});

// GET /api/reports
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { type, targetId } = req.query;
    let query = {};
    if (type) query.type = type;
    if (targetId) query.targetId = targetId;
    // Only return reports by this user unless admin/mod
    if (!['admin', 'moderator'].includes(req.user.role)) {
      query.reporter = req.user.id;
    }
    const reports = await Report.find(query);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
});

module.exports = router;