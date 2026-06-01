'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {

  async up(queryInterface, Sequelize) {

    const rombleCategory = [
      {nama: 'PPLG',jumlah: 5},
      {nama: 'TJKT',jumlah: 3},
      {nama: 'DKV',jumlah: 3},
      {nama: 'PMN',jumlah: 2},
      {nama: 'MPLB',jumlah: 3},
      {nama: 'HTL',jumlah: 2},
      {nama: 'KLN',jumlah: 3}

    ];

    const tingkat = ['X','XI','XII'];
    let data = [];
    rombleCategory.forEach((jurusan) => {
      tingkat.forEach((kelas) => {
        for (let i = 1; i <= jurusan.jumlah; i++) {
          data.push({
            nama_romble:
              `${jurusan.nama} `,
            kode_romble:
              `${jurusan.nama}${kelas}-${i}`,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      });
    });

    await queryInterface.bulkInsert(
      'Rombles',
      data,
      {}
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      'Rombles',
      null,
      {}
    );

  }

};