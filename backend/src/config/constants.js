module.exports = {
  ROLES: {
    STUDENT: 'student',
    FACULTY: 'faculty',
    HOD: 'hod',
    ADMIN: 'admin'
  },
  COMPLAINT_STATUS: {
    SUBMITTED: 'submitted',
    UNDER_REVIEW: 'under_review',
    IN_PROGRESS: 'in_progress',
    ESCALATED: 'escalated',
    RESOLVED: 'resolved',
    REJECTED: 'rejected'
  },
  CATEGORIES: [
    'academic',
    'examination',
    'faculty',
    'hostel',
    'infrastructure',
    'administrative',
    'library',
    'transport',
    'other'
  ],
  PRIORITIES: ['low', 'medium', 'high', 'urgent'],
  ESCALATION_DAYS: {
    low: 14,
    medium: 7,
    high: 3,
    urgent: 1
  }
};
