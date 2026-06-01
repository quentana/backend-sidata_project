'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DataAyah extends Model {
    static associate(models) {
      DataAyah.belongsTo(models.DataKeluarga, {
        foreignKey: 'keluarga_id',
        as: 'keluarga'
      });
    }
  }
  DataAyah.init({
    keluarga_id:   DataTypes.INTEGER,
    nama_ayah:     DataTypes.STRING,
    nik_ayah:      DataTypes.STRING,
    tempat_lahir:  DataTypes.STRING,
    tanggal_lahir: DataTypes.DATEONLY,
    pendidikan:    DataTypes.STRING,
    pekerjaan:     DataTypes.STRING,
    penghasilan:   DataTypes.STRING,
    no_telp:       DataTypes.STRING
  }, { sequelize, modelName: 'DataAyah', timestamps: true });
  return DataAyah;
};
