const { Semester, TahunAjaran } = require('../models');
const { response } = require('../helpers/response.formatter');

module.exports = {
    
    getAll: async (req, res) => {
        try {
            const data = await Semester.findAll({
                include: [{ model: TahunAjaran, as: 'tahunajaran', attributes: ['id','nama'] }],
                order: [['createdAt','DESC']]
            });
            return res.status(200).json(response(200, "Success", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    getOne: async (req, res) => {
        try {
            const data = await Semester.findByPk(req.params.id, {
                include: [{ model: TahunAjaran, as: 'tahunajaran', attributes: ['id','nama'] }]
            });
            if (!data) return res.status(404).json(response(404,"Not Found","Data tidak ditemukan"));
            return res.status(200).json(response(200, "Success", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    create: async (req, res) => {
        try {
            const { tahun_ajaran_id, nama, is_active } = req.body;
            if (!tahun_ajaran_id) return res.status(400).json(response(400,"Validation Error","Tahun ajaran wajib dipilih"));
            if (!nama)            return res.status(400).json(response(400,"Validation Error","Nama semester wajib diisi"));
            if (!['Ganjil','Genap','ganjil','genap'].includes(nama))
                return res.status(400).json(response(400,"Validation Error","Nama semester harus Ganjil atau Genap"));
            const aktif = is_active === true || is_active === 'true';
            const data = await Semester.create({ tahun_ajaran_id: Number(tahun_ajaran_id), nama, is_active: aktif });
            return res.status(201).json(response(201, "Created", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    update: async (req, res) => {
        try {
            const data = await Semester.findByPk(req.params.id);
            if (!data) return res.status(404).json(response(404,"Not Found","Data tidak ditemukan"));
            const { tahun_ajaran_id, nama, is_active } = req.body;
            const aktif = is_active === true || is_active === 'true';
            await data.update({
                tahun_ajaran_id: Number(tahun_ajaran_id)||data.tahun_ajaran_id,
                nama: nama||data.nama,
                is_active: aktif,
            });
            return res.status(200).json(response(200, "Updated", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    destroy: async (req, res) => {
        try {
            const data = await Semester.findByPk(req.params.id);
            if (!data) return res.status(404).json(response(404,"Not Found","Data tidak ditemukan"));
            await data.destroy();
            return res.status(200).json(response(200, "Deleted", "Berhasil dihapus"));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },
};
