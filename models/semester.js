'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Semester extends Model {
    static associate(models) {
      Semester.belongsTo(models.TahunAjaran, {
        foreignKey: 'tahun_ajaran_id',
        as: 'tahunajaran'
      });
      Semester.hasMany(models.DataSiswa, {
        foreignKey: 'semester_id',
      });
    }
  }
  Semester.init({
    tahun_ajaran_id: DataTypes.INTEGER,
    nama:     DataTypes.STRING,
    is_active: DataTypes.BOOLEAN
  }, { sequelize, modelName: 'Semester', timestamps: true });
  return Semester;
};
