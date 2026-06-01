'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DataSiswa extends Model {
    static associate(models) {
      DataSiswa.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
       DataSiswa.hasOne(models.Approved, {
        foreignKey: 'siswa_id',
        as: 'approved'
      });
      DataSiswa.belongsTo(models.Jurusan, {
        foreignKey: 'jurusan_id',
        as: 'jurusan'
      });

      DataSiswa.belongsTo(models.Rayon, {
        foreignKey: 'rayon_id',
        as: 'rayon'
      });

      DataSiswa.belongsTo(models.Romble, {
        foreignKey: 'romble_id',
        as: 'romble'
      });

      DataSiswa.hasOne(models.DataKeluarga, {
        foreignKey: 'siswa_id',
        as: 'keluarga'
      });

      DataSiswa.hasMany(models.Dokumen, {
        foreignKey: 'siswa_id',
        as: 'dokumen'
      });
      DataSiswa.belongsTo(models.TahunAjaran, {
        foreignKey: 'tahun_ajaran_id',
        as: 'TahunAjaran'
      });
      DataSiswa.belongsTo(models.Semester, {
        foreignKey: 'semester_id',
        as: 'Semester'
      });
    }
  }
  DataSiswa.init({
    user_id: DataTypes.INTEGER,
    jurusan_id: DataTypes.INTEGER,
    rayon_id: DataTypes.INTEGER,
    romble_id: DataTypes.INTEGER,
    tahun_ajaran_id:DataTypes.INTEGER,
    semester_id: DataTypes.INTEGER,
    nisn: DataTypes.STRING,
    nama_lengkap: DataTypes.STRING,
    tempat_lahir: DataTypes.STRING,
    tanggal_lahir: DataTypes.DATEONLY,
    jenis_kelamin: DataTypes.ENUM('L', 'P'),
    agama: DataTypes.STRING,
    alamat: DataTypes.TEXT,
    no_telp: DataTypes.STRING,
    foto: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('aktif', 'nonaktif'),
      defaultValue: 'aktif'
    },
  }, {
    sequelize,
    modelName: 'DataSiswa',
    timestamps: true,
  });
  return DataSiswa;
};