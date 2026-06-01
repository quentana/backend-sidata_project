'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('DataSiswas', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      jurusan_id: {
        type: Sequelize.INTEGER
      },
      rayon_id: {
        type: Sequelize.INTEGER
      },
      romble_id: {
        type: Sequelize.INTEGER
      },
      tahun_ajaran_id: {
        type: Sequelize.INTEGER,
        // references:{
        //   model:'TahunAjarans',
        //   key: 'id',
        // },
      },
      semester_id:{
        type:Sequelize.INTEGER,
        // references:{
        //   model: 'Semesters',
        //   key: 'id',
        // },
      },
      nisn: {
        type: Sequelize.STRING
      },
      nama_lengkap: {
        type: Sequelize.STRING
      },
      tempat_lahir: {
        type: Sequelize.STRING
      },
      tanggal_lahir: {
        type: Sequelize.DATEONLY
      },
      jenis_kelamin: {
        type: Sequelize.STRING
      },
      agama: {
        type: Sequelize.STRING
      },
      alamat: {
        type: Sequelize.TEXT
      },
      no_telp: {
        type: Sequelize.STRING
      },
      foto: {
        type: Sequelize.STRING
      },
      status: {
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
    await queryInterface.dropTable('DataSiswas');
  }
};