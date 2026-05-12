const { Op, fn, col, literal } = require('sequelize');
const Complaint = require('../models/Complaint');
const Notification = require('../models/Notification');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User');
const { aiCategorizeComplaint } = require('../services/aiService');

// @desc    Create complaint
// @route   POST /api/complaints
// @access  Private/Student
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    
    // AI categorization if category not provided
    let finalCategory = category;
    if (!finalCategory && process.env.OPENAI_API_KEY) {
      finalCategory = await aiCategorizeComplaint(description);
    }

    const complaint = await Complaint.create({
      title,
      description,
      category: finalCategory || 'other',
      priority: priority || 'medium',
      studentId: req.user.id,
      timeline: [{
        status: 'submitted',
        message: 'Complaint submitted successfully',
        changedBy: req.user.id,
        timestamp: new Date()
      }]
    });

    // Find appropriate faculty to assign (based on department and category)
    const faculty = await User.findOne({
      where: {
        role: 'faculty',
        department: req.user.department
      }
    });
    
    if (faculty) {
      complaint.assignedToId = faculty.id;
      await complaint.save();
      
      // Notify faculty
      await Notification.create({
        userId: faculty.id,
        title: 'New Complaint Assigned',
        message: `New ${complaint.category} complaint: ${complaint.title}`,
        type: 'assignment',
        relatedComplaintId: complaint.id
      });
    }

    // Create audit log
    await AuditLog.create({
      userId: req.user.id,
      action: 'create',
      resource: 'complaint',
      resourceId: complaint.id,
      details: { title, category },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    // Reload with associations
    const result = await Complaint.findByPk(complaint.id, {
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      data: formatComplaint(result)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all complaints (with filters)
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res) => {
  try {
    let where = {};
    
    // Role-based filtering
    if (req.user.role === 'student') {
      where.studentId = req.user.id;
    } else if (req.user.role === 'faculty') {
      where.assignedToId = req.user.id;
    } else if (req.user.role === 'hod') {
      // Get complaints from faculty in department
      const faculty = await User.findAll({
        where: { department: req.user.department, role: 'faculty' },
        attributes: ['id']
      });
      const facultyIds = faculty.map(f => f.id);
      where.assignedToId = { [Op.in]: facultyIds };
    }
    // Admin can see all

    // Apply filters
    if (req.query.status) where.status = req.query.status;
    if (req.query.category) where.category = req.query.category;
    if (req.query.priority) where.priority = req.query.priority;
    
    // Date range filter
    if (req.query.startDate || req.query.endDate) {
      where.createdAt = {};
      if (req.query.startDate) where.createdAt[Op.gte] = new Date(req.query.startDate);
      if (req.query.endDate) where.createdAt[Op.lte] = new Date(req.query.endDate);
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const { count: total, rows: complaints } = await Complaint.findAndCountAll({
      where,
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      offset,
      limit
    });

    res.json({
      success: true,
      data: complaints.map(formatComplaint),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private/Faculty/HOD/Admin
exports.updateStatus = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const complaint = await Complaint.findByPk(req.params.id);
    
    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    complaint.status = status;
    
    // Append to timeline (JSON array)
    const timeline = complaint.timeline || [];
    timeline.push({
      status,
      message: remarks || `Status updated to ${status}`,
      changedBy: req.user.id,
      timestamp: new Date()
    });
    complaint.timeline = timeline;

    if (status === 'resolved') {
      complaint.resolution = {
        text: remarks,
        resolvedBy: req.user.id,
        resolvedAt: new Date()
      };
    }

    await complaint.save();

    // Notify student
    await Notification.create({
      userId: complaint.studentId,
      title: `Complaint ${status}`,
      message: `Your complaint "${complaint.title}" has been ${status}`,
      type: 'complaint_update',
      relatedComplaintId: complaint.id
    });

    // Create audit log
    await AuditLog.create({
      userId: req.user.id,
      action: 'update',
      resource: 'complaint',
      resourceId: complaint.id,
      details: { status, remarks },
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    const result = await Complaint.findByPk(complaint.id, {
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'assignedTo', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.json({
      success: true,
      data: formatComplaint(result)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get complaint statistics
// @route   GET /api/complaints/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    let where = {};
    
    if (req.user.role === 'student') {
      where.studentId = req.user.id;
    } else if (req.user.role === 'faculty') {
      where.assignedToId = req.user.id;
    } else if (req.user.role === 'hod') {
      const faculty = await User.findAll({
        where: { department: req.user.department, role: 'faculty' },
        attributes: ['id']
      });
      where.assignedToId = { [Op.in]: faculty.map(f => f.id) };
    }

    const total = await Complaint.count({ where });
    const submitted = await Complaint.count({ where: { ...where, status: 'submitted' } });
    const underReview = await Complaint.count({ where: { ...where, status: 'under_review' } });
    const inProgress = await Complaint.count({ where: { ...where, status: 'in_progress' } });
    const escalated = await Complaint.count({ where: { ...where, status: 'escalated' } });
    const resolved = await Complaint.count({ where: { ...where, status: 'resolved' } });
    const rejected = await Complaint.count({ where: { ...where, status: 'rejected' } });

    // Category-wise stats
    const categoryStats = await Complaint.findAll({
      where,
      attributes: [
        ['category', '_id'],
        [fn('COUNT', col('id')), 'count']
      ],
      group: ['category'],
      raw: true
    });

    res.json({
      success: true,
      stats: { total, submitted, underReview, inProgress, escalated, resolved, rejected },
      categoryStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper: format complaint for API response (add _id alias for frontend compatibility)
function formatComplaint(complaint) {
  if (!complaint) return null;
  const json = complaint.toJSON();
  json._id = json.id;
  if (json.student) json.student._id = json.student.id;
  if (json.assignedTo) json.assignedTo._id = json.assignedTo.id;
  return json;
}
