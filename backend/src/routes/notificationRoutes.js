const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');

router.use(protect);

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const { count: total, rows: notifications } = await Notification.findAndCountAll({
      where: { userId: req.user.id },
      include: [{
        model: Complaint,
        as: 'relatedComplaint',
        attributes: ['id', 'title', 'status']
      }],
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    const unreadCount = await Notification.count({
      where: { userId: req.user.id, isRead: false }
    });

    // Add _id aliases for frontend compatibility
    const data = notifications.map(n => {
      const j = n.toJSON();
      j._id = j.id;
      if (j.relatedComplaint) j.relatedComplaint._id = j.relatedComplaint.id;
      return j;
    });

    res.json({
      success: true,
      data,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    const json = notification.toJSON();
    json._id = json.id;
    res.json({ success: true, data: json });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark all as read
router.put('/read-all', async (req, res) => {
  try {
    await Notification.update(
      { isRead: true, readAt: new Date() },
      { where: { userId: req.user.id, isRead: false } }
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
