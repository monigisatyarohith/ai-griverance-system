const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Complaint = sequelize.define('Complaint', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [5, 100]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [20, 10000]
    }
  },
  complainantType: {
    type: DataTypes.ENUM('student', 'staff'),
    allowNull: false,
    defaultValue: 'student'
  },
  category: {
    type: DataTypes.ENUM(
      'academics', 'scholarships', 'examinations', 'ragging',
      'extra_curricular', 'boarding_lodging',
      'social_inequality', 'gender_inequality', 'amenities', 'pay_perks', 'service',
      'transport', 'placement', 'other'
    ),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM(
      'Pending Vice Principal Approval',
      'Approved by Vice Principal',
      'Rejected by Vice Principal',
      'Under Review',
      'Investigation Started',
      'In Progress',
      'Awaiting Information',
      'Escalated',
      'Resolved',
      'Closed'
    ),
    defaultValue: 'Pending Vice Principal Approval'
  },
  studentId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  assignedToId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  escalationLevel: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  estimatedResolutionDate: {
    type: DataTypes.DATE,
    allowNull: true
  },
  // Store arrays as JSON in SQLite
  attachments: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('attachments');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('attachments', JSON.stringify(val || []));
    }
  },
  remarks: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('remarks');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('remarks', JSON.stringify(val || []));
    }
  },
  resolution: {
    type: DataTypes.TEXT,
    defaultValue: null,
    get() {
      const val = this.getDataValue('resolution');
      return val ? JSON.parse(val) : null;
    },
    set(val) {
      this.setDataValue('resolution', val ? JSON.stringify(val) : null);
    }
  },
  timeline: {
    type: DataTypes.TEXT,
    defaultValue: '[]',
    get() {
      const val = this.getDataValue('timeline');
      return val ? JSON.parse(val) : [];
    },
    set(val) {
      this.setDataValue('timeline', JSON.stringify(val || []));
    }
  },
  escalationDeadline: {
    type: DataTypes.DATE,
    allowNull: true
  },
  lastResponseAt: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['studentId', 'createdAt'] },
    { fields: ['status', 'assignedToId'] },
    { fields: ['category', 'createdAt'] },
    { fields: ['complainantType'] }
  ]
});

module.exports = Complaint;
