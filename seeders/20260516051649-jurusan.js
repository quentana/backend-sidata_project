'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Jurusans', [
      {
        nama_jurusan: 'Teknik Komputer dan Jaringan',
        kode_jurusan: 'TKJ',
        createdAt:    new Date(),
        updatedAt:    new Date(),
      },
      {
        nama_jurusan: 'Pengembangan Perangkat Lunak Dan GIM',
        kode_jurusan: 'PPLG',
        createdAt:    new Date(),
        updatedAt:    new Date(),
      },
      {
        nama_jurusan: 'DKV',
        kode_jurusan: 'Desain Komunikasi Visual',
        createdAt:    new Date(),
        updatedAt:    new Date(),
      },
      {
        nama_jurusan: 'Pemasaran',
        kode_jurusan: 'PMN',
        createdAt:    new Date(),
        updatedAt:    new Date(),
      },
      {
        nama_jurusan: 'Manajemen Perkantoran Layanan Bisnis',
        kode_jurusan: 'MPLB',
        createdAt:    new Date(),
        updatedAt:    new Date(),
      },
      {
        nama_jurusan : 'Hotel',
        kode_jurusan: ' HTL',
        createdAt : new Date(),
        updatedAt : new Date()
      },
      {
        nama_jurusan : 'Kuliner',
        kode_jurusan : 'KLN',
        createdAt : new Date(),
        updatedAt : new Date()
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Jurusans', null, {});
  },
};
