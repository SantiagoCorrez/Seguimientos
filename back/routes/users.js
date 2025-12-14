const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');
const bcrypt = require('bcryptjs')
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

// Obtener todos los usuarios con sus roles y secretarías
router.get('/', async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id, 
                u.nombre, 
                u.email, 
                u.fecha_creacion, 
                u.secretaria_id,
                s.nombre as secretaria_nombre,
                array_agg(r.nombre) as roles
            FROM usuarios u
            LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
            LEFT JOIN roles r ON ur.rol_id = r.id
            LEFT JOIN secretarias s ON u.secretaria_id = s.id
            GROUP BY u.id, s.nombre
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
    const { nombre, email, password, secretaria_id } = req.body; // Añadir secretaria_id

    if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son obligatorios.' });
    }

    try {
        let query, params;
        // Sentencia base
        let updateFields = ['nombre = $1', 'email = $2', 'secretaria_id = $3'];
        params = [nombre, email, secretaria_id];

        // Si se proporciona una nueva contraseña, hashearla y añadirla a la consulta
        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            updateFields.push(`password = $${params.length + 1}`);
            params.push(hashedPassword);
        }

        // Construir la consulta final
        query = `UPDATE usuarios SET ${updateFields.join(', ')} WHERE id = $${params.length + 1} RETURNING *`;
        params.push(id);

        const result = await pool.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar usuario:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
// Eliminar un usuario
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM usuarios WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Usuario no encontrado.' });
        }
        res.status(200).json({ message: 'Usuario eliminado correctamente.' });
    } catch (err) {
        console.error('Error al eliminar usuario:', err.message);
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
// Crear un usuario
router.post('/', async (req, res) => {
    const { nombre, email, password, secretaria_id } = req.body; // Añadir secretaria_id
    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Nombre, email y password son obligatorios.' });
    }
    try {
        // Verificar si el email ya existe
        const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
        if (existe.rows.length > 0) {
            return res.status(409).json({ error: 'El email ya está registrado.' });
        }
        // Insertar usuario

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const query = 'INSERT INTO usuarios (nombre, email, password, secretaria_id, fecha_creacion) VALUES ($1, $2, $3, $4, NOW()) RETURNING id, nombre, email, secretaria_id, fecha_creacion';
        const result = await pool.query(query, [nombre, email, hashedPassword, secretaria_id]);

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al crear usuario:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});
