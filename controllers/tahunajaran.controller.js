const { TahunAjaran } = require('../models');
const { response } = require('../helpers/response.formatter');

module.exports = {

    getAll: async (req, res) => {
        try {
            const data = await TahunAjaran.findAll({ order: [['createdAt','DESC']] });
            return res.status(200).json(response(200, "Success", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    getOne: async (req, res) => {
        try {
            const data = await TahunAjaran.findByPk(req.params.id);
            if (!data) return res.status(404).json(response(404,"Not Found","Data tidak ditemukan"));
            return res.status(200).json(response(200, "Success", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    create: async (req, res) => {
        try {
            const { nama, tanggal_mulai, tanggal_selesai, is_active } = req.body;
            if (!nama)            return res.status(400).json(response(400,"Validation Error","Nama wajib diisi"));
            if (!tanggal_mulai)   return res.status(400).json(response(400,"Validation Error","Tanggal mulai wajib diisi"));
            if (!tanggal_selesai) return res.status(400).json(response(400,"Validation Error","Tanggal selesai wajib diisi"));
            const aktif = is_active === true || is_active === 'true';
            const data = await TahunAjaran.create({ nama: nama.trim(), tanggal_mulai, tanggal_selesai, is_active: aktif });
            return res.status(201).json(response(201, "Created", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    update: async (req, res) => {
        try {
            const data = await TahunAjaran.findByPk(req.params.id);
            if (!data) return res.status(404).json(response(404,"Not Found","Data tidak ditemukan"));
            const { nama, tanggal_mulai, tanggal_selesai, is_active } = req.body;
            const aktif = is_active === true || is_active === 'true';
            await data.update({ nama: nama||data.nama, tanggal_mulai: tanggal_mulai||data.tanggal_mulai, tanggal_selesai: tanggal_selesai||data.tanggal_selesai, is_active: aktif });
            return res.status(200).json(response(200, "Updated", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },
    
    destroy: async (req, res) => {
        try {
            const data = await TahunAjaran.findByPk(req.params.id);
            if (!data) return res.status(404).json(response(404,"Not Found","Data tidak ditemukan"));
            await data.destroy();
            return res.status(200).json(response(200, "Deleted", "Berhasil dihapus"));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },
};
