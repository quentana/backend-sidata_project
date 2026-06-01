'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Rayon, {
        foreignKey: 'rayon_id',
        as: 'rayon'
      });
    }
  }
  User.init({
    name:     DataTypes.STRING,
    email:    DataTypes.STRING,
    password: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('user', 'admin', 'super_admin'),
      defaultValue: 'user'
    },
    rayon_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
