const { Approved, DataSiswa, Jurusan, Rayon, Romble, User } = require('../models');
const { Op } = require('sequelize');
const { response } = require('../helpers/response.formatter');

const includeSiswa = [
    { model: DataSiswa, as: 'siswa', include: [
        { model: Jurusan, as: 'jurusan', attributes: ['id','nama_jurusan'] },
        { model: Rayon,   as: 'rayon',   attributes: ['id','nama_rayon']  },
        { model: Romble,  as: 'romble',  attributes: ['id','nama_romble'] },
    ]},
];

module.exports = {
    getAll: async (req, res) => {
        try {
            const where = {};
            if (req.user.role === 'admin' && req.user.rayon_id) {
                const rows = await DataSiswa.findAll({ where: { rayon_id: req.user.rayon_id }, attributes: ['id'] });
                const ids  = rows.map(s => s.id);
                where.siswa_id = { [Op.in]: ids.length ? ids : [0] };
            }
            const data = await Approved.findAll({ where, include: includeSiswa, order: [['createdAt','DESC']] });
            return res.status(200).json(response(200, "Success", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    updateStatus: async (req, res) => {
        try {
            const { status, catatan } = req.body;
            const data = await Approved.findByPk(req.params.id);
            if (!data) return res.status(404).json(response(404,"Not Found","Data tidak ditemukan."));
            await data.update({ status, catatan, admin_id: req.user.id });
            return res.status(200).json(response(200, "Success", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    getStatusBySiswa: async (req, res) => {
        try {
            const data = await Approved.findOne({ where: { siswa_id: req.params.siswa_id } });
            return res.status(200).json(response(200, "Success", data || { status: 'belum_mengajukan' }));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },
};
