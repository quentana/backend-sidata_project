'use strict';

const {
  Model
} = require('sequelize');

module.exports = (sequelize, DataTypes) => {

  class Rayon extends Model {
    static associate(models) {

      Rayon.hasMany(models.DataSiswa, {
        foreignKey: 'rayon_id',
        as: 'siswa'
      });

      Rayon.hasMany(models.User, {
        foreignKey: 'rayon_id',
        as: 'pembimbing'
      });

    }
  }

  Rayon.init({
    nama_rayon: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Rayon',
    timestamps: true,
  });

  return Rayon;

};