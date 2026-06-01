'use strict';
const passwordHash = require('password-hash');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');

    const users = [];
    const makeEmail = (name) => name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') + '@sidata.com';

    // ganeret Super-admin Akun
    users.push({
      name: 'Super Admin SIDATA',
      email: 'superadmin@sidata.com',
      password: passwordHash.generate('super123'),
      role: 'super_admin',
      rayon_id: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // generet Pembimbing (admin)— 1 orang per rayon (rayon 1-70)
    const pembimbing = [
      'Pa Dede', 'Bu Dewi', 'Pa Parizal', 'Bu Sinta', 'Pa Ridwan', 'Bu Aulia', 'Pa Reza', 'Bu Tika', 'Pa Hendra', 'Bu Nisa',
      'Pa Yudi', 'Bu Melati', 'Pa Bastian', 'Bu Rina', 'Pa Akbar', 'Bu Putri', 'Pa Fajar', 'Bu Zahra', 'Pa Aldi', 'Bu Nabila',
      'Pa Dani', 'Bu Siska', 'Pa Farhan', 'Bu Ratna', 'Pa Galih', 'Bu Lilis', 'Pa Yoga', 'Bu Rahma', 'Pa Dimas', 'Bu Fitri',
      'Pa Rendi', 'Bu Karin', 'Pa Iqbal', 'Bu Selvi', 'Pa Adi', 'Bu Maya', 'Pa Bima', 'Bu Wulan', 'Pa Rizky', 'Bu Nuri',
      'Pa Ilham', 'Bu Dina', 'Pa Surya', 'Bu Novi', 'Pa Andre', 'Bu Intan', 'Pa Bayu', 'Bu Ayu', 'Pa Fikri', 'Bu Salsa',
      'Pa Yusuf', 'Bu Rani', 'Pa Asep', 'Bu Desi', 'Pa Maman', 'Bu Elsa', 'Pa Hilman', 'Bu Putri2', 'Pa Rafli', 'Bu Tiara',
      'Pa Lukman', 'Bu Nanda', 'Pa Hafiz', 'Bu Syifa', 'Pa Kevin', 'Bu Laras', 'Pa Arif', 'Bu Niken', 'Pa Bagas', 'Bu Yuni'
    ];

    pembimbing.forEach((nama, index) => {
      users.push({
        name: nama,
        email: makeEmail(nama),
        password: passwordHash.generate('admin123'),
        role: 'admin',
        rayon_id: index + 1, // ID Rayon 1 sampai 70
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });

    // generet siswa — 70 Rayon × 30 Siswa
    const namaDepan = [
      'Ahmad', 'Muhammad', 'Rizky', 'Dimas', 'Fajar',
      'Bagas', 'Yoga', 'Aldi', 'Fikri', 'Rafi',
      'Siti', 'Aulia', 'Putri', 'Nabila', 'Tiara',
      'Salma', 'Aisyah', 'Dewi', 'Indah', 'Zahra'
    ];

    const namaBelakang = [
      'Saputra', 'Pratama', 'Maulana', 'Ramadhan', 'Hidayat',
      'Kurniawan', 'Ananda', 'Permata', 'Lestari', 'Safitri',
      'Wijaya', 'Nugraha', 'Firmansyah', 'Putra', 'Santoso'
    ];

    const TOTAL_RAYON = 70;
    const SISWA_PER_RAYON = 30;

    // generate siswa untuk setiap rayon
    for (let rayonId = 1; rayonId <= TOTAL_RAYON; rayonId++) {
      for (let nomorSiswa = 1; nomorSiswa <= SISWA_PER_RAYON; nomorSiswa++) {

        const depan = namaDepan[Math.floor(Math.random() * namaDepan.length)];
        const belakang = namaBelakang[Math.floor(Math.random() * namaBelakang.length)];

        // nama lengkap dasar siswa
        const namaSiswaAsli = `${depan} ${belakang}`;

        // nama di dashboard tetap rapi menginfokan Rayon & Nomor urut siswa tersebut
        const namaAcak = `${namaSiswaAsli} R${rayonId}-${nomorSiswa}`;

        //logicnya: Melemparkan nama asli + info rayon & nomor ke fungsi makeEmail agar formatnya tetap @sidata.com
        //output: "Ahmad Pratama R1-1" akan menjadi "ahmadpratamar11@sidata.com" (Dijamin mengikuti nama & anti-duplikat!)
        const emailUnikSiswa = makeEmail(namaAcak);
        users.push({
          name: namaAcak,
          email: emailUnikSiswa,
          password: passwordHash.generate('siswa123'),
          role: 'user',
          rayon_id: rayonId,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    //eksekusi massal semua data gabungan (1 Super Admin + 70 Pembimbing + 2100 Siswa)
    await queryInterface.bulkInsert('Users', users, {});
    //nyalakan kembali foreign key check
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  },
};