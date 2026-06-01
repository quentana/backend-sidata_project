'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TahunAjaran extends Model {
   
    static associate(models) {
    TahunAjaran.hasMany(models.Semester, {
      foreignKey: "tahun_ajaran_id",
    });
    TahunAjaran.hasMany(models.DataSiswa,{
      foreignKey: "tahun_ajaran_id"
    });
    };
  }
  TahunAjaran.init({
    nama: DataTypes.STRING,
    tanggal_mulai: DataTypes.DATEONLY,
    tanggal_selesai: DataTypes.DATEONLY,
    is_active: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'TahunAjaran',
  });
  
  return TahunAjaran;
};