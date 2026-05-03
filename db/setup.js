/**
 * setup.js - Script de inicialización de la base de datos SQLite.
 *
 * Crea la tabla `rent_reports` si no existe con las siguientes columnas:
 *   - id: entero autoincremental (clave primaria)
 *   - lat: coordenada de latitud (REAL, obligatorio)
 *   - lng: coordenada de longitud (REAL, obligatorio)
 *   - zona: nombre de la zona/barrio (TEXT, obligatorio)
 *   - precio: precio del alquiler en € (INTEGER, obligatorio)
 *   - quiere_contacto: flag de contacto (INTEGER, 0 o 1, por defecto 0)
 *   - email: correo electrónico del usuario (TEXT, opcional)
 *   - created_at: fecha de creación (DATETIME, por defecto CURRENT_TIMESTAMP)
 *
 * Columnas adicionales (fingerprint, ip) se añaden dinámicamente vía
 * ALTER TABLE en los endpoints de la API cuando es necesario.
 *
 * Uso: node db/setup.js
 */

import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

/** Ruta absoluta al archivo de base de datos */
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'rentals.db');

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS rent_reports (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lat REAL NOT NULL,
    lng REAL NOT NULL,
    zona TEXT NOT NULL,
    precio INTEGER NOT NULL,
    quiere_contacto INTEGER DEFAULT 0,
    email TEXT,
    direccion TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

console.log('Database initialized at', dbPath);
db.close();
