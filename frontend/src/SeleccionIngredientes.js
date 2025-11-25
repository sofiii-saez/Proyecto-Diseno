import { useState, useMemo, useEffect } from "react";
import "./SeleccionIngredientes.css";
import { obtenerIngredientesFaltantes } from "./utils/listaSupermercado";
import ListaSupermercado from "./ListaSupermercado";
import { useLanguage } from "./contexts/LanguageContext";

function SeleccionIngredientes({ user }) {
  const { t, language } = useLanguage();

  // -----------------------------
  // Lista base de ingredientes con keys internas (solo front)
  // IDs con prefijo "base-" para no chocar con backend
  // -----------------------------
  const ingredientesBaseInicial = [
    { id: "base-1", key: "tomato", categoria: "vegetables" },
    { id: "base-2", key: "onion", categoria: "vegetables" },
    { id: "base-3", key: "garlic", categoria: "vegetables" },
    { id: "base-4", key: "pepper", categoria: "vegetables" },
    { id: "base-5", key: "carrot", categoria: "vegetables" },
    { id: "base-6", key: "lettuce", categoria: "vegetables" },
    { id: "base-7", key: "milk", categoria: "dairy" },
    { id: "base-8", key: "cheese", categoria: "dairy" },
    { id: "base-9", key: "butter", categoria: "dairy" },
    { id: "base-10", key: "yogurt", categoria: "dairy" },
    { id: "base-11", key: "chicken", categoria: "meat" },
    { id: "base-12", key: "beef", categoria: "meat" },
    { id: "base-13", key: "pork", categoria: "meat" },
    { id: "base-14", key: "fish", categoria: "meat" },
    { id: "base-15", key: "eggs", categoria: "meat" },
  ];

  // Base en estado (para poder eliminar del front)
  const [ingredientesBase, setIngredientesBase] = useState(ingredientesBaseInicial);

  // Ingredientes que vienen del backend (los que vamos creando)
  const [ingredientesExtras, setIngredientesExtras] = useState([]);

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

  // -----------------------------
  // 🆕 ESTADOS PARA CRUD DE INGREDIENTES
  // -----------------------------
  const [categoriaNuevoIng, setCategoriaNuevoIng] = useState("vegetables");
  const [cargandoNuevoIng, setCargandoNuevoIng] = useState(false);
  const [errorNuevoIng, setErrorNuevoIng] = useState(null);

  const API_INGREDIENTES = "http://localhost:4000/api/ingredientes";

  // Categorías disponibles para el select (internas + texto en ES/EN)
  const CATEGORIAS_DISPONIBLES = [
    { value: "fruits", labelEs: "Frutas", labelEn: "Fruits" },
    { value: "vegetables", labelEs: "Verduras", labelEn: "Vegetables" },
    { value: "meat", labelEs: "Carnes", labelEn: "Meats" },
    { value: "dairy", labelEs: "Lácteos", labelEn: "Dairy" },
    { value: "seasonings", labelEs: "Aliños", labelEn: "Seasonings" },
    { value: "other", labelEs: "Otros", labelEn: "Others" },
  ];

  // -----------------------------
  // 🔄 Cargar ingredientes desde backend al montar
  // (solo los creados por el usuario)
  // -----------------------------
  useEffect(() => {
    const cargarIngredientesExtras = async () => {
      try {
        const resp = await fetch(API_INGREDIENTES);
        const data = await resp.json();
        const lista = Array.isArray(data.ingredientes) ? data.ingredientes : [];
        const adaptados = lista.map((ing) => ({
          id: `db-${ing.id}`,      // ID único en el front
          backendId: ing.id,       // ID real del backend
          nombre: ing.nombre,      // nombre libre
          categoria: ing.categoria || "other",
        }));
        setIngredientesExtras(adaptados);
      } catch (err) {
        console.error("Error cargando ingredientes desde backend:", err);
      }
    };

    cargarIngredientesExtras();
  }, []);

  // -----------------------------
  // 🛒 Buscar supermercados por cadena
  // -----------------------------
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
  // Lista completa de ingredientes (base + extras)
  // -----------------------------
  const todosLosIngredientes = useMemo(
    () => [...ingredientesBase, ...ingredientesExtras],
    [ingredientesBase, ingredientesExtras]
  );

  // -----------------------------
  // Filtrar ingredientes por búsqueda
  // -----------------------------
  const ingredientesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return todosLosIngredientes;

    const b = busqueda.toLowerCase();

    return todosLosIngredientes.filter((i) => {
      // Si tiene key, usamos la traducción (ingredientes base)
      if (i.key) {
        const nombreTraducido = t(`ingredients.${i.key}`).toLowerCase();
        return nombreTraducido.includes(b);
      }
      // Si no tiene key, usamos el nombre libre desde backend
      const nombreLibre = (i.nombre || "").toLowerCase();
      return nombreLibre.includes(b);
    });
  }, [busqueda, t, language, todosLosIngredientes]);

  const ingredientesPorCategoria = useMemo(() => {
    const map = {};
    ingredientesFiltrados.forEach((i) => {
      const cat = i.categoria || "other";
      if (!map[cat]) map[cat] = [];
      map[cat].push(i);
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
    return todosLosIngredientes.filter((i) =>
      ingredientesSeleccionados.includes(i.id)
    );
  }, [ingredientesSeleccionados, todosLosIngredientes]);

  const nombresIngredientesSeleccionados = useMemo(() => {
    return ingredientesSeleccionadosCompletos.map((i) =>
      i.key ? t(`ingredients.${i.key}`) : i.nombre
    );
  }, [ingredientesSeleccionadosCompletos, t]);

  // -----------------------------
  // 🗑 Eliminar ingrediente (CRUD: Delete)
  // -----------------------------
  const handleEliminarIngrediente = async (ingrediente) => {
    // Si es un ingrediente base: solo lo sacamos del estado local
    if (!ingrediente.backendId) {
      setIngredientesBase((prev) => prev.filter((i) => i.id !== ingrediente.id));
      setIngredientesSeleccionados((prev) =>
        prev.filter((id) => id !== ingrediente.id)
      );
      return;
    }

    // Si viene del backend, llamamos al DELETE
    try {
      const resp = await fetch(`${API_INGREDIENTES}/${ingrediente.backendId}`, {
        method: "DELETE",
      });

      const data = await resp.json();
      if (!resp.ok) {
        console.error("Error al eliminar ingrediente:", data);
        alert(
          language === "es"
            ? data.error || "Error eliminando ingrediente"
            : data.error || "Error deleting ingredient"
        );
        return;
      }

      // Lo sacamos del estado local
      setIngredientesExtras((prev) =>
        prev.filter((i) => i.id !== ingrediente.id)
      );
      setIngredientesSeleccionados((prev) =>
        prev.filter((id) => id !== ingrediente.id)
      );
    } catch (err) {
      console.error("Error de conexión al eliminar ingrediente:", err);
      alert(
        language === "es"
          ? "Error de conexión al eliminar ingrediente"
          : "Connection error while deleting ingredient"
      );
    }
  };

  // -----------------------------
  // ➕ Añadir ingrediente cuando no hay resultados (CRUD: Create)
  // -----------------------------
  const handleAgregarIngrediente = async () => {
    const nombreNuevo = busqueda.trim();
    if (!nombreNuevo) return;

    setCargandoNuevoIng(true);
    setErrorNuevoIng(null);

    try {
      const resp = await fetch(API_INGREDIENTES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: nombreNuevo,
          categoria: categoriaNuevoIng,
          idioma: language,
        }),
      });

      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || "Error al crear ingrediente");
      }

      const ing = data.ingrediente;

      const nuevoIngredienteFront = {
        id: `db-${ing.id}`,
        backendId: ing.id,
        nombre: ing.nombre,
        categoria: ing.categoria || categoriaNuevoIng,
      };

      setIngredientesExtras((prev) => [...prev, nuevoIngredienteFront]);
      // Lo marcamos automáticamente como seleccionado
      setIngredientesSeleccionados((prev) => [...prev, nuevoIngredienteFront.id]);
    } catch (err) {
      console.error("Error creando ingrediente:", err);
      setErrorNuevoIng(
        err.message ||
          (language === "es"
            ? "Error al crear ingrediente"
            : "Error creating ingredient")
      );
    } finally {
      setCargandoNuevoIng(false);
    }
  };

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
            idioma: language, // Guardar el idioma actual
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
  const noResultsText =
    language === "es"
      ? `No encontramos "${busqueda}". ¿Quieres añadirlo como ingrediente?`
      : `We couldn't find "${busqueda}". Do you want to add it as an ingredient?`;

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

      {/* Ingredientes por categoría o mensaje de no resultados */}
      <div className="ingredientes-lista">
        {Object.keys(ingredientesPorCategoria).length > 0 ? (
          Object.keys(ingredientesPorCategoria).map((categoria) => (
            <div key={categoria} className="categoria-grupo">
              <h3 className="categoria-titulo">
                {t(`categories.${categoria}`)}
              </h3>
              <div className="ingredientes-grid">
                {ingredientesPorCategoria[categoria].map((ingrediente) => {
                  const sel = ingredientesSeleccionados.includes(ingrediente.id);
                  const nombreVisible = ingrediente.key
                    ? t(`ingredients.${ingrediente.key}`)
                    : ingrediente.nombre;

                  return (
                    <div
                      key={ingrediente.id}
                      className={`ingrediente-card ${
                        sel ? "seleccionado" : ""
                      }`}
                    >
                      <div className="ingrediente-main">
                        <input
                          type="checkbox"
                          checked={sel}
                          onChange={() => handleToggleIngrediente(ingrediente)}
                          className="ingrediente-checkbox"
                        />
                        <span className="ingrediente-nombre">
                          {nombreVisible}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn-eliminar-ingrediente"
                        onClick={() => handleEliminarIngrediente(ingrediente)}
                        title={
                          language === "es"
                            ? "Eliminar ingrediente"
                            : "Delete ingredient"
                        }
                      >
                        🗑
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : busqueda.trim() ? (
          <div className="sin-resultados">
            <p>{noResultsText}</p>
            <div className="agregar-ingrediente-form">
              <label>
                {language === "es" ? "Categoría:" : "Category:"}
              </label>
              <select
                value={categoriaNuevoIng}
                onChange={(e) => setCategoriaNuevoIng(e.target.value)}
              >
                {CATEGORIAS_DISPONIBLES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {language === "es" ? cat.labelEs : cat.labelEn}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-listo"
                style={{ maxWidth: "260px" }}
                disabled={cargandoNuevoIng || !busqueda.trim()}
                onClick={handleAgregarIngrediente}
              >
                {cargandoNuevoIng
                  ? language === "es"
                    ? "Guardando..."
                    : "Saving..."
                  : language === "es"
                  ? "Añadir ingrediente"
                  : "Add ingredient"}
              </button>
              {errorNuevoIng && (
                <p style={{ color: "red", marginTop: "0.5rem" }}>{errorNuevoIng}</p>
              )}
            </div>
          </div>
        ) : null}
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
        <div className="recetas-container">
          <h2 className="recetas-titulo">
            {t("selection.recipesGenerated")}
          </h2>
          <div className="recetas-grid">
            {recetas.map((receta, index) => {
              const esFavorita = favoritasMap[receta.titulo];
              return (
                <div key={index} className="receta-card">
                  {/* Botón de estrella (favorita) */}
                  {user && (
                    <button
                      onClick={() => handleToggleFavorita(receta)}
                      className="receta-favorita-btn"
                      title={
                        esFavorita
                          ? "Quitar de favoritas"
                          : "Agregar a favoritas"
                      }
                    >
                      {esFavorita ? "⭐" : "☆"}
                    </button>
                  )}

                  {/* Título de la receta */}
                  <h3
                    className="receta-titulo"
                    style={{ paddingRight: user ? "40px" : "0" }}
                  >
                    {receta.titulo || `Receta ${index + 1}`}
                  </h3>

                  {/* Ingredientes */}
                  <div className="receta-seccion">
                    <h4 className="receta-seccion-titulo">
                      {t("selection.ingredients")}
                    </h4>
                    <ul className="receta-lista">
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
                  <div className="receta-seccion">
                    <h4 className="receta-seccion-titulo">
                      {t("selection.steps")}
                    </h4>
                    <ol className="receta-lista">
                      {Array.isArray(receta.pasos) ? (
                        receta.pasos.map((paso, i) => (
                          <li key={i} className="receta-paso-item">
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
                    className="receta-supermercado-btn"
                  >
                    {listasVisibles[index]
                      ? t("selection.hideShoppingList")
                      : t("selection.viewShoppingList")}
                  </button>

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
      <div className="supermercados-container">
        <h2 style={{ marginBottom: "15px" }}>{t("supermarket.title")}</h2>

        <p style={{ marginBottom: "8px" }}>
          {t("supermarket.description")}
        </p>

        <div className="supermercados-botones">
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
                {s.distancia && (
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
