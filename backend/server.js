const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

//ruta de prueba
app.get("/api/ping", (req, res) => {
  res.json({ message: "API funcionando correctamente" });
});

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
