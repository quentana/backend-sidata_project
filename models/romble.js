'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Romble extends Model {
    static associate(models) {
      Romble.hasMany(models.DataSiswa, {
        foreignKey: 'romble_id',
        as: 'siswa'
      });
    }
  }
  Romble.init({
    nama_romble: DataTypes.STRING,
    kode_romble: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Romble',
    // paranoid: true,
    timestamps: true,
  });
  return Romble;
};