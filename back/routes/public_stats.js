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
                        THEN 'Infraestructura y vías'
                    WHEN entidad IN ('EPC', 'MINAS') 
                        THEN 'Servicios Públicos'
                    WHEN entidad = 'SALUD' 
                        THEN 'Salud'
                    WHEN entidad = 'EDUCACION' 
                        THEN 'Educación'
                    WHEN entidad = 'GOBIERNO' 
                        THEN 'Seguridad'
                    WHEN entidad IN ('ACODER', 'AGROCAMPESINADO', 'CIENCIA', 'TRANSFORMACION DIGITAL') 
                        THEN 'Competitividad'
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
        WHERE estado != 'NO SE HA INICIADO' AND estado != 'NO SE VA A HACER'
        GROUP BY sector_nombre
        ORDER BY cantidad DESC
        ;
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
            FROM compromisos
            WHERE estado != 'NO SE HA INICIADO' AND estado != 'NO SE VA A HACER';
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
            query += ` WHERE UPPER(TRANSLATE(municipio, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) LIKE UPPER(TRANSLATE($1, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) 
            AND estado != 'NO SE HA INICIADO' AND estado != 'NO SE VA A HACER'`;
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
                            THEN 'Infraestructura y vías'
                        WHEN entidad IN ('EPC', 'MINAS') 
                            THEN 'Servicios Públicos'
                        WHEN entidad = 'SALUD' 
                            THEN 'Salud'
                        WHEN entidad = 'EDUCACION' 
                            THEN 'Educación'
                        WHEN entidad = 'GOBIERNO' 
                            THEN 'Seguridad'
                        WHEN entidad IN ('ACODER', 'AGROCAMPESINADO', 'CIENCIA', 'TRANSFORMACION DIGITAL') 
                            THEN 'Competitividad'
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
            query += ` WHERE UPPER(TRANSLATE(municipio, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) LIKE UPPER(TRANSLATE($1, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) 
            AND estado != 'NO SE HA INICIADO' AND estado != 'NO SE VA A HACER'`;
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
            query += ` WHERE UPPER(TRANSLATE(municipio, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) LIKE UPPER(TRANSLATE($1, 'áéíóúÁÉÍÓÚ', 'aeiouAEIOU')) 
            AND estado != 'NO SE HA INICIADO' AND estado != 'NO SE VA A HACER'`;
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

// Helper function to build WHERE clause
const buildWhereClause = (queryParams) => {
    const { provincia, municipio, entidad, estado, prioridad, obligacion, tema, subtema } = queryParams;
    let conditions = [];
    let values = [];
    let counter = 1;

    if (provincia) {
        conditions.push(`UPPER(TRANSLATE(provincia, 'áéíóúÁÉÍÓÚ', 'AEIOUAEIOU')) = UPPER(TRANSLATE($${counter}, 'áéíóúÁÉÍÓÚ', 'AEIOUAEIOU'))`);
        values.push(provincia);
        counter++;
    }
    if (municipio) {
        conditions.push(`UPPER(TRANSLATE(municipio, 'áéíóúÁÉÍÓÚ', 'AEIOUAEIOU')) = UPPER(TRANSLATE($${counter}, 'áéíóúÁÉÍÓÚ', 'AEIOUAEIOU'))`);
        values.push(municipio);
        counter++;
    }
    if (entidad) {
        conditions.push(`entidad = $${counter}`);
        values.push(entidad);
        counter++;
    }
    if (estado) {
        conditions.push(`estado = $${counter}`);
        values.push(estado);
        counter++;
    }
    if (prioridad) {
        conditions.push(`prioridad = $${counter}`);
        values.push(prioridad);
        counter++;
    }
    if (obligacion) {
        conditions.push(`obligacion_contraida = $${counter}`);
        values.push(obligacion);
        counter++;
    }
    if (tema) {
        conditions.push(`tema = $${counter}`);
        values.push(tema);
        counter++;
    }
    if (subtema) {
        conditions.push(`subtema = $${counter}`);
        values.push(subtema);
        counter++;
    }

    return {
        where: conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '',
        values: values
    };
};

// GET /api/public/filtrar/metricas
router.get('/filtrar/metricas', async (req, res) => {
    try {
        const { where, values } = buildWhereClause(req.query);
        const query = `
            SELECT 
                COUNT(*) as num_pro, 
                SUM(valor_documento) as total,
                AVG(CASE 
                    WHEN avance_fisico IS NOT NULL THEN avance_fisico 
                    WHEN estado IN ('Finalizado', 'FINALIZADO') THEN 100 
                    ELSE 0 
                END) as avg_avance,
                AVG(COALESCE(avance_fisico, 0)) as avg_avance_fisico, 
                AVG(COALESCE(avance_financiero, 0)) as avg_avance_financiero 
            FROM compromisos
            ${where}
        `;
        const result = await pool.query(query, values);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Error al filtrar métricas:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al filtrar métricas.' });
    }
});

// GET /api/public/filtrar/proyectos
router.get('/filtrar/proyectos', async (req, res) => {
    try {
        const { where, values } = buildWhereClause(req.query);
        const query = `
            SELECT * FROM compromisos 
            ${where} 
            ORDER BY 
                CASE entidad
                    WHEN 'ICCU' THEN 1
                    WHEN 'IDACO' THEN 2
                    WHEN 'SALUD' THEN 3
                    WHEN 'EDUCACION' THEN 4
                    WHEN 'AGROCAMPESINADO' THEN 5
                    WHEN 'ACODER' THEN 6
                    WHEN 'BIENESTAR VERDE' THEN 7
                    WHEN 'EPC' THEN 8
                    WHEN 'IDECUT' THEN 9
                    WHEN 'INDEPORTES' THEN 10
                    WHEN 'MINAS' THEN 11
                    WHEN 'VIVIENDA' THEN 12
                    WHEN 'DE LO SOCIAL Y LA FAMILIA' THEN 13
                    WHEN 'UAEGRD' THEN 14
                    WHEN 'MUJER' THEN 15
                    WHEN 'TRANSFORMACION DIGITAL' THEN 16
                    WHEN 'CIENCIA' THEN 17
                    WHEN 'IPYBAC' THEN 18
                    WHEN 'GOBIERNO' THEN 19
                    ELSE 20
                END ASC,
                valor_documento DESC
        `;
        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al filtrar proyectos:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al filtrar proyectos.' });
    }
});

module.exports = router;
