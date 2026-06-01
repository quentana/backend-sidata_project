const { response } = require('../helpers/response.formatter');

module.exports = {

    isAdmin: async (req, res, next) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json(response(403,"Forbidden","Akses ditolak. Hanya admin yang diizinkan."));
            }
            next();
        } catch (error) {
            return res.status(500).json(response(500,"Server Error",error.message));
        }
    },


    isUser: async (req, res, next) => {
        try {
            if (req.user.role !== 'user') {
                return res.status(403).json(response(403,"Forbidden","Akses ditolak. Hanya user yang diizinkan."));
            }
            next();
        } catch (error) {
            return res.status(500).json(response(500,"Server Error",error.message));
        }
    },

    isSuperAdmin: async (req, res, next) => {
        try {
            if (req.user.role !== 'super_admin') {
                return res.status(403).json(response(403,"Forbidden","Akses ditolak. Hanya super admin yang diizinkan."));
            }
            next();
        } catch (error) {
            return res.status(500).json(response(500,"Server Error",error.message));
        }
    },

    isAdminOrSuperAdmin: async (req, res, next) => {
        try {
            if (
                req.user.role !== 'admin' &&
                req.user.role !== 'super_admin'
            ) {
                return res.status(403).json(response(403,"Forbidden","Akses ditolak."));
            }
            next();
        } catch (error) {
            return res.status(500).json(response(500,"Server Error",error.message));
        }
    }
};