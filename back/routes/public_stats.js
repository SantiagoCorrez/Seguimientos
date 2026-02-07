const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/public/sectores
router.get('/sectores', async (req, res) => {
    try {
        const query = `
            SELECT 
                sector, 
                COUNT(*) as cantidad, 
                SUM(valor_total) as total, 
                AVG(avance_fisico) as avance_fisico, 
                AVG(avance_financiero) as avance_financiero 
            FROM compromisos 
            GROUP BY sector;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener estadísticas por sectores:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener estadísticas por sectores.' });
    }
});

// GET /api/public/totales
router.get('/totales', async (req, res) => {
    try {
        const query = `
            SELECT 
                COUNT(*) as proyectos, 
                SUM(valor_total) as total, 
                AVG(avance_fisico) as avance_fisico, 
                AVG(avance_financiero) as avance_financiero 
            FROM compromisos;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error al obtener totales:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener totales.' });
    }
});

// GET /api/public/municipios
router.get('/municipios', async (req, res) => {
    try {
        const query = `
            SELECT 
                UPPER(TRANSLATE(municipio, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) as municipio, 
                COUNT(*) as cantidad, 
                SUM(valor_total) as total, 
                AVG(avance_fisico) as avance_fisico, 
                AVG(avance_financiero) as avance_financiero,
                SUM(CASE WHEN estado IN ('FINALIZADO', 'COMPLETADO', 'CUMPLIDO') THEN 1 ELSE 0 END) as proyectos_completados,
                SUM(CASE WHEN estado IN ('PENDIENTE', 'EN CURSO', 'NO SE HA INICIADO') THEN 1 ELSE 0 END) as proyectos_activos
            FROM compromisos 
            GROUP BY UPPER(TRANSLATE(municipio, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU'))
            ORDER BY municipio ASC;
        `;
        const result = await pool.query(query);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener estadísticas por municipios:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener estadísticas por municipios.' });
    }
});

// GET /api/public/sectores-por-municipio
router.get('/sectores-por-municipio', async (req, res) => {
    const { municipio } = req.query;
    try {
        let query = `
            SELECT 
                UPPER(TRANSLATE(municipio, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) as municipio, 
                sector,
                COUNT(*) as cantidad, 
                SUM(valor_total) as total, 
                AVG(avance_fisico) as avance_fisico, 
                AVG(avance_financiero) as avance_financiero,
                SUM(CASE WHEN estado IN ('FINALIZADO', 'COMPLETADO', 'CUMPLIDO') THEN 1 ELSE 0 END) as proyectos_completados,
                SUM(CASE WHEN estado IN ('PENDIENTE', 'EN CURSO', 'NO SE HA INICIADO') THEN 1 ELSE 0 END) as proyectos_activos
            FROM compromisos 
        `;

        const params = [];
        if (municipio) {
            query += ` WHERE UPPER(TRANSLATE(municipio, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) LIKE UPPER(TRANSLATE($1, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) `;
            params.push(`%${municipio}%`);
        }

        query += `
            GROUP BY UPPER(TRANSLATE(municipio, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')), sector
            ORDER BY municipio ASC, sector ASC;
        `;

        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener sectores por municipio:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener sectores por municipio.' });
    }
});

// GET /api/public/proyectos-por-municipio
router.get('/proyectos-por-municipio', async (req, res) => {
    const { municipio } = req.query;
    try {
        let query = `SELECT * FROM compromisos`;
        const params = [];

        if (municipio) {
            query += ` WHERE UPPER(TRANSLATE(municipio, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) LIKE UPPER(TRANSLATE($1, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU'))`;
            params.push(`%${municipio}%`);
        }

        query += ` ORDER BY id ASC`; // Or any other default ordering

        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener proyectos por municipio:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener proyectos por municipio.' });
    }
});

module.exports = router;
