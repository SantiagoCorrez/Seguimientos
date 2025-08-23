const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

// Middleware para todas las rutas de este archivo
router.use(verifyToken);
router.use(checkRole(['Administrador']));

// Obtener todos los roles
router.get('/roles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM roles ORDER BY id');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener roles:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Obtener todos los usuarios con sus roles
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.nombre, u.email, u.fecha_creacion, array_agg(r.nombre) as roles
            FROM usuarios u
            LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
            LEFT JOIN roles r ON ur.rol_id = r.id
            GROUP BY u.id
            ORDER BY u.id;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener usuarios:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Actualizar un usuario
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre, email } = req.body;

    if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son obligatorios.' });
    }

    try {
        const query = 'UPDATE usuarios SET nombre = $1, email = $2 WHERE id = $3 RETURNING *';
        const result = await pool.query(query, [nombre, email, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar usuario:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Asignar un rol a un usuario
router.post('/:id/roles', async (req, res) => {
    const { id } = req.params;
    const { rol_id } = req.body;

    if (!rol_id) {
        return res.status(400).json({ error: 'El rol_id es obligatorio.' });
    }

    try {
        // Verificar que el usuario y el rol existen
        const userExists = await pool.query('SELECT * FROM usuarios WHERE id = $1', [id]);
        if (userExists.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        const roleExists = await pool.query('SELECT * FROM roles WHERE id = $1', [rol_id]);
        if (roleExists.rows.length === 0) {
            return res.status(404).json({ message: 'Rol no encontrado.' });
        }

        const query = 'INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2) ON CONFLICT DO NOTHING RETURNING *';
        const result = await pool.query(query, [id, rol_id]);
        res.status(201).json({ message: 'Rol asignado correctamente.', data: result.rows[0] });
    } catch (err) {
        console.error('Error al asignar rol:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Eliminar un rol de un usuario
router.delete('/:id/roles', async (req, res) => {
    const { id } = req.params;
    const { rol_id } = req.body;

    if (!rol_id) {
        return res.status(400).json({ error: 'El rol_id es obligatorio.' });
    }

    try {
        const query = 'DELETE FROM usuario_roles WHERE usuario_id = $1 AND rol_id = $2 RETURNING *';
        const result = await pool.query(query, [id, rol_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'La asignación de rol no fue encontrada.' });
        }
        res.status(200).json({ message: 'Rol eliminado correctamente.' });
    } catch (err) {
        console.error('Error al eliminar rol:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;
