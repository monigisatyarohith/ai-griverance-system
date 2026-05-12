const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  updateStatus,
  getStats
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.route('/')
  .post(authorize('student'), upload.array('attachments', 5), createComplaint)
  .get(getComplaints);

router.get('/stats', getStats);
router.put('/:id/status', authorize('faculty', 'hod', 'admin'), updateStatus);

module.exports = router;
