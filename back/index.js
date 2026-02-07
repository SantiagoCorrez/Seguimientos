// Importar módulos necesarios
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Added fs
const pool = require('./db'); // Importar la configuración de la base de datos
const authRoutes = require('./routes/auth'); // Importar rutas de autenticación
const usersRoutes = require('./routes/users'); // Importar rutas de gestión de usuarios
const verifyToken = require('./middleware/verifyToken');
const checkRole = require('./middleware/checkRole');

const secretariasRoutes = require('./routes/secretarias'); // Importar rutas de secretarías
const publicStatsRoutes = require('./routes/public_stats'); // Importar rutas de estadísticas públicas


// Cargar variables de entorno desde .env
dotenv.config();

// Inicializar la aplicación Express
const app = express();
const port = process.env.PORT || 3000;

// Middleware para parsear JSON en las solicitudes
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Middleware para habilitar CORS
app.use(cors());

// Configuración de almacenamiento para Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Servir archivos estáticos desde la carpeta 'uploads'
app.use('/uploads', express.static('uploads'));

// Helper function to save Base64 image
const saveBase64Image = (base64String) => {
    // Check if it's a valid base64 data URI
    const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
        return null;
    }
    const type = matches[1];
    const data = Buffer.from(matches[2], 'base64');

    // Guess extension from type
    let extension = 'bin';
    if (type.includes('jpeg') || type.includes('jpg')) extension = 'jpg';
    else if (type.includes('png')) extension = 'png';
    else if (type.includes('pdf')) extension = 'pdf';

    const filename = Date.now() + '.' + extension;
    const filepath = path.join('uploads', filename);
    fs.writeFileSync(filepath, data);
    return 'uploads/' + filename;
};

// --- Rutas de la API ---

// Rutas de autenticación
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/secretarias', secretariasRoutes); // Añadir esta línea
app.use('/api/public', publicStatsRoutes); // Rutas públicas de estadísticas


// --- Rutas de la API para Compromisos ---

// 1. Obtener todos los compromisos
app.get('/api/compromisos', verifyToken, checkRole(['Administrador', 'Editor', 'Visor']), async (req, res) => {
    try {
        let query = 'SELECT * FROM compromisos';
        let values = [];

        // Check if user is Editor and NOT Administrator
        // (If user has both, Admin privileges override)
        if (req.user.roles.includes('Editor') && !req.user.roles.includes('Administrador')) {
            // Filter by secretaría
            // Assuming 'entidad_lider' column matches 'secretaria_nombre'
            query += ' WHERE entidad = $1';
            values.push(req.user.secretaria_nombre);
        }

        query += ' ORDER BY id ASC';

        const result = await pool.query(query, values);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Error al obtener los compromisos:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener compromisos.' });
    }
});

// 2. Obtener un compromiso por su id
app.get('/api/compromisos/id/:id', verifyToken, checkRole(['Administrador', 'Editor', 'Visor']), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT * FROM compromisos WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Compromiso no encontrado.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(`Error al obtener el compromiso con id ${id}:`, err.message);
        res.status(500).json({ error: 'Error interno del servidor al obtener el compromiso.' });
    }
});

// 3. Crear un nuevo compromiso
app.post('/api/compromisos', verifyToken, checkRole(['Administrador', 'Editor']), async (req, res) => {
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
app.put('/api/compromisos/id/:id', verifyToken, checkRole(['Administrador', 'Editor']), async (req, res) => {
    const { id } = req.params;
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
        alternativas_de_solucion, observaciones, codigo
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
                observaciones = $35,
                codigo = $36
            WHERE id = $37
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
            alternativas_de_solucion, observaciones, codigo, id
        ];
        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Compromiso no encontrado para actualizar.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(`Error al actualizar el compromiso con id ${id}:`, err.message);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el compromiso.' });
    }
});

// 5. Eliminar un compromiso
app.delete('/api/compromisos/id/:id', verifyToken, checkRole(['Administrador']), async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM compromisos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Compromiso no encontrado para eliminar.' });
        }
        res.status(200).json({ message: 'Compromiso eliminado exitosamente.', deletedCompromiso: result.rows[0] });
    } catch (err) {
        console.error(`Error al eliminar el compromiso con id ${id}:`, err.message);
        res.status(500).json({ error: 'Error interno del servidor al eliminar el compromiso.' });
    }
});

// --- Rutas de la API para Reportes de Avance ---

// 1. Obtener todos los reportes de avance para un compromiso específico
app.get('/api/compromisos/:codigo/reportes-avance', verifyToken, checkRole(['Administrador', 'Editor', 'Visor']), async (req, res) => {
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
app.get('/api/reportes-avance/:id', verifyToken, checkRole(['Administrador', 'Editor', 'Visor']), async (req, res) => {
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
app.post('/api/reportes-avance', verifyToken, checkRole(['Administrador', 'Editor']), async (req, res) => {
    const {
        compromiso_codigo, mes_reporte, reporte_avance_fisico,
        reporte_avance_financiero, observaciones_reporte, imagen
    } = req.body;

    let imagen_url = null;
    if (imagen) {
        try {
            imagen_url = saveBase64Image(imagen);
        } catch (error) {
            console.error('Error saving base64 image:', error);
            return res.status(500).json({ error: 'Error al procesar la imagen.' });
        }
    }

    // Validar que el compromiso_codigo exista
    try {
        const compromisoExists = await pool.query('SELECT 1 FROM compromisos WHERE id = $1', [compromiso_codigo]);
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

        // Actualizar el avance en la tabla compromisos
        await pool.query(
            'UPDATE compromisos SET avance_fisico = $1, avance_financiero = $2 WHERE id = $3',
            [reporte_avance_fisico, reporte_avance_financiero, compromiso_codigo]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error al crear/actualizar el reporte de avance:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al crear/actualizar el reporte de avance.' });
    }
});

// 4. Actualizar un reporte de avance existente
app.put('/api/reportes-avance/:id', verifyToken, checkRole(['Administrador', 'Editor']), async (req, res) => {
    const { id } = req.params;
    const {
        reporte_avance_fisico, reporte_avance_financiero,
        observaciones_reporte, imagen
    } = req.body;

    let imagen_url = req.body.imagen_url; // Keep existing if not changed
    if (imagen) {
        try {
            imagen_url = saveBase64Image(imagen);
        } catch (error) {
            console.error('Error saving base64 image:', error);
            return res.status(500).json({ error: 'Error al procesar la imagen.' });
        }
    }

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

        // Actualizar el avance en la tabla compromisos
        const updatedReporte = result.rows[0];
        await pool.query(
            'UPDATE compromisos SET avance_fisico = $1, avance_financiero = $2 WHERE id = $3',
            [updatedReporte.reporte_avance_fisico, updatedReporte.reporte_avance_financiero, updatedReporte.compromiso_codigo]
        );

        res.status(200).json(updatedReporte);
    } catch (err) {
        console.error(`Error al actualizar el reporte de avance con ID ${id}:`, err.message);
        res.status(500).json({ error: 'Error interno del servidor al actualizar el reporte de avance.' });
    }
});

// 5. Eliminar un reporte de avance
app.delete('/api/reportes-avance/:id', verifyToken, checkRole(['Administrador']), async (req, res) => {
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
