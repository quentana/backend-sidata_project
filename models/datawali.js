'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DataWali extends Model {
    static associate(models) {
     DataWali.belongsTo(models.DataKeluarga, {
      foreignKey: 'keluarga_id',
      as: 'keluarga'
    });
    }
  }
  DataWali.init({
    keluarga_id: DataTypes.INTEGER,
    nama_wali: DataTypes.STRING,
    nik_wali: DataTypes.STRING,
    hubungan: DataTypes.STRING,
    pekerjaan: DataTypes.STRING,
    no_telp: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DataWali',
    timestamps: true,
  });
  return DataWali;
};