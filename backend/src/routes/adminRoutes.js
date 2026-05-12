const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { Op, fn, col } = require('sequelize');
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');

router.use(protect);
router.use(authorize('admin'));

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.findAll();
    // Add _id alias for frontend
    const data = users.map(u => { const j = u.toJSON(); j._id = j.id; return j; });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user role
router.put('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.body.role) user.role = req.body.role;
    if (req.body.department) user.department = req.body.department;
    await user.save();

    const json = user.toJSON();
    json._id = json.id;
    res.json({ success: true, data: json });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete user
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.destroy();
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get system analytics
router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalComplaints = await Complaint.count();
    const resolvedComplaints = await Complaint.count({ where: { status: 'resolved' } });
    const pendingComplaints = await Complaint.count({
      where: { status: { [Op.in]: ['submitted', 'under_review', 'in_progress'] } }
    });

    const categoryStats = await Complaint.findAll({
      attributes: [
        ['category', '_id'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['category'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      raw: true
    });

    const monthlyStats = await Complaint.findAll({
      attributes: [
        [fn('strftime', '%Y-%m', col('createdAt')), '_id'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: [fn('strftime', '%Y-%m', col('createdAt'))],
      order: [[fn('strftime', '%Y-%m', col('createdAt')), 'ASC']],
      limit: 12,
      raw: true
    });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalComplaints,
        resolvedComplaints,
        pendingComplaints,
        resolutionRate: totalComplaints > 0 ? ((resolvedComplaints / totalComplaints) * 100).toFixed(1) : 0,
        categoryStats,
        monthlyStats
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get audit logs
router.get('/audit-logs', async (req, res) => {
  try {
    const logs = await AuditLog.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'role'] }],
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
