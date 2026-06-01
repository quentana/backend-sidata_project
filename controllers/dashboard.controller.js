const { DataSiswa, Jurusan, Approved, sequelize } = require('../models'); // Pastikan 'sequelize' ikut di-import di sini
const { Op } = require('sequelize');
const { response } = require('../helpers/response.formatter');

module.exports = {
    getStats: async (req, res) => {
        try {
            const where = {};
            if (req.user.role === 'admin' && req.user.rayon_id) {
                where.rayon_id = req.user.rayon_id;
            }

            // 1. Ambil data hitungan dasar
            const totalSiswa   = await DataSiswa.count({ where });
            const totalJurusan = await Jurusan.count();

            // Hitung approved berdasarkan siswa di rayon admin
            let siswaIds = [];
            if (req.user.role === 'admin' && req.user.rayon_id) {
                const rows = await DataSiswa.findAll({ where, attributes: ['id'] });
                siswaIds = rows.map(s => s.id);
            }

            const approvedWhere = siswaIds.length
                ? { siswa_id: { [Op.in]: siswaIds } }
                : req.user.role === 'super_admin' ? {} : { siswa_id: { [Op.in]: [0] } };

            const pendingCount  = await Approved.count({ where: { ...approvedWhere, status: 'pending'   } });
            const approvedCount = await Approved.count({ where: { ...approvedWhere, status: 'approved'  } });
            const rejectedCount = await Approved.count({ where: { ...approvedWhere, status: 'rejected'  } });

            //  Ambil siswa per jurusan secara langsung menggunakan JOIN
            const queryOptions = {
                attributes: [
                    'nama_jurusan',
                    'kode_jurusan',
                    [sequelize.fn('COUNT', sequelize.col('siswa.id')), 'total']
                ],
                include: [{
                    model: DataSiswa,
                    as: 'siswa', // Jika di model Jurusan relasinya hasMany menggunakan as: 'siswa'
                    attributes: [],
                    where: (req.user.role === 'admin' && req.user.rayon_id) ? { rayon_id: req.user.rayon_id } : {}
                }],
                group: ['Jurusan.id', 'Jurusan.nama_jurusan', 'Jurusan.kode_jurusan'],
                raw: true
            };

            // Jika role-nya Super Admin, kita gunakan LEFT JOIN agar jurusan yang tidak punya siswa tetap muncul angka 0
            if (req.user.role === 'super_admin') {
                queryOptions.include[0].required = false; 
            }

            const siswaPerJurusanRaw = await Jurusan.findAll(queryOptions);

            // Bersihkan format data angka agar bisa dibaca dengan baik oleh Recharts Frontend
            const siswaPerJurusan = siswaPerJurusanRaw.map(item => ({
                nama_jurusan: item.nama_jurusan,
                kode_jurusan: item.kode_jurusan || item.nama_jurusan,
                total: parseInt(item.total) || 0
            }));

            const siswaPerStatus = [
                { status: 'Pending',  total: pendingCount  },
                { status: 'Approved', total: approvedCount },
                { status: 'Rejected', total: rejectedCount },
            ];

            return res.status(200).json(response(200, "Success", {
                totalSiswa, totalJurusan,
                pendingCount, approvedCount, rejectedCount,
                siswaPerJurusan, siswaPerStatus,
            }));
        } catch (error) {
            console.error('Dashboard error:', error);
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    }
};