// ===============================
// Rutas de Autenticación (Email/Password)
// ===============================
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const { getDB } = require("./database");

// ===============================
// POST /api/register
// Registra un nuevo usuario con email y contraseña
// ===============================
router.post("/register", async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Validar campos requeridos
    if (!nombre || !email || !password) {
      return res.status(400).json({
        error: "Todos los campos son requeridos (nombre, email, password)",
      });
    }

    // Validar formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Email inválido" });
    }

    // Validar longitud mínima de contraseña
    if (password.length < 6) {
      return res.status(400).json({
        error: "La contraseña debe tener al menos 6 caracteres",
      });
    }

    const db = getDB();

    // Verificar si el email ya está registrado
    db.get(
      "SELECT id FROM usuarios WHERE email = ?",
      [email],
      async (err, row) => {
        if (err) {
          console.error("Error consultando usuario:", err);
          return res.status(500).json({ error: "Error en la base de datos" });
        }

        if (row) {
          return res.status(400).json({ error: "El email ya está registrado" });
        }

        // Hashear la contraseña con bcrypt (10 rounds)
        try {
          const passwordHash = await bcrypt.hash(password, 10);

          // Insertar nuevo usuario
          db.run(
            "INSERT INTO usuarios (nombre, email, passwordHash) VALUES (?, ?, ?)",
            [nombre, email, passwordHash],
            function (err) {
              if (err) {
                console.error("Error insertando usuario:", err);
                return res
                  .status(500)
                  .json({ error: "Error registrando usuario" });
              }

              // Retornar usuario creado (sin passwordHash)
              res.status(201).json({
                message: "Usuario registrado correctamente",
                user: {
                  id: this.lastID,
                  nombre,
                  email,
                },
              });
            }
          );
        } catch (hashError) {
          console.error("Error hasheando contraseña:", hashError);
          return res.status(500).json({ error: "Error procesando contraseña" });
        }
      }
    );
  } catch (error) {
    console.error("Error en /register:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// POST /api/login
// Autentica un usuario con email y contraseña
// ===============================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({
        error: "Email y contraseña son requeridos",
      });
    }

    const db = getDB();

    // Buscar usuario por email
    db.get(
      "SELECT id, nombre, email, passwordHash FROM usuarios WHERE email = ?",
      [email],
      async (err, user) => {
        if (err) {
          console.error("Error consultando usuario:", err);
          return res.status(500).json({ error: "Error en la base de datos" });
        }

        // Si no se encuentra el usuario
        if (!user) {
          return res.status(401).json({ error: "Credenciales inválidas" });
        }

        // Comparar contraseña ingresada con el hash almacenado
        try {
          const passwordMatch = await bcrypt.compare(password, user.passwordHash);

          if (!passwordMatch) {
            return res.status(401).json({ error: "Credenciales inválidas" });
          }

          // Contraseña correcta - retornar usuario (sin passwordHash)
          res.json({
            message: "Login exitoso",
            user: {
              id: user.id,
              nombre: user.nombre,
              email: user.email,
            },
          });
        } catch (compareError) {
          console.error("Error comparando contraseña:", compareError);
          return res.status(500).json({ error: "Error verificando contraseña" });
        }
      }
    );
  } catch (error) {
    console.error("Error en /login:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;

