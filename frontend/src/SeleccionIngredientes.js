import { useState, useMemo } from "react";
import "./SeleccionIngredientes.css";
import { obtenerIngredientesFaltantes } from "./utils/listaSupermercado";
import ListaSupermercado from "./ListaSupermercado";
import { useLanguage } from "./contexts/LanguageContext";

function SeleccionIngredientes({ user }) {
  const { t, language } = useLanguage();

  // -----------------------------
  // Lista base de ingredientes con keys internas
  // -----------------------------
  const ingredientesBase = [
    { id: 1, key: "tomato", categoria: "vegetables" },
    { id: 2, key: "onion", categoria: "vegetables" },
    { id: 3, key: "garlic", categoria: "vegetables" },
    { id: 4, key: "pepper", categoria: "vegetables" },
    { id: 5, key: "carrot", categoria: "vegetables" },
    { id: 6, key: "lettuce", categoria: "vegetables" },
    { id: 7, key: "milk", categoria: "dairy" },
    { id: 8, key: "cheese", categoria: "dairy" },
    { id: 9, key: "butter", categoria: "dairy" },
    { id: 10, key: "yogurt", categoria: "dairy" },
    { id: 11, key: "chicken", categoria: "meat" },
    { id: 12, key: "beef", categoria: "meat" },
    { id: 13, key: "pork", categoria: "meat" },
    { id: 14, key: "fish", categoria: "meat" },
    { id: 15, key: "eggs", categoria: "meat" },
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
  
  // Estado para favoritas (mapa de título de receta -> favorita_id)
  const [favoritasMap, setFavoritasMap] = useState({});

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
      setErrorSuper(t("supermarket.noGeolocation"));
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
            setErrorSuper(t("supermarket.searchError"))
          )
          .finally(() => setCargandoSuper(false));
      },
      () => {
        setErrorSuper(t("supermarket.locationError"));
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
    return ingredientesBase.filter((i) => {
      const nombreTraducido = t(`ingredients.${i.key}`).toLowerCase();
      return nombreTraducido.includes(b);
    });
  }, [busqueda, t, language]);

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
    return ingredientesSeleccionadosCompletos.map((i) => t(`ingredients.${i.key}`));
  }, [ingredientesSeleccionadosCompletos, t]);

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
  // Verificar si recetas están en favoritas
  // -----------------------------
  const verificarFavoritas = async (recetas) => {
    if (!user || !user.id) return;
    
    const nuevoMap = {};
    for (const receta of recetas) {
      try {
        const response = await fetch(
          `http://localhost:4000/api/favoritas/check/${user.id}?titulo=${encodeURIComponent(receta.titulo)}`
        );
        const data = await response.json();
        if (data.esFavorita) {
          nuevoMap[receta.titulo] = data.favorita_id;
        }
      } catch (err) {
        console.error("Error verificando favorita:", err);
      }
    }
    setFavoritasMap(nuevoMap);
  };

  // -----------------------------
  // Agregar/eliminar de favoritas
  // -----------------------------
  const handleToggleFavorita = async (receta) => {
    if (!user || !user.id) {
      alert("Debes iniciar sesión para guardar favoritas");
      return;
    }

    const esFavorita = favoritasMap[receta.titulo];

    if (esFavorita) {
      // Eliminar de favoritas
      try {
        const response = await fetch(
          `http://localhost:4000/api/favoritas/${esFavorita}`,
          {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ usuario_id: user.id }),
          }
        );

        if (response.ok) {
          setFavoritasMap((prev) => {
            const nuevo = { ...prev };
            delete nuevo[receta.titulo];
            return nuevo;
          });
        } else {
          alert("Error eliminando de favoritas");
        }
      } catch (err) {
        console.error("Error eliminando favorita:", err);
        alert("Error de conexión");
      }
    } else {
      // Agregar a favoritas
      try {
        const response = await fetch("http://localhost:4000/api/favoritas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario_id: user.id,
            titulo: receta.titulo,
            ingredientes: Array.isArray(receta.ingredientes)
              ? receta.ingredientes
              : [receta.ingredientes],
            pasos: Array.isArray(receta.pasos) ? receta.pasos : [receta.pasos],
          }),
        });

        const data = await response.json();
        if (response.ok) {
          setFavoritasMap((prev) => ({
            ...prev,
            [receta.titulo]: data.favorita.id,
          }));
        } else {
          alert(data.error || "Error guardando en favoritas");
        }
      } catch (err) {
        console.error("Error agregando favorita:", err);
        alert("Error de conexión");
      }
    }
  };

  // -----------------------------
  // Buscar recetas con IA
  // -----------------------------
  const handleListo = async () => {
    if (ingredientesSeleccionados.length === 0) return;

    // Usar los nombres traducidos que ya están calculados
    const nombresIngredientes = nombresIngredientesSeleccionados;

    setCargando(true);
    setError(null);
    setRecetas([]);

    try {
      const respuesta = await fetch("http://localhost:4000/api/recetas/ia", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          ingredientesSeleccionados: nombresIngredientes,
          idioma: language
        }),
      });

      const datos = await respuesta.json();
      if (!respuesta.ok)
        throw new Error(datos.error || t("selection.noRecipesError"));

      const recetasArray = Array.isArray(datos.recetas)
        ? datos.recetas
        : [datos.recetas];

      setRecetas(recetasArray);
      
      // Verificar favoritas para las nuevas recetas
      if (user && user.id) {
        verificarFavoritas(recetasArray);
      }
    } catch (err) {
      setError(err.message || t("selection.recipeError"));
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
        <h2 className="titulo-principal">{t("selection.title")}</h2>
        <p className="subtitulo">
          {t("selection.subtitle")}
        </p>
      </div>

      {/* Buscador */}
      <div className="busqueda-container">
        <input
          type="text"
          placeholder={t("selection.searchPlaceholder")}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="busqueda-input"
        />
      </div>

      {/* Ingredientes por categoría */}
      <div className="ingredientes-lista">
        {Object.keys(ingredientesPorCategoria).map((categoria) => (
          <div key={categoria} className="categoria-grupo">
            <h3 className="categoria-titulo">{t(`categories.${categoria}`)}</h3>
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
                      {t(`ingredients.${ingrediente.key}`)}
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
          {cargando ? t("selection.generatingRecipes") : t("selection.generateRecipes")}
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
  <div
    style={{
      marginTop: "40px",
      padding: "20px",
    }}
  >
    <h2
      style={{
        textAlign: "center",
        marginBottom: "30px",
        color: "#333",
      }}
    >
      {t("selection.recipesGenerated")}
    </h2>
    <div
      style={{
        display: "grid",
        gap: "20px",
        maxWidth: "800px",
        margin: "0 auto",
      }}
    >
      {recetas.map((receta, index) => {
        const esFavorita = favoritasMap[receta.titulo];
        return (
        <div
          key={index}
          style={{
            backgroundColor: "#fff",
            border: "2px solid #e0e0e0",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            position: "relative",
            transition: "transform 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-4px)";
            e.currentTarget.style.boxShadow = "0 6px 16px rgba(0,0,0,0.15)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
          }}
        >
          {/* Botón de estrella (favorita) */}
          {user && (
            <button
              onClick={() => handleToggleFavorita(receta)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "none",
                border: "none",
                fontSize: "28px",
                cursor: "pointer",
                padding: "5px",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = "scale(1.2)";
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = "scale(1)";
              }}
              title={esFavorita ? "Quitar de favoritas" : "Agregar a favoritas"}
            >
              {esFavorita ? "⭐" : "☆"}
            </button>
          )}

          {/* Título de la receta */}
          <h3
            style={{
              marginTop: 0,
              marginBottom: "16px",
              color: "#1976d2",
              fontSize: "26px",
              fontWeight: "bold",
              paddingRight: user ? "40px" : "0",
            }}
          >
            {receta.titulo || `Receta ${index + 1}`}
          </h3>

          {/* Ingredientes */}
          <div style={{ marginBottom: "20px" }}>
            <h4
              style={{
                marginBottom: "10px",
                color: "#333",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              {t("selection.ingredients")}
            </h4>
            <ul
              style={{
                margin: 0,
                paddingLeft: "24px",
                color: "#666",
                lineHeight: "1.8",
              }}
            >
              {Array.isArray(receta.ingredientes) ? (
                receta.ingredientes.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))
              ) : (
                <li>{receta.ingredientes || "No especificado"}</li>
              )}
            </ul>
          </div>

          {/* Pasos */}
          <div style={{ marginBottom: "20px" }}>
            <h4
              style={{
                marginBottom: "10px",
                color: "#333",
                fontSize: "18px",
                fontWeight: "600",
              }}
            >
              {t("selection.steps")}
            </h4>
            <ol
              style={{
                margin: 0,
                paddingLeft: "24px",
                color: "#666",
                lineHeight: "1.8",
              }}
            >
              {Array.isArray(receta.pasos) ? (
                receta.pasos.map((paso, i) => (
                  <li key={i} style={{ marginBottom: "10px" }}>
                    {paso}
                  </li>
                ))
              ) : (
                <li>{receta.pasos || "No especificado"}</li>
              )}
            </ol>
          </div>

          {/* Botón para ver lista de supermercado */}
          <button
            onClick={() => handleVerListaSupermercado(index)}
            style={{
              padding: "12px 24px",
              backgroundColor: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: "600",
              marginTop: "8px",
              transition: "background-color 0.2s ease",
              width: "100%",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#45a049";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "#4caf50";
            }}
          >
            {listasVisibles[index]
              ? t("selection.hideShoppingList")
              : t("selection.viewShoppingList")}
          </button>

          {/* Mostrar lista de supermercado si está visible */}
          {listasVisibles[index] && (
            <ListaSupermercado
              ingredientesFaltantes={
                ingredientesFaltantesPorReceta[index] || []
              }
            />
          )}
        </div>
        );
      })}
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
        <h2 style={{ marginBottom: "15px" }}>{t("supermarket.title")}</h2>

        <p style={{ marginBottom: "8px" }}>
          {t("supermarket.description")}
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
            {t("supermarket.searchJumbo")}
          </button>

          <button
            onClick={handleBuscarUnimarc}
            className="btn-listo"
            style={{ background: "#4caf50" }}
          >
            {t("supermarket.searchUnimarc")}
          </button>

          <button
            onClick={handleBuscarSantaIsabel}
            className="btn-listo"
            style={{ background: "#ff7043" }}
          >
            {t("supermarket.searchSantaIsabel")}
          </button>
        </div>

        {cargandoSuper && (
          <p style={{ marginTop: "10px" }}>{t("supermarket.searching")}</p>
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
                  {t("supermarket.viewOnMaps")}
                </a>
              </li>
            ))}
          </ul>
        )}

        {supermercados.length === 0 && !cargandoSuper && !errorSuper && (
          <p style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
            {t("supermarket.chooseChain")}
          </p>
        )}
      </div>
    </div>
  );
}

export default SeleccionIngredientes;
