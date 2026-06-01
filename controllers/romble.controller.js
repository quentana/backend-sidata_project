const Validator = require("fastest-validator");
const v = new Validator();
const { Romble } = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {

    getRomble: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const search = req.query.search || "";
            const isFetchAll = req.query.all === "true"; // <=== TAMBAHKAN INI (Cek apakah minta semua data)
            const offset = (Number(page) - 1) * Number(limit);
            const { Op } = require("sequelize");

            // Buat objek query Sequelize standar
            const queryOptions = {
                where: {
                    [Op.or]: [
                        { nama_romble: { [Op.like]: `%${search}%` } },
                        { kode_romble: { [Op.like]: `%${search}%` } }
                    ]
                },
                order: [["createdAt", "DESC"]],
                distinct: true
            };

            
            if (!isFetchAll) {  //jika tidak meminta semua data, pasang limit dan offset (Pagination Aktif)
                queryOptions.limit = Number(limit);
                queryOptions.offset = Number(offset);
            }

         
            //logika queryyOptions

            const { count, rows } = await Romble.findAndCountAll(queryOptions);
            const formatPagination = {
                data: rows, //array data konsisten di sini
                limit: isFetchAll ? rows.length : Number(limit),
                rows: rows.length > 0
                    ? isFetchAll ? `1-${rows.length}` : (Number(offset) + 1) + "-" + (Number(offset) + rows.length)
                    : "0-0",
                total: count,
                page: isFetchAll ? 1 : Number(page),
            };

            return res.status(200).json(response(200, "Success", formatPagination));
         
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },


    createRomble: async (req, res) => {
        try {
            const { nama_romble, kode_romble } = req.body;
            const schema = {
                nama_romble: { type: "string", min: 2 },
                kode_romble: { type: "string", min: 3 }
            };
            const validate = v.validate({ nama_romble, kode_romble }, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate));
            }
            const romble = await Romble.create({ nama_romble, kode_romble });
            return res.status(201).json(response(201, "Romble berhasil ditambahkan", romble));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    showRomble: async (req, res) => {
        try {
            const { id } = req.params;
            const romble = await Romble.findByPk(id);
            if (!romble) return res.status(404).json(response(404, "Romble tidak ditemukan"));
            return res.status(200).json(response(200, "Success", romble));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    updateRomble: async (req, res) => {
        try {
            const { id } = req.params;
            const { nama_romble, kode_romble } = req.body;
            const schema = {
                nama_romble: { type: "string", min: 2, optional: true },
                kode_romble: { type: "string", min: 3, optional: true }
            };
            const validate = v.validate({ nama_romble, kode_romble }, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate));
            }
            const romble = await Romble.findByPk(id);
            if (!romble) return res.status(404).json(response(404, "Romble tidak ditemukan"));
            await Romble.update({ nama_romble, kode_romble }, { where: { id } });
            const newRomble = await Romble.findByPk(id);
            return res.status(200).json(response(200, "Romble berhasil diperbarui", newRomble));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },


    deleteRomble: async (req, res) => {
        try {
            const { id } = req.params;
            const romble = await Romble.findByPk(id);
            if (!romble) return res.status(404).json(response(404, "Romble tidak ditemukan"));
            await Romble.destroy({ where: { id } });
            return res.status(200).json(response(200, "Romble berhasil dihapus"));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    }
};