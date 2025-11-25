import { useState, useMemo } from "react";
import "./SeleccionIngredientes.css";
import { obtenerIngredientesFaltantes } from "./utils/listaSupermercado";
import ListaSupermercado from "./ListaSupermercado";

function SeleccionIngredientes() {
  // -----------------------------
  // Lista base de ingredientes
  // -----------------------------
  const ingredientesBase = [
    { id: 1, nombre: "Tomate", categoria: "Verduras" },
    { id: 2, nombre: "Cebolla", categoria: "Verduras" },
    { id: 3, nombre: "Ajo", categoria: "Verduras" },
    { id: 4, nombre: "Pimiento", categoria: "Verduras" },
    { id: 5, nombre: "Zanahoria", categoria: "Verduras" },
    { id: 6, nombre: "Lechuga", categoria: "Verduras" },
    { id: 7, nombre: "Leche", categoria: "Lácteos" },
    { id: 8, nombre: "Queso", categoria: "Lácteos" },
    { id: 9, nombre: "Mantequilla", categoria: "Lácteos" },
    { id: 10, nombre: "Yogur", categoria: "Lácteos" },
    { id: 11, nombre: "Pollo", categoria: "Carnes" },
    { id: 12, nombre: "Carne de res", categoria: "Carnes" },
    { id: 13, nombre: "Cerdo", categoria: "Carnes" },
    { id: 14, nombre: "Pescado", categoria: "Carnes" },
    { id: 15, nombre: "Huevos", categoria: "Carnes" },
  ];

  // -----------------------------
  // Estados base del componente
  // -----------------------------
  const [busqueda, setBusqueda] = useState("");
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [recetas, setRecetas] = useState([]);
  const [error, setError] = useState(null);

  const [listasVisibles, setListasVisibles] = useState({});
  const [ingredientesFaltantesPorReceta, setIngredientesFaltantesPorReceta] =
    useState({});

  // -----------------------------
  // 🆕 ESTADOS PARA SUPERMERCADOS
  // -----------------------------
  const [supermercados, setSupermercados] = useState([]);
  const [cargandoSuper, setCargandoSuper] = useState(false);
  const [errorSuper, setErrorSuper] = useState(null);

  // Función genérica para buscar por cadena específica
  const buscarPorCadena = (cadena) => {
    setCargandoSuper(true);
    setErrorSuper(null);
    setSupermercados([]);

    if (!navigator.geolocation) {
      setErrorSuper("Tu navegador no soporta geolocalización.");
      setCargandoSuper(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        fetch(
          `http://localhost:4000/api/supermercados/${cadena}?lat=${lat}&lon=${lon}`
        )
          .then((r) => r.json())
          .then((data) => setSupermercados(data.resultados || []))
          .catch(() =>
            setErrorSuper("No se pudo obtener resultados cercanos :(")
          )
          .finally(() => setCargandoSuper(false));
      },
      () => {
        setErrorSuper("Debes permitir la ubicación para buscar supermercados.");
        setCargandoSuper(false);
      }
    );
  };

  const handleBuscarJumbo = () => buscarPorCadena("jumbo");
  const handleBuscarUnimarc = () => buscarPorCadena("unimarc");
  const handleBuscarSantaIsabel = () => buscarPorCadena("santaisabel");

  // -----------------------------
  // Filtrar ingredientes por búsqueda
  // -----------------------------
  const ingredientesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return ingredientesBase;
    const b = busqueda.toLowerCase();
    return ingredientesBase.filter((i) => i.nombre.toLowerCase().includes(b));
  }, [busqueda]);

  const ingredientesPorCategoria = useMemo(() => {
    const map = {};
    ingredientesFiltrados.forEach((i) => {
      if (!map[i.categoria]) map[i.categoria] = [];
      map[i.categoria].push(i);
    });
    return map;
  }, [ingredientesFiltrados]);

  // -----------------------------
  // Manejar checkboxes de ingredientes
  // -----------------------------
  const handleToggleIngrediente = (ingrediente) => {
    setIngredientesSeleccionados((prev) =>
      prev.includes(ingrediente.id)
        ? prev.filter((id) => id !== ingrediente.id)
        : [...prev, ingrediente.id]
    );
  };

  const ingredientesSeleccionadosCompletos = useMemo(() => {
    return ingredientesBase.filter((i) =>
      ingredientesSeleccionados.includes(i.id)
    );
  }, [ingredientesSeleccionados]);

  const nombresIngredientesSeleccionados = useMemo(() => {
    return ingredientesSeleccionadosCompletos.map((i) => i.nombre);
  }, [ingredientesSeleccionadosCompletos]);

  // -----------------------------
  // Mostrar ingredientes faltantes
  // -----------------------------
  const handleVerListaSupermercado = (index) => {
    const receta = recetas[index];

    if (listasVisibles[index]) {
      setListasVisibles((prev) => {
        const n = { ...prev };
        delete n[index];
        return n;
      });
      return;
    }

    const ingReceta = Array.isArray(receta.ingredientes)
      ? receta.ingredientes
      : receta.ingredientes
      ? [receta.ingredientes]
      : [];

    const faltantes = obtenerIngredientesFaltantes(
      ingReceta,
      nombresIngredientesSeleccionados
    );

    setIngredientesFaltantesPorReceta((prev) => ({
      ...prev,
      [index]: faltantes,
    }));

    setListasVisibles((prev) => ({
      ...prev,
      [index]: true,
    }));
  };

  // -----------------------------
  // Buscar recetas con IA
  // -----------------------------
  const handleListo = async () => {
    if (ingredientesSeleccionados.length === 0) return;

    const nombresIngredientes = ingredientesSeleccionadosCompletos.map(
      (i) => i.nombre
    );

    setCargando(true);
    setError(null);
    setRecetas([]);

    try {
      const respuesta = await fetch("http://localhost:4000/api/recetas/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredientesSeleccionados: nombresIngredientes }),
      });

      const datos = await respuesta.json();
      if (!respuesta.ok)
        throw new Error(datos.error || "No fue posible obtener recetas");

      const recetasArray = Array.isArray(datos.recetas)
        ? datos.recetas
        : [datos.recetas];

      setRecetas(recetasArray);
    } catch (err) {
      setError(err.message || "Error obteniendo recetas");
    } finally {
      setCargando(false);
    }
  };

  // ======================================================
  // RENDER
  // ======================================================
  return (
    <div className="seleccion-ingredientes">
      <div className="seleccion-ingredientes-header">
        <h2 className="titulo-principal">¿Qué ingredientes tienes?</h2>
        <p className="subtitulo">
          Selecciona los ingredientes disponibles en tu cocina
        </p>
      </div>

      {/* Buscador */}
      <div className="busqueda-container">
        <input
          type="text"
          placeholder="Buscar ingrediente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="busqueda-input"
        />
      </div>

      {/* Ingredientes por categoría */}
      <div className="ingredientes-lista">
        {Object.keys(ingredientesPorCategoria).map((categoria) => (
          <div key={categoria} className="categoria-grupo">
            <h3 className="categoria-titulo">{categoria}</h3>
            <div className="ingredientes-grid">
              {ingredientesPorCategoria[categoria].map((ingrediente) => {
                const sel = ingredientesSeleccionados.includes(ingrediente.id);
                return (
                  <label
                    key={ingrediente.id}
                    className={`ingrediente-card ${
                      sel ? "seleccionado" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={sel}
                      onChange={() => handleToggleIngrediente(ingrediente)}
                      className="ingrediente-checkbox"
                    />
                    <span className="ingrediente-nombre">
                      {ingrediente.nombre}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Botón recetas */}
      <div className="boton-listo-container">
        <button
          onClick={handleListo}
          disabled={ingredientesSeleccionados.length === 0 || cargando}
          className="btn-listo"
        >
          {cargando ? "Generando recetas..." : "Buscar recetas"}
        </button>
      </div>

      {/* Mostrar error de recetas */}
      {error && (
        <div style={{ color: "red", marginTop: "20px", textAlign: "center" }}>
          ❌ {error}
        </div>
      )}

      {/* Mostrar recetas */}
      {recetas.length > 0 && (
        <div style={{ marginTop: "30px" }}>
          <h2 style={{ textAlign: "center" }}>Recetas Generadas</h2>

          <div style={{ display: "grid", gap: "20px" }}>
            {recetas.map((receta, index) => (
              <div key={index} className="tarjeta-receta">
                <h3>{receta.titulo}</h3>

                <h4>Ingredientes:</h4>
                <ul>
                  {receta.ingredientes?.map((i, idx) => (
                    <li key={idx}>{i}</li>
                  ))}
                </ul>

                <h4>Pasos:</h4>
                <ol>
                  {receta.pasos?.map((p, idx) => (
                    <li key={idx}>{p}</li>
                  ))}
                </ol>

                <button
                  onClick={() => handleVerListaSupermercado(index)}
                  className="btn-ver-lista"
                >
                  {listasVisibles[index]
                    ? "Ocultar lista de supermercado"
                    : "Ver lista de supermercado"}
                </button>

                {listasVisibles[index] && (
                  <ListaSupermercado
                    ingredientesFaltantes={
                      ingredientesFaltantesPorReceta[index] || []
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================
           🛒 SUPERMERCADOS CERCANOS POR CADENA
         ====================================================== */}
      <div
        style={{
          marginTop: "40px",
          padding: "20px",
          background: "#f5f5f5",
          borderRadius: "12px",
        }}
      >
        <h2 style={{ marginBottom: "15px" }}>Supermercados cercanos 🛒</h2>

        <p style={{ marginBottom: "8px" }}>
          Elige una cadena para buscar sucursales cerca de tu ubicación:
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <button onClick={handleBuscarJumbo} className="btn-listo">
            Buscar Jumbo
          </button>

          <button
            onClick={handleBuscarUnimarc}
            className="btn-listo"
            style={{ background: "#4caf50" }}
          >
            Buscar Unimarc
          </button>

          <button
            onClick={handleBuscarSantaIsabel}
            className="btn-listo"
            style={{ background: "#ff7043" }}
          >
            Buscar Santa Isabel
          </button>
        </div>

        {cargandoSuper && (
          <p style={{ marginTop: "10px" }}>Buscando supermercados...</p>
        )}

        {errorSuper && (
          <p style={{ color: "red", marginTop: "10px" }}>{errorSuper}</p>
        )}

        {supermercados.length > 0 && (
          <ul style={{ marginTop: "20px", listStyle: "none", padding: 0 }}>
            {supermercados.map((s) => (
              <li
                key={s.place_id}
                style={{
                  padding: "12px",
                  background: "white",
                  marginBottom: "10px",
                  borderRadius: "8px",
                  boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                }}
              >
                <strong>{s.name || s.display_name}</strong>
{ s.distancia && (
  <div style={{ fontSize: "14px", color: "#555" }}>
    {s.distancia.toFixed(2)} km
  </div>
)}

                <br />
                {s.address?.road},{" "}
                {s.address?.city || s.address?.town || s.address?.village}
                <br />
                <a
                  href={`https://www.google.com/maps?q=${s.lat},${s.lon}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  📍 Ver en Google Maps
                </a>
              </li>
            ))}
          </ul>
        )}

        {supermercados.length === 0 && !cargandoSuper && !errorSuper && (
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
            Elige una cadena para comenzar.
          </p>
        )}
      </div>
    </div>
  );
}

export default SeleccionIngredientes;
