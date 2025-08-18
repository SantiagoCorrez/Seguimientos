// Importar módulos necesarios
const express = require('express');
const { Pool } = require('pg');
const dotenv = require('dotenv');
const cors = require('cors'); // Para permitir solicitudes desde diferentes orígenes
const multer = require('multer');
const path = require('path');

// Cargar variables de entorno desde .env
dotenv.config();

// Inicializar la aplicación Express
const app = express();
const port = process.env.PORT || 3000; // Puerto donde se ejecutará el servidor

// Middleware para parsear JSON en las solicitudes
app.use(express.json());

// Middleware para habilitar CORS
app.use(cors());

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
});

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Carpeta donde se guardan las imágenes
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único        app.use('/uploads', express.static('uploads'));        app.use('/uploads', express.static('uploads'));
    }
});
const upload = multer({ storage: storage });

// Probar la conexión a la base de datos
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error al conectar a la base de datos:', err.stack);
    }
    client.query('SELECT NOW()', (err, result) => {
        release(); // Liberar el cliente de vuelta al pool
        if (err) {
            return console.error('Error al ejecutar la consulta de prueba:', err.stack);
        }
        console.log('Conexión exitosa a PostgreSQL:', result.rows[0].now);
    });
});

// --- Rutas de la API para Compromisos ---

// 1. Obtener todos los compromisos
app.get('/api/compromisos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM compromisos ORDER BY codigo ASC');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener los compromisos:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener compromisos.' });
    }
});

// 2. Obtener un compromiso por su código
app.get('/api/compromisos/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        const result = await pool.query('SELECT * FROM compromisos WHERE codigo = $1', [codigo]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Compromiso no encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(`Error al obtener el compromiso con código ${codigo}:`, err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener el compromiso.' });
    }
});

// 3. Crear un nuevo compromiso
app.post('/api/compromisos', async (req, res) => {
    const {
        codigo, provincia, municipio, compromiso_especifico, tema, subtema,
        detalle_especifico, meta_del_plan_de_desarrollo, descripcion_meta_producto,
        se_dara_cumplimiento_al_compromiso, dispone_del_presupuesto,
        el_compromiso_fue_modificado, nuevo_compromiso, prioridad, estado, valor_total,
        aporte_departamento, aporte_municipio, aporte_nacion, otro_aporte,
        fuente_cofinanciacion, entidad_lider, entidades_aliadas, tipo_documento,
        numero_documento, objeto_documento, valor_documento, bien_o_servicio_entregado,
        fecha_estimada_inicio, fecha_estimada_finalizacion, accion_adelantada,
        acciones_pendientes, se_requiere_apoyo_despacho, dificultades,
        alternativas_de_solucion, observaciones
    } = req.body;

    try {
        const query = `
            INSERT INTO compromisos (
                codigo, provincia, municipio, compromiso_especifico, tema, subtema,
                detalle_especifico, meta_del_plan_de_desarrollo, descripcion_meta_producto,
                se_dara_cumplimiento_al_compromiso, dispone_del_presupuesto,
                el_compromiso_fue_modificado, nuevo_compromiso, prioridad, estado, valor_total,
                aporte_departamento, aporte_municipio, aporte_nacion, otro_aporte,
                fuente_cofinanciacion, entidad_lider, entidades_aliadas, tipo_documento,
                numero_documento, objeto_documento, valor_documento, bien_o_servicio_entregado,
                fecha_estimada_inicio, fecha_estimada_finalizacion, accion_adelantada,
                acciones_pendientes, se_requiere_apoyo_despacho, dificultades,
                alternativas_de_solucion, observaciones
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36)
            RETURNING *;
        `;
        const values = [
            codigo, provincia, municipio, compromiso_especifico, tema, subtema,
            detalle_especifico, meta_del_plan_de_desarrollo, descripcion_meta_producto,
            se_dara_cumplimiento_al_compromiso, dispone_del_presupuesto,
            el_compromiso_fue_modificado, nuevo_compromiso, prioridad, estado, valor_total,
            aporte_departamento, aporte_municipio, aporte_nacion, otro_aporte,
            fuente_cofinanciacion, entidad_lider, entidades_aliadas, tipo_documento,
            numero_documento, objeto_documento, valor_documento, bien_o_servicio_entregado,
            fecha_estimada_inicio, fecha_estimada_finalizacion, accion_adelantada,
            acciones_pendientes, se_requiere_apoyo_despacho, dificultades,
            alternativas_de_solucion, observaciones
        ];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al crear el compromiso:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al crear el compromiso.' });
    }
});

