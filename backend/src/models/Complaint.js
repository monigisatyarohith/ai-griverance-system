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
  category: {
    type: DataTypes.ENUM(
      'academic', 'examination', 'faculty', 'hostel',
      'infrastructure', 'administrative', 'library', 'transport', 'other'
    ),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('submitted', 'under_review', 'in_progress', 'escalated', 'resolved', 'rejected'),
    defaultValue: 'submitted'
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
    { fields: ['category', 'createdAt'] }
  ]
});

module.exports = Complaint;
