const sequelize = require('../config/database');
const User = require('./User');
const Complaint = require('./Complaint');
const Notification = require('./Notification');
const AuditLog = require('./AuditLog');
const GrievanceUpdate = require('./GrievanceUpdate');
const Setting = require('./Setting');

// Associations
// Complaint belongs to a student (User)
Complaint.belongsTo(User, { as: 'student', foreignKey: 'studentId' });
User.hasMany(Complaint, { as: 'complaints', foreignKey: 'studentId' });

// Complaint can be assigned to a coordinator/faculty/hod (User)
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

// GrievanceUpdate belongs to Complaint
Complaint.hasMany(GrievanceUpdate, { as: 'updates', foreignKey: 'grievance_id' });
GrievanceUpdate.belongsTo(Complaint, { as: 'complaint', foreignKey: 'grievance_id' });

// GrievanceUpdate belongs to User (Coordinator)
GrievanceUpdate.belongsTo(User, { as: 'coordinator', foreignKey: 'coordinator_id' });
User.hasMany(GrievanceUpdate, { as: 'coordinatorUpdates', foreignKey: 'coordinator_id' });

module.exports = {
  sequelize,
  User,
  Complaint,
  Notification,
  AuditLog,
  GrievanceUpdate,
  Setting
};
