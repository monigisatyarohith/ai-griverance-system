const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  action: {
    type: DataTypes.ENUM('create', 'update', 'delete', 'assign', 'escalate', 'resolve', 'reject', 'login', 'logout'),
    allowNull: false
  },
  resource: {
    type: DataTypes.ENUM('complaint', 'user', 'notification', 'system'),
    allowNull: false
  },
  resourceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true,
    get() {
      const val = this.getDataValue('details');
      return val ? JSON.parse(val) : null;
    },
    set(val) {
      this.setDataValue('details', val ? JSON.stringify(val) : null);
    }
  },
  ipAddress: {
    type: DataTypes.STRING,
    allowNull: true
  },
  userAgent: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  indexes: [
    { fields: ['userId', 'createdAt'] },
    { fields: ['resource', 'resourceId'] }
  ]
});

module.exports = AuditLog;
