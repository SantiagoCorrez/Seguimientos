-- Tabla de Secretarías
CREATE TABLE secretarias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) UNIQUE NOT NULL
);

-- Insertar secretarías de ejemplo
INSERT INTO secretarias (nombre) VALUES ('Secretaría General'), ('Secretaría de Planeación'), ('Secretaría de Hacienda');

-- Tabla de Roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL
);

-- Insertar roles simplificados
INSERT INTO roles (nombre) VALUES ('Administrador'), ('Lector');

-- Tabla de Usuarios
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    secretaria_id INTEGER, -- Puede ser NULL si hay usuarios globales
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (secretaria_id) REFERENCES secretarias(id) ON DELETE SET NULL
);

-- Tabla de Usuario-Roles (relación muchos a muchos)
CREATE TABLE usuario_roles (
    usuario_id INTEGER NOT NULL,
    rol_id INTEGER NOT NULL,
    PRIMARY KEY (usuario_id, rol_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE
);
