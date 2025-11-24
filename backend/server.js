<<<<<<< HEAD
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
=======
// Cargar variables de entorno desde archivo .env
// IMPORTANTE: Debes crear un archivo .env en la carpeta backend con tu clave de Gemini:
// GEMINI_API_KEY=MI_CLAVE_AQUI
require("dotenv").config();

console.log("¿Clave Gemini existe?:", !!process.env.GEMINI_API_KEY);


const express = require("express");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();

app.use(cors());
app.use(express.json());

//ruta de prueba
>>>>>>> 412f3260c812a7be82d71ec0f683348d377ebadd
app.get("/api/ping", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

<<<<<<< HEAD
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

=======
// Ruta para generar recetas usando IA Gemini
app.post("/api/recetas/ia", async (req, res) => {
  try {
    // Obtener los ingredientes del body
    const { ingredientesSeleccionados } = req.body;

    // Validar que existan ingredientes
    if (!ingredientesSeleccionados || ingredientesSeleccionados.length === 0) {
      return res.status(400).json({ 
        error: "Debes seleccionar al menos un ingrediente" 
      });
    }

    // Crear el prompt para Gemini
>>>>>>> 412f3260c812a7be82d71ec0f683348d377ebadd
    const listaIngredientes = ingredientesSeleccionados.join(", ");
    const prompt = `Genera 3 recetas fáciles usando principalmente estos ingredientes: ${listaIngredientes}. 

IMPORTANTE: Responde SOLO con un JSON válido, sin texto adicional. El formato debe ser un array de objetos, cada uno con esta estructura:
{
  "titulo": "Nombre de la receta",
  "ingredientes": ["ingrediente1", "ingrediente2", ...],
  "pasos": ["Paso 1", "Paso 2", ...]
<<<<<<< HEAD
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
=======
}

Ejemplo de respuesta esperada:
[
  {
    "titulo": "Receta 1",
    "ingredientes": ["ingrediente1", "ingrediente2"],
    "pasos": ["Paso 1", "Paso 2"]
  }
]`;

    // Llamar a la API de Gemini
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const respuesta = await model.generateContent(prompt);
    
    // Obtener el texto de la respuesta
    let textoRespuesta = respuesta.response.text();
    
    // Limpiar el texto: eliminar markdown code blocks si existen
    textoRespuesta = textoRespuesta.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    // Intentar parsear como JSON
    let recetasIA;
    try {
      recetasIA = JSON.parse(textoRespuesta);
      // Asegurar que sea un array
      if (!Array.isArray(recetasIA)) {
        recetasIA = [recetasIA];
      }
    } catch (error) {
      // Si no es JSON válido, crear un objeto con el texto
      console.error("Error parseando JSON de Gemini:", error);
      console.error("Texto recibido:", textoRespuesta);
      recetasIA = [{
        titulo: "Receta generada",
        ingredientes: ingredientesSeleccionados,
        pasos: [textoRespuesta]
      }];
    }

    // Enviar respuesta al frontend
    res.json({ recetas: recetasIA });

  } catch (error) {
    console.error("ERROR COMPLETO DE GEMINI:");
    console.error(error);
    if (error.response) {
      console.error("error.response.data:", error.response.data);
    }
    res.status(500).json({
      error: "Error al generar las recetas. Intenta de nuevo."
    });
  }  
});

>>>>>>> 412f3260c812a7be82d71ec0f683348d377ebadd
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
