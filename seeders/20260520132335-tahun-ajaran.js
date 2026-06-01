'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.bulkInsert('TahunAjarans', [
    {
      nama: '2025-2026',
      tanggal_mulai: '2025-07-01',
      tanggal_selesai: '2026-06-30',
      is_active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
   ]);
  },

  async down (queryInterface, Sequelize) {
   await queryInterface.bulkDelete('TahunAjarans', null, {});
  }
};
