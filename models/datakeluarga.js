'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DataKeluarga extends Model {
    static associate(models) {

      DataKeluarga.belongsTo(models.DataSiswa, {
        foreignKey: 'siswa_id',
        as: 'siswa'
      });

      DataKeluarga.hasOne(models.DataAyah, {
        foreignKey: 'keluarga_id',
        as: 'ayah'
      });
      
      DataKeluarga.hasOne(models.DataIbu, {
        foreignKey: 'keluarga_id',
        as: 'ibu'
      });

      DataKeluarga.hasOne(models.DataWali,{
        foreignKey: 'keluarga_id',
        as: 'wali'
      });
      

    }
  }
  DataKeluarga.init({
    siswa_id: DataTypes.INTEGER,
    no_kk: DataTypes.STRING,
    nama_kepala_keluarga: DataTypes.STRING,
    alamat_keluarga: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'DataKeluarga',
    timestamps: true,
  });
  return DataKeluarga;
};