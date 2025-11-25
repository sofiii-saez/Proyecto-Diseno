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
    res.status(500).json({ error: "Error buscando Jumbo" });
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
    res.status(500).json({ error: "Error buscando Unimarc" });
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
    res.status(500).json({ error: "Error buscando Santa Isabel" });
  }
});


// ===============================
// Servidor
// ===============================
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
