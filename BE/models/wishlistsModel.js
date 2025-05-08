const connection = require('../config/database');
const { DataTypes } = require('sequelize');

const WishlistModel = connection.define('wishlists', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    product_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'wishlists',
    timestamps: true,
    createdAt: 'created_at'
});

module.exports = WishlistModel;