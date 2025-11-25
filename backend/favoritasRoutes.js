// ===============================
// Rutas para Gestión de Favoritas
// ===============================
const express = require("express");
const router = express.Router();
const { getDB } = require("./database");

// ===============================
// POST /api/favoritas
// Agregar una receta a favoritas
// ===============================
router.post("/favoritas", (req, res) => {
  try {
    const { usuario_id, titulo, ingredientes, pasos } = req.body;

    // Validar campos requeridos
    if (!usuario_id || !titulo || !ingredientes || !pasos) {
      return res.status(400).json({
        error: "Todos los campos son requeridos (usuario_id, titulo, ingredientes, pasos)",
      });
    }

    const db = getDB();

    // Convertir arrays a JSON strings para almacenar
    const ingredientesJson = JSON.stringify(ingredientes);
    const pasosJson = JSON.stringify(pasos);

    // Insertar favorita
    db.run(
      "INSERT INTO favoritas (usuario_id, titulo, ingredientes, pasos) VALUES (?, ?, ?, ?)",
      [usuario_id, titulo, ingredientesJson, pasosJson],
      function (err) {
        if (err) {
          console.error("Error insertando favorita:", err);
          return res.status(500).json({ error: "Error guardando receta favorita" });
        }

        res.status(201).json({
          message: "Receta agregada a favoritas",
          favorita: {
            id: this.lastID,
            usuario_id,
            titulo,
            ingredientes,
            pasos,
          },
        });
      }
    );
  } catch (error) {
    console.error("Error en POST /favoritas:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// GET /api/favoritas/:usuario_id
// Obtener todas las recetas favoritas de un usuario
// ===============================
router.get("/favoritas/:usuario_id", (req, res) => {
  try {
    const { usuario_id } = req.params;

    const db = getDB();

    db.all(
      "SELECT id, titulo, ingredientes, pasos, fecha_creacion FROM favoritas WHERE usuario_id = ? ORDER BY fecha_creacion DESC",
      [usuario_id],
      (err, rows) => {
        if (err) {
          console.error("Error consultando favoritas:", err);
          return res.status(500).json({ error: "Error obteniendo favoritas" });
        }

        // Parsear JSON strings de vuelta a arrays
        const favoritas = rows.map((row) => ({
          id: row.id,
          titulo: row.titulo,
          ingredientes: JSON.parse(row.ingredientes),
          pasos: JSON.parse(row.pasos),
          fecha_creacion: row.fecha_creacion,
        }));

        res.json({ favoritas });
      }
    );
  } catch (error) {
    console.error("Error en GET /favoritas/:usuario_id:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// DELETE /api/favoritas/:id
// Eliminar una receta de favoritas
// ===============================
router.delete("/favoritas/:id", (req, res) => {
  try {
    const { id } = req.params;
    const { usuario_id } = req.body; // Verificar que el usuario sea el dueño

    if (!usuario_id) {
      return res.status(400).json({ error: "usuario_id es requerido" });
    }

    const db = getDB();

    // Verificar que la favorita pertenezca al usuario
    db.get(
      "SELECT usuario_id FROM favoritas WHERE id = ?",
      [id],
      (err, row) => {
        if (err) {
          console.error("Error consultando favorita:", err);
          return res.status(500).json({ error: "Error verificando favorita" });
        }

        if (!row) {
          return res.status(404).json({ error: "Receta favorita no encontrada" });
        }

        if (row.usuario_id !== usuario_id) {
          return res.status(403).json({ error: "No tienes permiso para eliminar esta receta" });
        }

        // Eliminar la favorita
        db.run("DELETE FROM favoritas WHERE id = ?", [id], function (err) {
          if (err) {
            console.error("Error eliminando favorita:", err);
            return res.status(500).json({ error: "Error eliminando favorita" });
          }

          res.json({ message: "Receta eliminada de favoritas" });
        });
      }
    );
  } catch (error) {
    console.error("Error en DELETE /favoritas/:id:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// ===============================
// GET /api/favoritas/check/:usuario_id
// Verificar si una receta específica está en favoritas (por título)
// ===============================
router.get("/favoritas/check/:usuario_id", (req, res) => {
  try {
    const { usuario_id } = req.params;
    const { titulo } = req.query;

    if (!titulo) {
      return res.status(400).json({ error: "titulo es requerido en query" });
    }

    const db = getDB();

    db.get(
      "SELECT id FROM favoritas WHERE usuario_id = ? AND titulo = ?",
      [usuario_id, titulo],
      (err, row) => {
        if (err) {
          console.error("Error consultando favorita:", err);
          return res.status(500).json({ error: "Error verificando favorita" });
        }

        res.json({ esFavorita: !!row, favorita_id: row?.id || null });
      }
    );
  } catch (error) {
    console.error("Error en GET /favoritas/check/:usuario_id:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;

