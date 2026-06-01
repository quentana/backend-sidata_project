const jwt = require('jsonwebtoken');
const { auth_secret } = require('../config/base.config');
const { User, Rayon } = require('../models');
const { response } = require('../helpers/response.formatter');

module.exports = {

    checkToken: async (req, res, next) => {
        try {
            const authHeader = req.headers['authorization'];
            const token = authHeader && authHeader.split(' ')[1];
            if (!token) return res.status(401).json(response(401, "Unauthorized", "Token tidak ditemukan."));

            const decoded = jwt.verify(token, auth_secret);
            let user = null;
            try {
                user = await User.findByPk(decoded.id, {
                    attributes: ['id','name','email','role','rayon_id'],
                    include: [{ model: Rayon, as: 'rayon', attributes: ['id','nama_rayon'] }]
                });
            } catch (e) {
                //fallback jika kolom rayon_id belum ada (migration belum dijalankan)
                user = await User.findByPk(decoded.id, {
                    attributes: ['id','name','email','role']
                });
            }
            if (!user) return res.status(401).json(response(401, "Unauthorized", "User tidak ditemukan."));
            req.user = {
                id:       user.id,
                name:     user.name,
                email:    user.email,
                role:     user.role,
                rayon_id: user.rayon_id || null,
                rayon:    user.rayon    || null,
            };
            next();
        } catch (error) {
            return res.status(401).json(response(401, "Unauthorized", "Token tidak valid."));
        }
    }
};
