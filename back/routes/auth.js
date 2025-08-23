const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');

const router = express.Router();

// Registrar un nuevo usuario
router.post('/register', async (req, res) => {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        // Verificar si el usuario ya existe
        const userExists = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: 'El correo electrónico ya está registrado.' });
        }

        // Hash de la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Iniciar transacción
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Insertar nuevo usuario
            const newUserQuery = 'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id';
            const newUserResult = await client.query(newUserQuery, [nombre, email, hashedPassword]);
            const newUserId = newUserResult.rows[0].id;

            // Asignar rol de "Visor" por defecto
            const visorRole = await client.query('SELECT id FROM roles WHERE nombre = $1', ['Visor']);
            if (visorRole.rows.length === 0) {
                throw new Error('El rol "Visor" no se encuentra en la base de datos.');
            }
            const visorRoleId = visorRole.rows[0].id;

            await client.query('INSERT INTO usuario_roles (usuario_id, rol_id) VALUES ($1, $2)', [newUserId, visorRoleId]);

            await client.query('COMMIT');

            res.status(201).json({ message: 'Usuario registrado exitosamente.' });

        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

    } catch (err) {
        console.error('Error al registrar el usuario:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al registrar el usuario.' });
    }
});

// Iniciar sesión
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Correo electrónico y contraseña son obligatorios.' });
    }

    try {
        // Buscar usuario por email
        const userResult = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userResult.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        const user = userResult.rows[0];

        // Comparar contraseñas
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Credenciales inválidas.' });
        }

        // Obtener roles del usuario
        const rolesResult = await pool.query(
            'SELECT r.nombre FROM roles r JOIN usuario_roles ur ON r.id = ur.rol_id WHERE ur.usuario_id = $1',
            [user.id]
        );
        const roles = rolesResult.rows.map(row => row.nombre);

        // Crear y firmar el token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, roles: roles },
            process.env.JWT_SECRET || 'your_jwt_secret',
            { expiresIn: '1h' }
        );

        res.status(200).json({ token });

    } catch (err) {
        console.error('Error al iniciar sesión:', err.message);
        res.status(500).json({ error: 'Error interno del servidor al iniciar sesión.' });
    }
});

module.exports = router;
