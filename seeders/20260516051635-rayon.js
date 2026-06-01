'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  async up(queryInterface, Sequelize) {
    const rayonCategory = [
      'Cisarua',
      'Cicurug',
      'Ciawi',
      'Cibedug',
      'Tajur',
      'Wikrama',
      'Sukasari'
    ];
    let data = [];
    rayonCategory.forEach((category) => {
      for (let i = 1; i <= 10; i++) {
        data.push({
          nama_rayon: `${category} ${i}`,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    });
    await queryInterface.bulkInsert(
      'Rayons',
      data,
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'Rayons',
      null,
      {}
    );

  },

};