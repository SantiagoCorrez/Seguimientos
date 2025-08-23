function checkRole(roles) {
    return (req, res, next) => {
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ error: 'Acceso denegado. No se encontraron roles.' });
        }

        const userRoles = req.user.roles;
        const hasRole = roles.some(role => userRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({ error: 'Acceso denegado. No tienes permiso para esta acción.' });
        }

        next();
    };
}

module.exports = checkRole;