// 4. Actualizar un compromiso existente
app.put('/api/compromisos/:codigo', async (req, res) => {
    const { codigo } = req.params;
    const {
        provincia, municipio, compromiso_especifico, tema, subtema,
        detalle_especifico, meta_del_plan_de_desarrollo, descripcion_meta_producto,
        se_dara_cumplimiento_al_compromiso, dispone_del_presupuesto,
        el_compromiso_fue_modificado, nuevo_compromiso, prioridad, estado, valor_total,
        aporte_departamento, aporte_municipio, aporte_nacion, otro_aporte,
        fuente_cofinanciacion, entidad_lider, entidades_aliadas, tipo_documento,
        numero_documento, objeto_documento, valor_documento, bien_o_servicio_entregado,
        fecha_estimada_inicio, fecha_estimada_finalizacion, accion_adelantada,
        acciones_pendientes, se_requiere_apoyo_despacho, dificultades,
        alternativas_de_solucion, observaciones
    } = req.body;

    try {
        const query = `
            UPDATE compromisos
            SET
                provincia = $1,
                municipio = $2,
                compromiso_especifico = $3,
                tema = $4,
                subtema = $5,
                detalle_especifico = $6,
                meta_del_plan_de_desarrollo = $7,
                descripcion_meta_producto = $8,
                se_dara_cumplimiento_al_compromiso = $9,
                dispone_del_presupuesto = $10,
                el_compromiso_fue_modificado = $11,
                nuevo_compromiso = $12,
                prioridad = $13,
                estado = $14,
                valor_total = $15,
                aporte_departamento = $16,
                aporte_municipio = $17,
                aporte_nacion = $18,
                otro_aporte = $19,
                fuente_cofinanciacion = $20,
                entidad_lider = $21,
                entidades_aliadas = $22,
                tipo_documento = $23,
                numero_documento = $24,
                objeto_documento = $25,
                valor_documento = $26,
                bien_o_servicio_entregado = $27,
                fecha_estimada_inicio = $28,
                fecha_estimada_finalizacion = $29,
                accion_adelantada = $30,
                acciones_pendientes = $31,
                se_requiere_apoyo_despacho = $32,
                dificultades = $33,
                alternativas_de_solucion = $34,
                observaciones = $35
            WHERE codigo = $36
            RETURNING *;
        `;
        const values = [
            provincia, municipio, compromiso_especifico, tema, subtema,
            detalle_especifico, meta_del_plan_de_desarrollo, descripcion_meta_producto,
            se_dara_cumplimiento_al_compromiso, dispone_del_presupuesto,
            el_compromiso_fue_modificado, nuevo_compromiso, prioridad, estado, valor_total,
            aporte_departamento, aporte_municipio, aporte_nacion, otro_aporte,
            fuente_cofinanciacion, entidad_lider, entidades_aliadas, tipo_documento,
            numero_documento, objeto_documento, valor_documento, bien_o_servicio_entregado,
            fecha_estimada_inicio, fecha_estimada_finalizacion, accion_adelantada,
            acciones_pendientes, se_requiere_apoyo_despacho, dificultades,
            alternativas_de_solucion, observaciones, codigo
        ];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Compromiso no encontrado para actualizar.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(`Error al actualizar el compromiso con código ${codigo}:`, err.message);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el compromiso.' });
    }
});

