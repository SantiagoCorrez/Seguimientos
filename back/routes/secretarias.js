const express = require('express');
const pool = require('../db');
const verifyToken = require('../middleware/verifyToken');
const checkRole = require('../middleware/checkRole');

const router = express.Router();

// Middleware para proteger las rutas
router.use(verifyToken);
router.use(checkRole(['Administrador'])); // Solo administradores pueden gestionar secretarías

// Obtener todas las secretarías
router.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM secretarias ORDER BY nombre');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener secretarías:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Crear una nueva secretaría
router.post('/', async (req, res) => {
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }
    try {
        const result = await pool.query('INSERT INTO secretarias (nombre) VALUES ($1) RETURNING *', [nombre]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al crear secretaría:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Actualizar una secretaría
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    if (!nombre) {
        return res.status(400).json({ error: 'El nombre es obligatorio.' });
    }
    try {
        const result = await pool.query('UPDATE secretarias SET nombre = $1 WHERE id = $2 RETURNING *', [nombre, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Secretaría no encontrada.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error al actualizar secretaría:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

// Eliminar una secretaría
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM secretarias WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Secretaría no encontrada.' });
        }
        res.status(200).json({ message: 'Secretaría eliminada correctamente.' });
    } catch (err) {
        console.error('Error al eliminar secretaría:', err.message);
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
});

module.exports = router;
