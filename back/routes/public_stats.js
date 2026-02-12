const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/public/sectores
router.get('/sectores', async (req, res) => {
    try {
        const query = `
            WITH entidades_mapeadas AS (
            SELECT 
                *,
                CASE 
                    WHEN entidad IN ('ICCU', 'IDACO', 'FERREA', 'MOVILIDAD', 'VIVIENDA') 
                        THEN 'Infraestructura y movilidad'
                    WHEN entidad IN ('EPC', 'MINAS') 
                        THEN 'Servicios Públicos'
                    WHEN entidad = 'SALUD' 
                        THEN 'Salud'
                    WHEN entidad = 'EDUCACION' 
                        THEN 'Educación'
                    WHEN entidad = 'GOBIERNO' 
                        THEN 'Seguridad'
                    WHEN entidad IN ('ACODER', 'AGROCAMPESINADO', 'CIENCIA', 'TRANSFORMACION DIGITAL') 
                        THEN 'Competitividad y agro'
                    WHEN entidad IN ('GENERAL', 'DE LO SOCIAL Y LA FAMILIA', 'IDECUT', 'INDEPORTES', 'MUJER', 'PENSIONES', 'BENEFICENCIA', 'CORPORACION SOCIAL') 
                        THEN 'Social'
                    WHEN entidad IN ('BIENESTAR VERDE', 'UAEGRD', 'IPYBAC', 'CATASTRO', 'PROSPECTIVA') 
                        THEN 'Bienestar Verde'
                    ELSE 'Otro/No clasificado'
                END AS sector_nombre
            FROM compromisos -- Reemplaza con el nombre real de tu tabla
        )
        SELECT 
            sector_nombre AS sector, 
            COUNT(*) AS cantidad, 
            SUM(valor_documento) AS total, 
            AVG(avance_fisico) AS avance_fisico, 
            AVG(avance_financiero) AS avance_financiero
        FROM entidades_mapeadas
        GROUP BY sector_nombre
        ORDER BY cantidad DESC;
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
                SUM(valor_documento) as total,
                SUM(aporte_departamento) as total_departamento, 
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
    const { municipio } = req.query;
    try {
        let query = `
            SELECT 
                UPPER(TRANSLATE(municipio, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) as municipio, 
                COUNT(*) as cantidad, 
                SUM(valor_documento) as total,
                SUM(aporte_departamento) as total_departamento, 
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
            GROUP BY UPPER(TRANSLATE(municipio, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU'))
            ORDER BY municipio ASC;
        `;

        const result = await pool.query(query, params);
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
            WITH entidades_mapeadas AS (
                SELECT 
                    *,
                    CASE 
                        WHEN entidad IN ('ICCU', 'IDACO', 'FERREA', 'MOVILIDAD', 'VIVIENDA') 
                            THEN 'Infraestructura y movilidad'
                        WHEN entidad IN ('EPC', 'MINAS') 
                            THEN 'Servicios Públicos'
                        WHEN entidad = 'SALUD' 
                            THEN 'Salud'
                        WHEN entidad = 'EDUCACION' 
                            THEN 'Educación'
                        WHEN entidad = 'GOBIERNO' 
                            THEN 'Seguridad'
                        WHEN entidad IN ('ACODER', 'AGROCAMPESINADO', 'CIENCIA', 'TRANSFORMACION DIGITAL') 
                            THEN 'Competitividad y agro'
                        WHEN entidad IN ('GENERAL', 'DE LO SOCIAL Y LA FAMILIA', 'IDECUT', 'INDEPORTES', 'MUJER', 'PENSIONES', 'BENEFICENCIA', 'CORPORACION SOCIAL') 
                            THEN 'Social'
                        WHEN entidad IN ('BIENESTAR VERDE', 'UAEGRD', 'IPYBAC', 'CATASTRO', 'PROSPECTIVA') 
                            THEN 'Bienestar Verde'
                        ELSE 'Otro/No clasificado'
                    END AS sector_nombre
                FROM compromisos -- Reemplaza con el nombre real de tu tabla
            )
            SELECT 
                sector_nombre AS sector, 
                COUNT(*) AS cantidad, 
                SUM(valor_documento) AS total, 
                AVG(avance_fisico) AS avance_fisico, 
                AVG(avance_financiero) AS avance_financiero,
                SUM(CASE WHEN estado IN ('FINALIZADO', 'COMPLETADO', 'CUMPLIDO') THEN 1 ELSE 0 END) as proyectos_completados,
                SUM(CASE WHEN estado IN ('PENDIENTE', 'EN CURSO', 'NO SE HA INICIADO') THEN 1 ELSE 0 END) as proyectos_activos
            FROM entidades_mapeadas
            
        `;

        const params = [];
        if (municipio) {
            query += ` WHERE UPPER(TRANSLATE(municipio, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) LIKE UPPER(TRANSLATE($1, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) `;
            params.push(`%${municipio}%`);
        }

        query += `
            GROUP BY sector_nombre
            ORDER BY cantidad DESC;
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
