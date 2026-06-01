'use strict';
const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

  class Approved extends Model {

    static associate(models) {

      Approved.belongsTo(models.DataSiswa, {
        foreignKey: 'siswa_id',
        as: 'siswa'
      });

      Approved.belongsTo(models.User, {
        foreignKey: 'admin_id',
        as: 'admin'
      });

    }
  }

  Approved.init({
    siswa_id: {type: DataTypes.INTEGER, allowNull: false},
    admin_id: {type: DataTypes.INTEGER},
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    catatan: {type: DataTypes.TEXT}
  }, {
    sequelize,
    modelName: 'Approved',
    timestamps: true,
  });

  return Approved;
};