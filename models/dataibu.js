'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DataIbu extends Model {

    static associate(models) {
      DataIbu.belongsTo(models.DataKeluarga, {
        foreignKey: 'keluarga_id',
        as: 'keluarga'
      });
    };
  }
  DataIbu.init({
    keluarga_id: DataTypes.INTEGER,
    nama_ibu: DataTypes.STRING,
    nik_ibu: DataTypes.STRING,
    tempat_lahir: DataTypes.STRING,
    tanggal_lahir: DataTypes.DATEONLY,
    pendidikan: DataTypes.STRING,
    pekerjaan: DataTypes.STRING,
    penghasilan: DataTypes.STRING,
    no_telp: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'DataIbu',
    timestamps: true,
  });
  return DataIbu;
};