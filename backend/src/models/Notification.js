const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.STRING,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('complaint_update', 'escalation', 'assignment', 'reminder', 'system'),
    defaultValue: 'complaint_update'
  },
  relatedComplaintId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  metadata: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const val = this.getDataValue('metadata');
      return val ? JSON.parse(val) : null;
    },
    set(val) {
      this.setDataValue('metadata', val ? JSON.stringify(val) : null);
    }
  }
}, {
  timestamps: true
});

module.exports = Notification;
