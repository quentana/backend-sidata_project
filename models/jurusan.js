'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Jurusan extends Model {
    static associate(models) {
      Jurusan.hasMany(models.DataSiswa, {
        foreignKey: 'jurusan_id',
        as: 'siswa'
      });
    }
  }
  Jurusan.init({
    nama_jurusan: DataTypes.STRING,
    kode_jurusan: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Jurusan',
    // paranoid: true,
    timestamps: true,
  });
  return Jurusan;
};