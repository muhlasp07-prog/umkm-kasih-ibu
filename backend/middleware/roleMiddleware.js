module.exports = function(allowedRoles) {
    return function(req, res, next) {
        if (!req.user || allowedRoles.indexOf(req.user.role) === -1) {
            return res.status(403).json({ message: 'Anda tidak memiliki akses untuk aksi ini' });
        }
        next();
    };
};