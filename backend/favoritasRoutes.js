// ===============================
// Rutas para Gestión de Favoritas
// ===============================
const express = require("express");
const router = express.Router();
const { getDB } = require("./database");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// ===============================
// POST /api/favoritas
// Agregar una receta a favoritas
// ===============================
router.post("/favoritas", (req, res) => {
  try {
    const { usuario_id, titulo, ingredientes, pasos, idioma = "es" } = req.body;

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

    // Insertar favorita (incluyendo idioma)
    db.run(
      "INSERT INTO favoritas (usuario_id, titulo, ingredientes, pasos, idioma) VALUES (?, ?, ?, ?, ?)",
      [usuario_id, titulo, ingredientesJson, pasosJson, idioma],
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
      "SELECT id, titulo, ingredientes, pasos, idioma, fecha_creacion FROM favoritas WHERE usuario_id = ? ORDER BY fecha_creacion DESC",
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
          idioma: row.idioma || "es",
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

// ===============================
// POST /api/favoritas/translate/:id
// Traducir una receta favorita a otro idioma
// ===============================
router.post("/favoritas/translate/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { idioma_destino } = req.body; // "es" o "en"

    if (!idioma_destino || !["es", "en"].includes(idioma_destino)) {
      return res.status(400).json({ error: "idioma_destino debe ser 'es' o 'en'" });
    }

    const db = getDB();

    // Obtener la receta original
    db.get(
      "SELECT titulo, ingredientes, pasos, idioma FROM favoritas WHERE id = ?",
      [id],
      async (err, row) => {
        if (err) {
          console.error("Error consultando favorita:", err);
          return res.status(500).json({ error: "Error obteniendo receta" });
        }

        if (!row) {
          return res.status(404).json({ error: "Receta no encontrada" });
        }

        // Si ya está en el idioma destino, no traducir
        if (row.idioma === idioma_destino) {
          return res.json({
            titulo: row.titulo,
            ingredientes: JSON.parse(row.ingredientes),
            pasos: JSON.parse(row.pasos),
            idioma: row.idioma,
          });
        }

        // Traducir usando Gemini
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

          const ingredientes = JSON.parse(row.ingredientes);
          const pasos = JSON.parse(row.pasos);

          const idioma_origen = row.idioma === "es" ? "español" : "inglés";
          const idioma_destino_nombre = idioma_destino === "es" ? "español" : "inglés";

          const prompt = `Traduce esta receta de ${idioma_origen} a ${idioma_destino_nombre}. 

Título original: ${row.titulo}

Ingredientes:
${ingredientes.map((ing, i) => `${i + 1}. ${ing}`).join("\n")}

Pasos:
${pasos.map((paso, i) => `${i + 1}. ${paso}`).join("\n")}

Responde SOLO con un JSON válido en este formato exacto:
{
  "titulo": "Título traducido",
  "ingredientes": ["ingrediente1", "ingrediente2", ...],
  "pasos": ["paso1", "paso2", ...]
}

NO agregues texto adicional, solo el JSON.`;

          const respuesta = await model.generateContent(prompt);
          let textoRespuesta = respuesta.response.text();

          // Limpiar markdown si viene como ```json
          textoRespuesta = textoRespuesta
            .replace(/```json\n?/g, "")
            .replace(/```\n?/g, "")
            .trim();

          let recetaTraducida;
          try {
            recetaTraducida = JSON.parse(textoRespuesta);
          } catch (parseError) {
            console.error("Error parseando JSON de traducción:", parseError);
            return res.status(500).json({ error: "Error procesando traducción" });
          }

          res.json({
            titulo: recetaTraducida.titulo,
            ingredientes: recetaTraducida.ingredientes || [],
            pasos: recetaTraducida.pasos || [],
            idioma: idioma_destino,
          });
        } catch (geminiError) {
          console.error("Error en traducción con Gemini:", geminiError);
          return res.status(500).json({ error: "Error traduciendo receta" });
        }
      }
    );
  } catch (error) {
    console.error("Error en POST /favoritas/translate/:id:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;

