import { useState, useMemo } from "react";
import "./SeleccionIngredientes.css";

function SeleccionIngredientes({ onListo }) {
  // Lista base de ingredientes
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

  // Estado para el texto de búsqueda
  const [busqueda, setBusqueda] = useState("");
  
  // Estado para los ingredientes seleccionados (solo IDs para mejor rendimiento)
  const [ingredientesSeleccionados, setIngredientesSeleccionados] = useState([]);

  // Filtrar ingredientes según la búsqueda
  const ingredientesFiltrados = useMemo(() => {
    if (!busqueda.trim()) {
      return ingredientesBase;
    }
    const busquedaLower = busqueda.toLowerCase();
    return ingredientesBase.filter((ingrediente) =>
      ingrediente.nombre.toLowerCase().includes(busquedaLower)
    );
  }, [busqueda]);

  // Agrupar ingredientes filtrados por categoría
  const ingredientesPorCategoria = useMemo(() => {
    const agrupados = {};
    ingredientesFiltrados.forEach((ingrediente) => {
      if (!agrupados[ingrediente.categoria]) {
        agrupados[ingrediente.categoria] = [];
      }
      agrupados[ingrediente.categoria].push(ingrediente);
    });
    return agrupados;
  }, [ingredientesFiltrados]);

  // Función para manejar el cambio de checkbox
  const handleToggleIngrediente = (ingrediente) => {
    setIngredientesSeleccionados((prev) => {
      const yaExiste = prev.includes(ingrediente.id);
      if (yaExiste) {
        return prev.filter((id) => id !== ingrediente.id);
      } else {
        return [...prev, ingrediente.id];
      }
    });
  };

  // Obtener lista completa de ingredientes seleccionados con sus datos
  const ingredientesSeleccionadosCompletos = useMemo(() => {
    return ingredientesBase.filter((ing) =>
      ingredientesSeleccionados.includes(ing.id)
    );
  }, [ingredientesSeleccionados]);

  // Función para el botón "Listo"
  const handleListo = () => {
    console.log("Ingredientes seleccionados:", ingredientesSeleccionadosCompletos);
    
    // Si existe la prop onListo, llamarla con los ingredientes seleccionados
    if (onListo) {
      onListo(ingredientesSeleccionadosCompletos);
    }
  };

  return (
    <div className="seleccion-ingredientes">
      <div className="seleccion-ingredientes-header">
        <h2 className="titulo-principal">¿Qué ingredientes tienes?</h2>
        <p className="subtitulo">Selecciona los ingredientes disponibles en tu cocina</p>
      </div>

      {/* Campo de búsqueda */}
      <div className="busqueda-container">
        <input
          type="text"
          placeholder="Buscar ingrediente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="busqueda-input"
        />
        <svg className="busqueda-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
      </div>

      {/* Lista de ingredientes filtrados agrupados por categoría */}
      <div className="ingredientes-lista">
        {Object.keys(ingredientesPorCategoria).length === 0 ? (
          <div className="sin-resultados">
            <p>No se encontraron ingredientes</p>
          </div>
        ) : (
          Object.entries(ingredientesPorCategoria).map(([categoria, ingredientes]) => (
            <div key={categoria} className="categoria-grupo">
              <h3 className="categoria-titulo">{categoria}</h3>
              <div className="ingredientes-grid">
                {ingredientes.map((ingrediente) => {
                  const estaSeleccionado = ingredientesSeleccionados.includes(ingrediente.id);
                  return (
                    <label
                      key={ingrediente.id}
                      className={`ingrediente-card ${estaSeleccionado ? "seleccionado" : ""}`}
                    >
                      <input
                        type="checkbox"
                        checked={estaSeleccionado}
                        onChange={() => handleToggleIngrediente(ingrediente)}
                        className="ingrediente-checkbox"
                      />
                      <span className="ingrediente-nombre">{ingrediente.nombre}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resumen de ingredientes seleccionados */}
      {ingredientesSeleccionados.length > 0 && (
        <div className="resumen-seleccionados">
          <div className="resumen-header">
            <h3 className="resumen-titulo">
              Seleccionados ({ingredientesSeleccionados.length})
            </h3>
            <button
              onClick={() => setIngredientesSeleccionados([])}
              className="btn-limpiar"
            >
              Limpiar todo
            </button>
          </div>
          <div className="resumen-chips">
            {ingredientesSeleccionadosCompletos.map((ingrediente) => (
              <span key={ingrediente.id} className="chip">
                {ingrediente.nombre}
                <button
                  onClick={() => handleToggleIngrediente(ingrediente)}
                  className="chip-close"
                  aria-label="Quitar"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botón Listo */}
      <div className="boton-listo-container">
        <button
          onClick={handleListo}
          disabled={ingredientesSeleccionados.length === 0}
          className="btn-listo"
        >
          Buscar recetas
        </button>
      </div>
    </div>
  );
}

export default SeleccionIngredientes;

