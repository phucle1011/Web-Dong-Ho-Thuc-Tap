const connection = require('../config/database');
const { DataTypes } = require('sequelize');
const User = connection.define('User', {
  id: {
    type: DataTypes.INTEGER.UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true, 
    validate: { isEmail: true },
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  phone: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    allowNull: true,
    defaultValue: 'user',
  },
  email_verified_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  remember_token: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending', 'locked'),
    allowNull: true,
    defaultValue: 'active',
  },
  lockout_reason: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
  updated_at: {
    type: DataTypes.DATE,
    allowNull: true,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'users',
  timestamps: false,
  indexes: [
    { unique: true, fields: ['email'] },
    { fields: ['status'] },
    { fields: ['role'] },
    { fields: ['created_at'] },
  ],
});

module.exports = User;