// 5. Eliminar un compromiso
app.delete('/api/compromisos/:codigo', async (req, res) => {
    const { codigo } = req.params;
    try {
        const result = await pool.query('DELETE FROM compromisos WHERE codigo = $1 RETURNING *', [codigo]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Compromiso no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Compromiso eliminado exitosamente.', deletedCompromiso: result.rows[0] });
    } catch (err) {
        console.error(`Error al eliminar el compromiso con código ${codigo}:`, err.message);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el compromiso.' });
    }
});

// --- Rutas de la API para Reportes de Avance ---

// 1. Obtener todos los reportes de avance para un compromiso específico
app.get('/api/compromisos/:codigo/reportes-avance', async (req, res) => {
    const { codigo } = req.params;
    try {
        const result = await pool.query(
            'SELECT * FROM reportes_avance WHERE compromiso_codigo = $1 ORDER BY mes_reporte DESC',
            [codigo]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(`Error al obtener reportes de avance para el compromiso ${codigo}:`, err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener reportes de avance.' });
    }
});

// 2. Obtener un reporte de avance específico por su ID
app.get('/api/reportes-avance/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM reportes_avance WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Reporte de avance no encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(`Error al obtener el reporte de avance con ID ${id}:`, err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener el reporte de avance.' });
    }
});

// 3. Crear un nuevo reporte de avance
app.post('/api/reportes-avance', upload.single('imagen'), async (req, res) => {
    const {
        compromiso_codigo, mes_reporte, reporte_avance_fisico,
        reporte_avance_financiero, observaciones_reporte
    } = req.body;
    const imagen_url = req.file ? req.file.path : null;

    // Validar que el compromiso_codigo exista
    try {
        const compromisoExists = await pool.query('SELECT 1 FROM compromisos WHERE codigo = $1', [compromiso_codigo]);
        if (compromisoExists.rows.length === 0) {
            return res.status(400).json({ error: 'El código de compromiso proporcionado no existe.' });
        }

        const query = `
            INSERT INTO reportes_avance (
                compromiso_codigo, mes_reporte, reporte_avance_fisico,
                reporte_avance_financiero, observaciones_reporte, imagen_url
            ) VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (compromiso_codigo, mes_reporte) DO UPDATE
            SET
                reporte_avance_fisico = EXCLUDED.reporte_avance_fisico,
                reporte_avance_financiero = EXCLUDED.reporte_avance_financiero,
                observaciones_reporte = EXCLUDED.observaciones_reporte,
                imagen_url = EXCLUDED.imagen_url,
                fecha_creacion = CURRENT_TIMESTAMP
            RETURNING *;
        `;
        const values = [
            compromiso_codigo, mes_reporte, reporte_avance_fisico,
            reporte_avance_financiero, observaciones_reporte, imagen_url
        ];
        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al crear/actualizar el reporte de avance:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al crear/actualizar el reporte de avance.' });
    }
});

// 4. Actualizar un reporte de avance existente
app.put('/api/reportes-avance/:id', async (req, res) => {
    const { id } = req.params;
    const {
        reporte_avance_fisico, reporte_avance_financiero,
        observaciones_reporte, imagen_url
    } = req.body;

    try {
        const query = `
            UPDATE reportes_avance
            SET
                reporte_avance_fisico = $1,
                reporte_avance_financiero = $2,
                observaciones_reporte = $3,
                imagen_url = $4,
                fecha_creacion = CURRENT_TIMESTAMP -- Actualizar la fecha de modificación
            WHERE id = $5
            RETURNING *;
        `;
        const values = [
            reporte_avance_fisico, reporte_avance_financiero,
            observaciones_reporte, imagen_url, id
        ];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Reporte de avance no encontrado para actualizar.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(`Error al actualizar el reporte de avance con ID ${id}:`, err.message);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el reporte de avance.' });
    }
});

// 5. Eliminar un reporte de avance
app.delete('/api/reportes-avance/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM reportes_avance WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Reporte de avance no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Reporte de avance eliminado exitosamente.', deletedReporte: result.rows[0] });
    } catch (err) {
        console.error(`Error al eliminar el reporte de avance con ID ${id}:`, err.message);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el reporte de avance.' });
    }
});

app.use('/uploads', express.static('uploads'));
// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor Node.js escuchando en http://localhost:${port}`);
});
