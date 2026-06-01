'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Dokumens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      siswa_id: {
        type: Sequelize.INTEGER
      },
      jenis_dokumen: {
        type: Sequelize.ENUM(
          'akte_kelahiran',
          'kartu_keluarga',
          'ktp_ayah',
          'ktp_ibu'
        ),
        allowNull: false
      },
      nama_file: {
        type: Sequelize.STRING
      },
      path_file: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Dokumens');
  }
};