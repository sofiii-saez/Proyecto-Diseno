// ===============================
// Configuración de Base de Datos SQLite
// ===============================
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Ruta del archivo de base de datos
const DB_PATH = path.join(__dirname, "usuarios.db");

// Función para obtener la conexión a la base de datos
function getDB() {
  return new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
      console.error("Error conectando a SQLite:", err.message);
    } else {
      console.log("✅ Conectado a la base de datos SQLite:", DB_PATH);
    }
  });
}

// Función para inicializar la base de datos (crear tabla si no existe)
function initDB() {
  const db = getDB();

  db.serialize(() => {
    // Crear tabla usuarios si no existe
    db.run(
      `CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL
      )`,
      (err) => {
        if (err) {
          console.error("Error creando tabla usuarios:", err.message);
        } else {
          console.log("✅ Tabla 'usuarios' lista");
        }
      }
    );

    // Crear tabla favoritas si no existe
    db.run(
      `CREATE TABLE IF NOT EXISTS favoritas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        titulo TEXT NOT NULL,
        ingredientes TEXT NOT NULL,
        pasos TEXT NOT NULL,
        idioma TEXT NOT NULL DEFAULT 'es',
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
      )`,
      (err) => {
        if (err) {
          console.error("Error creando tabla favoritas:", err.message);
        } else {
          console.log("✅ Tabla 'favoritas' lista");
          
          // Agregar columna idioma si no existe (para tablas ya creadas)
          db.run(
            "ALTER TABLE favoritas ADD COLUMN idioma TEXT DEFAULT 'es'",
            (alterErr) => {
              // Ignorar error si la columna ya existe
              if (alterErr && !alterErr.message.includes("duplicate column")) {
                console.error("Error agregando columna idioma:", alterErr.message);
              }
            }
          );
        }
      }
    );
  });

  return db;
}

// Función para cerrar la conexión
function closeDB(db) {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error("Error cerrando la base de datos:", err.message);
      } else {
        console.log("Conexión a la base de datos cerrada");
      }
    });
  }
}

module.exports = {
  getDB,
  initDB,
  closeDB,
  DB_PATH,
};

