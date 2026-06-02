'use strict';
const Validator    = require("fastest-validator");
const v            = new Validator();
const passwordHash = require('password-hash');
const jwt          = require('jsonwebtoken');
const { User, Rayon } = require('../models');
const { auth_secret } = require('../config/base.config');
const { response }    = require('../helpers/response.formatter');
const { Op } = require("sequelize");

const includeRayon = [{ model: Rayon, as: 'rayon', attributes: ['id', 'nama_rayon'] }];

module.exports = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json(response(400, "Validation Error", "Email dan password wajib diisi"));
            }

            const user = await User.findOne({ where: { email }, include: includeRayon });
            if (!user) {
                return res.status(404).json(response(404, "Not Found", "Email tidak ditemukan."));
            }

            if (!passwordHash.verify(password, user.password)) {
                return res.status(401).json(response(401, "Unauthorized", "Password salah."));
            }

            const token = jwt.sign(
                { id: user.id, name: user.name, email: user.email, role: user.role, rayon_id: user.rayon_id || null },
                auth_secret,
                { expiresIn: '24h' }
            );

            return res.status(200).json(response(200, "Success", {
                token,
                user: {
                    id:       user.id,
                    name:     user.name,
                    email:    user.email,
                    role:     user.role,
                    rayon_id: user.rayon_id || null,
                    rayon:    user.rayon    || null,
                }
            }));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    profile: async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: includeRayon
        });

        if (!user) {
            return res.status(404).json(
                response(404, "Not Found", "User tidak ditemukan.")
            );
        }
        return res.status(200).json(response(200, "Success", user));
    } catch (error) {
        return res.status(500).json(response(500, "Server Error", error.message));
    }
},
    createUser: async (req, res) => {
        try {
            const { name, email, password, role, rayon_id } = req.body;
            
            if (!name || !email || !password) {
                return res.status(400).json(response(400, "Validation Error", "Nama, email, dan password wajib diisi"));
            }

            const allowedRoles = ['user', 'admin', 'super_admin'];
            const assignedRole = role && allowedRoles.includes(role) ? role : 'user';

            const existing = await User.findOne({ where: { email } });
            if (existing) {
                return res.status(400).json(response(400, "Validation Error", "Email sudah terdaftar."));
            }

            let finalRayonId = null;
            if ((assignedRole === 'admin' || assignedRole === 'user') && rayon_id) {
                finalRayonId = parseInt(rayon_id, 10);
                if (isNaN(finalRayonId)) finalRayonId = null;
            }

            
            
            if (assignedRole === 'admin' && finalRayonId) { // pastikan Rayon tersebut belum memiliki pembimbing lain.
                const rayonHasPembimbing = await User.findOne({ 
                    where: { rayon_id: finalRayonId, role: 'admin' } 
                });
                if (rayonHasPembimbing) {
                    return res.status(400).json(response(400, "Validation Error", "Rayon ini sudah memiliki Pembimbing (Admin)."));
                }
            }

            const user = await User.create({
                name, 
                email,
                password: passwordHash.generate(password),
                role: assignedRole,
                rayon_id: finalRayonId,
            });

            const userWithRayon = await User.findByPk(user.id, {
                attributes: { exclude: ['password'] },
                include: includeRayon
            });

            return res.status(201).json(response(201, "Created", userWithRayon));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

   getAllUsers: async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const search = req.query.search || "";
        const isFetchAll = req.query.all === "true";
        const offset = (Number(page) - 1) * Number(limit);

        const queryOptions = {
            where: {
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${search}%`
                        }
                    },
                    {
                        email: {
                            [Op.like]: `%${search}%`
                        }
                    }
                ]
            },
            attributes: {
                exclude: ["password"]
            },
            include: includeRayon,
            order: [["createdAt", "DESC"]],
            distinct: true
        };

        if (!isFetchAll) {
            queryOptions.limit = Number(limit);
            queryOptions.offset = Number(offset);
        }

        const { count, rows } = await User.findAndCountAll(queryOptions);

        const formatPagination = {
            data: rows,
            limit: isFetchAll ? rows.length : Number(limit),
            rows: rows.length > 0
                ? isFetchAll
                    ? `1-${rows.length}`
                    : `${Number(offset) + 1}-${Number(offset) + rows.length}`
                : "0-0",
            total: count,
            page: isFetchAll ? 1 : Number(page),
            totalPages: isFetchAll
                ? 1
                : Math.ceil(count / Number(limit))
        };
        return res.status(200).json(response(200, "Success", formatPagination));
    } catch (error) {
        return res.status(500).json(response(500, "Server Error", error.message));
    }
},

    updateUser: async (req, res) => {
        try {
            const { name, email, password, role, rayon_id } = req.body;
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json(response(404, "Not Found", "User tidak ditemukan."));

            const updateData = {};
            if (name)     updateData.name  = name;
            if (email)    updateData.email = email;
            if (role)     updateData.role  = role;
            if (password) updateData.password = passwordHash.generate(password);

            const finalRole = role || user.role;
            
            if (finalRole === 'admin' || finalRole === 'user') {
                const targetRayonId = rayon_id ? parseInt(rayon_id, 10) : null;
                
               
                if (finalRole === 'admin' && targetRayonId) {  //  Jika mengubah/menetapkan rayon untuk Admin
                    const rayonHasPembimbing = await User.findOne({ 
                        where: { rayon_id: targetRayonId, role: 'admin' } 
                    });
                    
                    if (rayonHasPembimbing && rayonHasPembimbing.id !== user.id) { // Jika rayon diisi admin lain DAN bukan milik user ini sendiri
                        return res.status(400).json(response(400, "Validation Error", "Rayon ini sudah memiliki Pembimbing lain."));
                    }
                }
                updateData.rayon_id = targetRayonId;
            } else {
                updateData.rayon_id = null;
            }

            await user.update(updateData);
            const updated = await User.findByPk(user.id, { 
                attributes: { exclude: ['password'] }, 
                include: includeRayon 
            });
            return res.status(200).json(response(200, "Success", updated));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    },

    deleteUser: async (req, res) => {
        try {
            const user = await User.findByPk(req.params.id);
            if (!user) return res.status(404).json(response(404, "Not Found", "User tidak ditemukan."));
            if (user.id === req.user.id) {
                return res.status(400).json(response(400, "Bad Request", "Tidak bisa menghapus akun sendiri."));
            }
            await user.destroy();
            return res.status(200).json(response(200, "Success", "User berhasil dihapus."));
        } catch (error) {
            return res.status(500).json(response(500, "Server Error", error.message));
        }
    }
};