'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Semesters', [
      {
        tahun_ajaran_id:1,
        nama: 'ganjil',
        is_active:true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        tahun_ajaran_id:1,
        nama: 'genap',
        is_active: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Semesters', null, {});
  }
};
