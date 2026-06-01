const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const GrievanceUpdate = sequelize.define('GrievanceUpdate', {
  update_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  grievance_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  coordinator_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachment_path: {
    type: DataTypes.STRING,
    allowNull: true
  },
  estimatedResolutionDate: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  tableName: 'GrievanceUpdates'
});

module.exports = GrievanceUpdate;
