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
// FUNCIÓN PARA CALCULAR DISTANCIA
// ===============================
function haversineDist(lat1, lon1, lat2, lon2) {
  const R = 6371; // radio de la Tierra en km
  const toRad = (x) => (x * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
// ===============================
// Ruta de prueba
// ===============================
app.get("/api/ping", (req, res) => {
  const idioma = req.query.idioma || "es";
  const messages = {
    es: "API funcionando correctamente",
    en: "API working correctly"
  };
  res.json({ message: messages[idioma] || messages.es });
});

// ===============================
// Ruta para generar recetas con Gemini
// ===============================
app.post("/api/recetas/ia", async (req, res) => {
  try {
    const { ingredientesSeleccionados, idioma = "es" } = req.body;

    if (!ingredientesSeleccionados || ingredientesSeleccionados.length === 0) {
      const errorMessages = {
        es: "Debes seleccionar al menos un ingrediente",
        en: "You must select at least one ingredient"
      };
      return res.status(400).json({
        error: errorMessages[idioma] || errorMessages.es,
      });
    }

    const listaIngredientes = ingredientesSeleccionados.join(", ");
    
    // Prompts según idioma
    const prompts = {
      es: `Genera exactamente 3 recetas fáciles usando PRINCIPALMENTE estos ingredientes específicos: ${listaIngredientes}. 

REGLAS IMPORTANTES:
- Debes usar principalmente los ingredientes proporcionados: ${listaIngredientes}
- Puedes agregar ingredientes básicos comunes (sal, aceite, agua) pero el foco debe estar en los ingredientes proporcionados
- Responde SOLO con un JSON válido, sin texto adicional
- El formato debe ser un array de objetos, cada uno con esta estructura:
{
  "titulo": "Nombre de la receta",
  "ingredientes": ["ingrediente1", "ingrediente2", ...],
  "pasos": ["Paso 1", "Paso 2", ...]
}

TODOS los textos (título, ingredientes y pasos) deben estar completamente en ESPAÑOL.`,
      en: `Generate exactly 3 easy recipes using MAINLY these specific ingredients: ${listaIngredientes}. 

IMPORTANT RULES:
- You must use mainly the provided ingredients: ${listaIngredientes}
- You can add basic common ingredients (salt, oil, water) but the focus must be on the provided ingredients
- Respond ONLY with valid JSON, no additional text
- The format must be an array of objects, each with this structure:
{
  "titulo": "Recipe name",
  "ingredientes": ["ingredient1", "ingredient2", ...],
  "pasos": ["Step 1", "Step 2", ...]
}

ALL texts (title, ingredients and steps) must be completely in ENGLISH.`
    };

    const prompt = prompts[idioma] || prompts.es;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // modelo nuevo
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
      const defaultTitles = {
        es: "Receta generada",
        en: "Generated recipe"
      };
      recetasIA = [
        {
          titulo: defaultTitles[idioma] || defaultTitles.es,
          ingredientes: ingredientesSeleccionados,
          pasos: [textoRespuesta],
        },
      ];
    }

    res.json({ recetas: recetasIA });
  } catch (error) {
    console.error("ERROR COMPLETO EN GEMINI:", error);
    const errorMessages = {
      es: "Error al generar las recetas. Intenta de nuevo.",
      en: "Error generating recipes. Try again."
    };
    res.status(500).json({
      error: errorMessages[req.body.idioma || "es"] || errorMessages.es,
    });
  }
});

// ===============================
// RUTA PARA LISTA DE COMPRAS CON GEMINI
// (usa el archivo routes/ai.routes.js)
// ===============================
app.use("/api/ai", require("./routes/ai.routes"));
// RUTA PARA AUTENTICACIÓN CON GOOGLE
app.use("/api/auth", require("./routes/auth.routes"));


// ===============================
// 🛒 Buscar Jumbo
// ===============================
app.get("/api/supermercados/jumbo", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const delta = 0.1;

    const north = latNum + delta;
    const south = latNum - delta;
    const west = lonNum - delta;
    const east = lonNum + delta;

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "10");
    url.searchParams.set("bounded", "1");
    url.searchParams.set("viewbox", `${west},${north},${east},${south}`);
    url.searchParams.set("q", "Jumbo supermercado");

    const respuesta = await fetch(url, {
      headers: { "User-Agent": "ProyectoDiseno/1.0 (sofia.saez.segura@gmail.com)" },
    });

    const datos = await respuesta.json();
    // ORDENAR POR DISTANCIA
const ordenados = datos
  .map((s) => ({
    ...s,
    distancia: haversineDist(
      latNum,
      lonNum,
      parseFloat(s.lat),
      parseFloat(s.lon)
    ),
  }))
  .sort((a, b) => a.distancia - b.distancia);

res.json({ resultados: ordenados });

  } catch (e) {
    const idioma = req.query.idioma || "es";
    const errorMessages = {
      es: "Error buscando Jumbo",
      en: "Error searching Jumbo"
    };
    res.status(500).json({ error: errorMessages[idioma] || errorMessages.es });
  }
});

