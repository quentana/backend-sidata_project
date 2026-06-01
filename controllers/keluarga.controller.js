const Validator = require("fastest-validator");
const v = new Validator();

const { DataKeluarga, DataAyah, DataIbu, DataWali, sequelize } = require("../models");
const { response } = require("../helpers/response.formatter");

const cleanData = (obj) => {
    if (!obj || typeof obj !== "object") return obj;
    let cleaned = { ...obj };
    for (let key in cleaned) {
        if (cleaned[key] === "") {
            cleaned[key] = null;
        }
    }
    return cleaned;
};

module.exports = {

    getBySiswa: async (req, res) => {
        try {
            const { siswa_id } = req.params;
            const data = await DataKeluarga.findOne({
                where: { siswa_id },
                include: [
                    { model: DataAyah, as: "ayah" },
                    { model: DataIbu, as: "ibu" },
                    { model: DataWali, as: "wali" }
                ]
            });
            if (!data) {
                return res.status(404).json(response(404, "Data keluarga belum diisi"));
            }
            return res.status(200).json(response(200, "Success", data));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    createKeluarga: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const siswa_id = Number(req.body.siswa_id);

            let keluarga = null;
            let ayah = null;
            let ibu = null;
            let wali = null;

            try {
                keluarga = req.body.keluarga ? (typeof req.body.keluarga === 'object' ? cleanData(req.body.keluarga) : cleanData(JSON.parse(req.body.keluarga))) : null;
                ayah = req.body.ayah ? (typeof req.body.ayah === 'object' ? cleanData(req.body.ayah) : cleanData(JSON.parse(req.body.ayah))) : null;
                ibu = req.body.ibu ? (typeof req.body.ibu === 'object' ? cleanData(req.body.ibu) : cleanData(JSON.parse(req.body.ibu))) : null;
                wali = req.body.wali ? (typeof req.body.wali === 'object' ? cleanData(req.body.wali) : cleanData(JSON.parse(req.body.wali))) : null;
            } catch (jsonError) {
                await t.rollback();
                return res.status(400).json(response(400, "Validation Error", "Format JSON tidak valid"));
            }

            const schema = { siswa_id: { type: "number", positive: true, integer: true } };
            const data = { siswa_id: siswa_id };
            const validate = v.validate(data, schema);
            if (validate.length > 0) {
                await t.rollback();
                return res.status(400).json(response(400, "Validation Error", validate));
            }

            const dataKeluarga = await DataKeluarga.create(
                { siswa_id: data.siswa_id, ...keluarga },
                { transaction: t }
            );

            if (ayah && ayah.nama_ayah) await DataAyah.create({ keluarga_id: dataKeluarga.id, ...ayah }, { transaction: t });
            if (ibu && ibu.nama_ibu) await DataIbu.create({ keluarga_id: dataKeluarga.id, ...ibu }, { transaction: t });
            if (wali && wali.nama_wali) await DataWali.create({ keluarga_id: dataKeluarga.id, ...wali }, { transaction: t });

            await t.commit();

            const newData = await DataKeluarga.findOne({
                where: { id: dataKeluarga.id },
                include: [
                    { model: DataAyah, as: "ayah" },
                    { model: DataIbu, as: "ibu" },
                    { model: DataWali, as: "wali" }
                ]
            });
            return res.status(201).json(response(201, "Data keluarga berhasil ditambahkan", newData));
        } catch (error) {
            await t.rollback();
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    updateKeluarga: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;

            let keluarga = null;
            let ayah = null;
            let ibu = null;
            let wali = null;

            try {
                // PERBAIKAN DI SINI: Samakan dengan metode create untuk deteksi object/string secara aman
                keluarga = req.body.keluarga ? (typeof req.body.keluarga === 'object' ? cleanData(req.body.keluarga) : cleanData(JSON.parse(req.body.keluarga))) : null;
                ayah = req.body.ayah ? (typeof req.body.ayah === 'object' ? cleanData(req.body.ayah) : cleanData(JSON.parse(req.body.ayah))) : null;
                ibu = req.body.ibu ? (typeof req.body.ibu === 'object' ? cleanData(req.body.ibu) : cleanData(JSON.parse(req.body.ibu))) : null;
                wali = req.body.wali ? (typeof req.body.wali === 'object' ? cleanData(req.body.wali) : cleanData(JSON.parse(req.body.wali))) : null;
            } catch (jsonError) {
                await t.rollback();
                return res.status(400).json(response(400, "Validation Error", "Format JSON tidak valid"));
            }

            const dataKeluarga = await DataKeluarga.findByPk(id);
            if (!dataKeluarga) {
                await t.rollback();
                return res.status(404).json(response(404, "Data keluarga tidak ditemukan"));
            }

            if (keluarga) await dataKeluarga.update(keluarga, { transaction: t });

            //  Cek nama_ayah sebelum update/create relasi
            if (ayah && ayah.nama_ayah) {
                const [dataAyah] = await DataAyah.findOrCreate({
                    where: { keluarga_id: dataKeluarga.id },
                    defaults: { keluarga_id: dataKeluarga.id },
                    transaction: t
                });
                await dataAyah.update(ayah, { transaction: t });
            }

            //  Cek nama_ibu sebelum update/create relasi
            if (ibu && ibu.nama_ibu) {
                const [dataIbu] = await DataIbu.findOrCreate({
                    where: { keluarga_id: dataKeluarga.id },
                    defaults: { keluarga_id: dataKeluarga.id },
                    transaction: t
                });
                await dataIbu.update(ibu, { transaction: t });
            }

            //  Cek nama_wali sebelum update/create relasi
            if (wali && wali.nama_wali) {
                const [dataWali] = await DataWali.findOrCreate({
                    where: { keluarga_id: dataKeluarga.id },
                    defaults: { keluarga_id: dataKeluarga.id },
                    transaction: t
                });
                await dataWali.update(wali, { transaction: t });
            }
            await t.commit();
            const newData = await DataKeluarga.findByPk(id, {
                include: [
                    { model: DataAyah, as: "ayah" },
                    { model: DataIbu, as: "ibu" },
                    { model: DataWali, as: "wali" }
                ]
            });
            return res.status(200).json(response(200, "Data keluarga berhasil diperbarui", newData));
        } catch (error) {
            await t.rollback();
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

 
    deleteKeluarga: async (req, res) => {
        const t = await sequelize.transaction();
        try {
            const { id } = req.params;
            const dataKeluarga = await DataKeluarga.findByPk(id);
            if (!dataKeluarga) {
                await t.rollback();
                return res.status(404).json(response(404, "Data keluarga tidak ditemukan"));
            }
            await DataAyah.destroy({ where: { keluarga_id: id }, transaction: t });
            await DataIbu.destroy({ where: { keluarga_id: id }, transaction: t });
            await DataWali.destroy({ where: { keluarga_id: id }, transaction: t });
            await dataKeluarga.destroy({ transaction: t });
            await t.commit();
            return res.status(200).json(response(200, "Data keluarga berhasil dihapus"));
        } catch (error) {
            await t.rollback();
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    }

};