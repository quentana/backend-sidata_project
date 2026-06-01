const Validator = require("fastest-validator");
const v = new Validator();
const path = require('path');
const fs = require('fs');
const { Jurusan } = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {

    getJurusan: async (req, res) => {
        try {

            const jurusan = await Jurusan.findAll({
                order: [["createdAt", "DESC"]]
            });

            return res.status(200).json(response(200, "Success", jurusan));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    createJurusan: async (req, res) => {
        try {
            const { nama_jurusan, kode_jurusan } = req.body;
            // VALIDASI
            const schema = {
                nama_jurusan: {type: "string",min: 3},
                kode_jurusan: {type: "string",min: 2}
            };

            const data = {
                nama_jurusan,
                kode_jurusan
            };

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(
                    response(400, "Validation Error", validate)
                );
            }
            
            // Create Data
            const jurusan = await Jurusan.create(data);
            return res.status(201).json(response(201, "Jurusan berhasil ditambahkan", jurusan));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    showJurusan: async (req, res) => {
        try {
            const { id } = req.params;
            const jurusan = await Jurusan.findByPk(id);
            if (!jurusan) {
                return res.status(404).json(response(404, "Jurusan tidak ditemukan"));
            }

            return res.status(200).json(response(200, "Success", jurusan));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message)); 
        }
    },


    updateJurusan: async (req, res) => {
        try {
            const { id } = req.params;
            const { nama_jurusan, kode_jurusan } = req.body;

            // Validasi
            const schema = {
                nama_jurusan: {type: "string",min: 3},
                kode_jurusan: {type: "string",min: 2}
            };
            const data = {nama_jurusan,kode_jurusan};
            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate));
            }

            // Cek Data
            const jurusan = await Jurusan.findByPk(id);
            if (!jurusan) {
                return res.status(404).json(response(404, "Jurusan tidak ditemukan"));
            }
            // Update
            await Jurusan.update(data, {
                where: { id }
            });
            const newJurusan = await Jurusan.findByPk(id);   // Mengambil data Baru
            return res.status(200).json(response(200, "Jurusan berhasil diperbarui", newJurusan));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },


    deleteJurusan: async (req, res) => {
        try {
            const { id } = req.params;
            const jurusan = await Jurusan.findByPk(id);
            if (!jurusan) {
                return res.status(404).json(response(404, "Jurusan tidak ditemukan"));
            }

            await Jurusan.destroy({
                where: { id }
            });
            return res.status(200).json( response(200, "Jurusan berhasil dihapus"));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    }

};