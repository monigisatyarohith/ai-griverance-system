const sequelize = require('../config/database');
const User = require('./User');
const Complaint = require('./Complaint');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');

// Associations
// Complaint belongs to a student (User)
Complaint.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
User.hasMany(Complaint, { as: 'complaints', foreignKey: 'studentId' });

// Complaint can be assigned to a faculty/hod (User)
Complaint.belongsTo(User, { as: 'assignedTo', foreignKey: 'assignedToId' });
User.hasMany(Complaint, { as: 'assignedComplaints', foreignKey: 'assignedToId' });

// Notification belongs to a User
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(Notification, { foreignKey: 'userId' });

// Notification can reference a Complaint
Notification.belongsTo(Complaint, { as: 'relatedComplaint', foreignKey: 'relatedComplaintId' });

// AuditLog belongs to a User
AuditLog.belongsTo(User, { as: 'user', foreignKey: 'userId' });
User.hasMany(AuditLog, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Complaint,
  Notification,
  AuditLog
};
