const Validator = require("fastest-validator");
const v = new Validator();
const path = require('path');
const fs = require('fs');
const { Dokumen } = require('../models');
const { response } = require('../helpers/response.formatter');

module.exports = {

  
    uploadDokumen: async (req, res) => {
        try {
            const { siswa_id, jenis_dokumen } = req.body;
            // VALIDASI
            const schema = {
                siswa_id: { type: "number", positive: true, integer: true },
                jenis_dokumen: { type: "string", min: 3 }
            };

            const data = {
                siswa_id: Number(siswa_id),
                jenis_dokumen
            };

            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate));
            }
            // CEK FILE
            if (!req.file) {
                return res.status(400).json(response(400, "Validation Error", "File tidak ditemukan"));
            }

            // CEK DOKUMEN LAMA
            const existing = await Dokumen.findOne({
                where: {
                    siswa_id: data.siswa_id,
                    jenis_dokumen: data.jenis_dokumen
                }
            });

            // HAPUS FILE LAMA
            if (existing) {
                const oldFile = existing.getDataValue('path_file');
                const oldPath = path.join(
                    __dirname,
                    '../uploads',
                    oldFile
                );
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
                await existing.destroy();
            }

            // SIMPAN DATA
            const dokumen = await Dokumen.create({
                siswa_id: data.siswa_id,
                jenis_dokumen: data.jenis_dokumen,
                nama_file: req.file.originalname,
                path_file: req.file.filename,
            });
            return res.status(201).json(response(201, "Created", dokumen));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },


    getDokumenBySiswa: async (req, res) => {
        try {
            const { siswa_id } = req.params;
            const dokumen = await Dokumen.findAll({
                where: {
                    siswa_id
                }
            });
            return res.status(200).json(response(200, "Success", dokumen));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },


    deleteDokumen: async (req, res) => {
        try {
            const { id } = req.params;
            const dokumen = await Dokumen.findByPk(id);
            if (!dokumen) {
                return res.status(404).json(response(404, "Dokumen tidak ditemukan"));
            }
            // ambil nama file asli
            const fileName = dokumen.getDataValue('path_file');
            const filePath = path.join(
                __dirname,
                '../uploads',
                fileName
            );
            // hapus file
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }

            // hapus database
            await Dokumen.destroy({
                where: { id }
            });
            return res.status(200).json(response(200, "Deleted"));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    }
};