// ===============================
// 🛒 Buscar Unimarc
// ===============================
app.get("/api/supermercados/unimarc", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const delta = 0.1;

    const north = latNum + delta;
    const south = latNum - delta;
    const west = lonNum - delta;
    const east = lonNum + delta;

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "10");
    url.searchParams.set("bounded", "1");
    url.searchParams.set("viewbox", `${west},${north},${east},${south}`);
    url.searchParams.set("q", "Unimarc supermercado");

    const respuesta = await fetch(url, {
      headers: { "User-Agent": "ProyectoDiseno/1.0 (sofia.saez.segura@gmail.com)" },
    });

    const datos = await respuesta.json();
    // ORDENAR POR DISTANCIA
const ordenados = datos
  .map((s) => ({
    ...s,
    distancia: haversineDist(
      latNum,
      lonNum,
      parseFloat(s.lat),
      parseFloat(s.lon)
    ),
  }))
  .sort((a, b) => a.distancia - b.distancia);

res.json({ resultados: ordenados });

  } catch (e) {
    const idioma = req.query.idioma || "es";
    const errorMessages = {
      es: "Error buscando Unimarc",
      en: "Error searching Unimarc"
    };
    res.status(500).json({ error: errorMessages[idioma] || errorMessages.es });
  }
});

// ===============================
// 🛒 Buscar Santa Isabel
// ===============================
app.get("/api/supermercados/santaisabel", async (req, res) => {
  try {
    const { lat, lon } = req.query;

    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    const delta = 0.1;

    const north = latNum + delta;
    const south = latNum - delta;
    const west = lonNum - delta;
    const east = lonNum + delta;

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "json");
    url.searchParams.set("addressdetails", "1");
    url.searchParams.set("limit", "10");
    url.searchParams.set("bounded", "1");
    url.searchParams.set("viewbox", `${west},${north},${east},${south}`);
    url.searchParams.set("q", "Santa Isabel supermercado");

    const respuesta = await fetch(url, {
      headers: { "User-Agent": "ProyectoDiseno/1.0 (sofia.saez.segura@gmail.com)" },
    });

    const datos = await respuesta.json();
    // ORDENAR POR DISTANCIA
const ordenados = datos
  .map((s) => ({
    ...s,
    distancia: haversineDist(
      latNum,
      lonNum,
      parseFloat(s.lat),
      parseFloat(s.lon)
    ),
  }))
  .sort((a, b) => a.distancia - b.distancia);

res.json({ resultados: ordenados });

  } catch (e) {
    const idioma = req.query.idioma || "es";
    const errorMessages = {
      es: "Error buscando Santa Isabel",
      en: "Error searching Santa Isabel"
    };
    res.status(500).json({ error: errorMessages[idioma] || errorMessages.es });
  }
});


// ===============================
// Servidor
// ===============================
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
