// ===============================
// Cargar variables de entorno (.env)
// ===============================
require("dotenv").config();
console.log("¿Clave Gemini existe?:", !!process.env.GEMINI_API_KEY);

// ===============================
// Imports
// ===============================
const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

// ===============================
// Middlewares
// ===============================
app.use(cors());
app.use(express.json());

// ===============================
// Ruta de prueba
// ===============================
app.get("/api/ping", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

// ===============================
// Ruta para generar recetas con Gemini
// ===============================
app.post("/api/recetas/ia", async (req, res) => {
  try {
    const { ingredientesSeleccionados } = req.body;

    if (!ingredientesSeleccionados || ingredientesSeleccionados.length === 0) {
      return res.status(400).json({
        error: "Debes seleccionar al menos un ingrediente",
      });
    }

    const listaIngredientes = ingredientesSeleccionados.join(", ");
    const prompt = `Genera 3 recetas fáciles usando principalmente estos ingredientes: ${listaIngredientes}. 

IMPORTANTE: Responde SOLO con un JSON válido, sin texto adicional. El formato debe ser un array de objetos, cada uno con esta estructura:
{
  "titulo": "Nombre de la receta",
  "ingredientes": ["ingrediente1", "ingrediente2", ...],
  "pasos": ["Paso 1", "Paso 2", ...]
}`;

      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // ✅ modelo nuevo
      // const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // otra opción
      const respuesta = await model.generateContent(prompt);

    let textoRespuesta = respuesta.response.text();

    // limpiar markdown si viene como ```json
    textoRespuesta = textoRespuesta
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    let recetasIA;
    try {
      recetasIA = JSON.parse(textoRespuesta);
      if (!Array.isArray(recetasIA)) recetasIA = [recetasIA];
    } catch (error) {
      console.error("Error parseando JSON de Gemini:", error);
      recetasIA = [
        {
          titulo: "Receta generada",
          ingredientes: ingredientesSeleccionados,
          pasos: [textoRespuesta],
        },
      ];
    }

    res.json({ recetas: recetasIA });
  } catch (error) {
    console.error("ERROR COMPLETO EN GEMINI:", error);
    res.status(500).json({
      error: "Error al generar las recetas. Intenta de nuevo.",
    });
  }
});

// ===============================
// RUTA PARA LISTA DE COMPRAS CON GEMINI
// (usa el archivo routes/ai.routes.js)
// ===============================
app.use("/api/ai", require("./routes/ai.routes"));

// ===============================
// Servidor
// ===============================
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
