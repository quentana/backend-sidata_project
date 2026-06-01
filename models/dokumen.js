'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Dokumen extends Model {
    static associate(models) {
      Dokumen.belongsTo(models.DataSiswa, {
        foreignKey: 'siswa_id',
        as: 'siswa'
      });
    }
  }
  Dokumen.init({
    siswa_id:     DataTypes.INTEGER,
    jenis_dokumen: {
      type: DataTypes.ENUM('akte_kelahiran','kartu_keluarga','ktp_ayah','ktp_ibu'),
      allowNull: false,
    },
    nama_file: DataTypes.STRING,
    // path_file simpan filename saja, TANPA getter yang tambah BASE_URL
    path_file: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Dokumen',
    timestamps: true,
  });
  return Dokumen;
};
