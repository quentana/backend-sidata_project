const Validator = require("fastest-validator");
const v = new Validator();
const passwordHash = require('password-hash');
const { Rayon, User } = require("../models");
const { response } = require("../helpers/response.formatter");

module.exports = {

    getRayon: async (req, res) => {
        try {
            const page = req.query.page || 1;
            const limit = req.query.limit || 10;
            const search = req.query.search || "";
            const isFetchAll = req.query.all === "true";
            const offset = (Number(page) - 1) * Number(limit);
            const { Op } = require("sequelize");

            const queryOptions = {
                where: {
                    nama_rayon: {
                        [Op.like]: `%${search}%`
                    }
                },
                include: [
                    {
                        model: User,
                        as: "pembimbing",
                        where: { role: "admin" },
                        required: false,
                        attributes: ["id", "name", "email"]
                    }
                ],
                order: [["createdAt", "DESC"]],
                distinct: true
            };

            if (!isFetchAll) {
                queryOptions.limit = Number(limit);
                queryOptions.offset = Number(offset);
            }

            const { count, rows } = await Rayon.findAndCountAll(queryOptions);

            const formatPagination = {
                data: rows,
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

    createRayon: async (req, res) => {
        try {
            const { nama_rayon, nama_pembimbing } = req.body;
            // Validasi dasar
            if (!nama_rayon) {
                return res.status(400).json({ message: "Nama rayon wajib diisi" });
            }
            const newRayon = await Rayon.create({ nama_rayon });  // Buat rayon baru
            if (nama_pembimbing) {    //Jika nama pembimbing diketik, otomatis daftarkan sebagai User baru dengan role 'admin'
                const emailOtomatis = nama_pembimbing
                    .toLowerCase()
                    .replace(/\s+/g, '')          // hapus semua spasi
                    .replace(/[^a-z0-9]/g, '')     // hapus karakter spesial jika ada
                    + '@sidata.com';

                // Cek duplikasi email di database terlebih dahulu agar tidak crash
                const existingEmail = await User.findOne({ where: { email: emailOtomatis } });
                if (existingEmail) {
                    return res.status(400).json({ message: `Gagal membuat akun pembimbing. Email ${emailOtomatis} sudah terdaftar di sistem.` });
                }

                await User.create({    // buat user pembimbing baru
                    name: nama_pembimbing,
                    email: emailOtomatis, // sekarang field email terisi otomatis
                    // gunakan passwordHash.generate jika kamu memakai library password-hash saat login
                    password: passwordHash.generate('password123'),
                    role: 'admin',
                    rayon_id: newRayon.id
                });
            }
            return res.status(201).json({ message: 'Rayon dan Akun Pembimbing (Admin) berhasil ditambahkan', data: newRayon });
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },


    showRayon: async (req, res) => {
        try {
            const { id } = req.params;
            const rayon = await Rayon.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'pembimbing',
                        where: { role: 'admin' },
                        required: false,
                        attributes: ['id', 'name', 'email']
                    }
                ]
            });
            if (!rayon) {
                return res.status(404).json(response(404, "Rayon tidak ditemukan"));
            }
            return res.status(200).json(response(200, "Success", rayon));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },


    updateRayon: async (req, res) => {
        try {
            const { id } = req.params;
            const { nama_rayon, nama_pembimbing, email_pembimbing, user_id } = req.body;

            const rayon = await Rayon.findByPk(id);
            if (!rayon) return res.status(404).json(response(404, "Rayon tidak ditemukan"));


            const schema = { //Validasi input skema
                nama_rayon: { type: "string", min: 2, max: 50, optional: true },
                nama_pembimbing: { type: "string", optional: true },
                email_pembimbing: { type: "email", optional: true },
                user_id: { type: "number", convert: true, optional: true }
            };

            const validate = v.validate(req.body, schema);
            if (validate.length > 0) {
                return res.status(400).json(response(400, "Validation Error", validate));
            }
            if (nama_rayon) {   // update  nama rayon (jika dikirimkan)
                // Pastikan nama rayon baru tidak bentrok dengan rayon lain
                const duplicateCheck = await Rayon.findOne({ where: { nama_rayon } });
                if (duplicateCheck && duplicateCheck.id !== Number(id)) {
                    return res.status(400).json(response(400, "Validation Error", "Nama rayon sudah digunakan"));
                }
                await Rayon.update({ nama_rayon }, { where: { id } });
            }

            // Menghubungkaan Rayon ke Akun Admin yang sudah terdaftar cia `user_id`
            if (user_id) {
                const targetAdmin = await User.findOne({ where: { id: user_id, role: 'admin' } });
                if (!targetAdmin) return res.status(404).json(response(404, "Admin tidak ditemukan"));

                // aturan Satu Rayon Satu Pembimbing: Lepas pembimbing lama di rayon ini (jika ada)
                await User.update({ rayon_id: null }, { where: { rayon_id: id, role: 'admin' } });

                // sambungkan admin terpilih ke rayon ini
                await targetAdmin.update({ rayon_id: id });
            }

            // mengubah profile pembimbing baru/lama via text input
            else if (nama_pembimbing) {
                const existingUser = await User.findOne({ where: { rayon_id: id, role: 'admin' } });

                if (existingUser) {
                    const updatePayload = {   // update data pembimbing lama
                        name: nama_pembimbing,
                        username: nama_pembimbing.toLowerCase().replace(/\s+/g, '')
                    };
                    if (email_pembimbing) updatePayload.email = email_pembimbing;

                    await User.update(updatePayload, { where: { id: existingUser.id } });
                } else {
                    // jika belum ada pembimbing di rayon ini, buat baru (Wajib Email!)
                    if (!email_pembimbing) {
                        return res.status(400).json(response(400, "Validation Error", "Email pembimbing baru wajib diisi"));
                    }
                    await User.create({
                        name: nama_pembimbing,
                        username: nama_pembimbing.toLowerCase().replace(/\s+/g, ''),
                        email: email_pembimbing,
                        password: passwordHash.generate('password123'),
                        role: 'admin',
                        rayon_id: id
                    });
                }
            }
            return res.status(200).json(response(200, "Rayon berhasil diperbarui"));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },


    deleteRayon: async (req, res) => {
        try {
            const { id } = req.params;
            const rayon = await Rayon.findByPk(id);

            if (!rayon) {
                return res.status(404).json(response(404, "Rayon tidak ditemukan"));
            }
            //hapus user pembimbing (role admin) yang terikat dengan rayon ini
            await User.destroy({
                where: {
                    rayon_id: id,
                    role: 'admin' //memastikan hanya pembimbing yang dihapus, bukan siswa (role: user) jika ada
                }
            });
            //jika ada user dengan role 'user' (siswa) di rayon ini, set rayon_id mereka menjadi null
            await User.update(
                { rayon_id: null },
                { where: { rayon_id: id, role: 'user' } }
            );
            //hapus data Rayon
            await Rayon.destroy({ where: { id } });
            return res.status(200).json(response(200, "Rayon dan Akun Pembimbing berhasil dihapus"));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    }
};