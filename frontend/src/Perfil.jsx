// ===============================
// Componente: Perfil
// Muestra las recetas favoritas del usuario
// ===============================
import { useState, useEffect } from "react";
import { useLanguage } from "./contexts/LanguageContext";
import "./Perfil.css";

function Perfil({ user }) {
  const { t, language } = useLanguage();
  const [favoritas, setFavoritas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [traduciendo, setTraduciendo] = useState({}); // Mapa de IDs que se están traduciendo

  // Cargar favoritas al montar el componente o cuando cambia el idioma
  useEffect(() => {
    if (user && user.id) {
      cargarFavoritas();
    }
  }, [user, language]);

  const cargarFavoritas = async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4000/api/favoritas/${user.id}`
      );
      const data = await response.json();
      if (response.ok) {
        const favoritasCargadas = data.favoritas || [];
        
        // Traducir automáticamente las recetas que están en un idioma diferente
        const favoritasTraducidas = await Promise.all(
          favoritasCargadas.map(async (receta) => {
            // Si el idioma de la receta es diferente al idioma actual, traducir
            if (receta.idioma && receta.idioma !== language) {
              try {
                setTraduciendo((prev) => ({ ...prev, [receta.id]: true }));
                const translateResponse = await fetch(
                  `http://localhost:4000/api/favoritas/translate/${receta.id}`,
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ idioma_destino: language }),
                  }
                );
                
                if (translateResponse.ok) {
                  const traduccion = await translateResponse.json();
                  setTraduciendo((prev) => {
                    const nuevo = { ...prev };
                    delete nuevo[receta.id];
                    return nuevo;
                  });
                  return { ...receta, ...traduccion, traducida: true };
                } else {
                  // Si falla la traducción, mostrar la original
                  setTraduciendo((prev) => {
                    const nuevo = { ...prev };
                    delete nuevo[receta.id];
                    return nuevo;
                  });
                  return receta;
                }
              } catch (translateErr) {
                console.error("Error traduciendo receta:", translateErr);
                setTraduciendo((prev) => {
                  const nuevo = { ...prev };
                  delete nuevo[receta.id];
                  return nuevo;
                });
                return receta;
              }
            }
            return receta;
          })
        );
        
        setFavoritas(favoritasTraducidas);
      } else {
        setError(data.error || t("profile.error"));
      }
    } catch (err) {
      console.error("Error cargando favoritas:", err);
      setError(t("profile.connectionError"));
    } finally {
      setCargando(false);
    }
  };

  const handleEliminarFavorita = async (favoritaId) => {
    try {
      const response = await fetch(
        `http://localhost:4000/api/favoritas/${favoritaId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ usuario_id: user.id }),
        }
      );

      if (response.ok) {
        // Recargar favoritas
        cargarFavoritas();
      } else {
        const data = await response.json();
        alert(data.error || t("profile.error"));
      }
    } catch (err) {
      console.error("Error eliminando favorita:", err);
      alert(t("profile.connectionError"));
    }
  };

  return (
    <div className="perfil-container">
      <div className="perfil-header">
        <h1 className="perfil-title">⭐ {t("profile.title")}</h1>
        <p className="perfil-subtitle">
          {t("profile.subtitle", { name: user.name, count: favoritas.length })}
        </p>
      </div>

      {cargando ? (
        <div className="perfil-loading">
          <p>{t("profile.loading")}</p>
        </div>
      ) : error ? (
        <div className="perfil-error">
          <p>❌ {error}</p>
        </div>
      ) : favoritas.length === 0 ? (
        <div className="perfil-empty">
          <p className="perfil-empty-text">
            {t("profile.empty")}
            <br />
            {t("profile.emptyHint")}
          </p>
        </div>
      ) : (
        <div className="perfil-recetas-grid">
          {favoritas.map((receta) => (
            <div key={receta.id} className="perfil-receta-card">
              {/* Header de la tarjeta con botón eliminar */}
              <div className="perfil-card-header">
                <div style={{ flex: 1 }}>
                  <h3 className="perfil-receta-titulo">{receta.titulo}</h3>
                  {traduciendo[receta.id] && (
                    <p className="perfil-traduciendo">🔄 Traduciendo...</p>
                  )}
                  {receta.traducida && !traduciendo[receta.id] && (
                    <p className="perfil-traducida">✓ Traducida</p>
                  )}
                </div>
                <button
                  onClick={() => handleEliminarFavorita(receta.id)}
                  className="perfil-eliminar-btn"
                  title={t("profile.deleteTitle")}
                >
                  ❌
                </button>
              </div>

              {/* Ingredientes */}
              <div className="perfil-section">
                <h4 className="perfil-section-title">
                  {t("selection.ingredients")}
                </h4>
                <ul className="perfil-list">
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
              <div className="perfil-section">
                <h4 className="perfil-section-title">{t("selection.steps")}</h4>
                <ol className="perfil-list">
                  {Array.isArray(receta.pasos) ? (
                    receta.pasos.map((paso, i) => (
                      <li key={i} className="perfil-paso-item">
                        {paso}
                      </li>
                    ))
                  ) : (
                    <li>{receta.pasos || "No especificado"}</li>
                  )}
                </ol>
              </div>

              {/* Fecha */}
              {receta.fecha_creacion && (
                <div className="perfil-fecha">
                  {t("profile.savedOn")} {new Date(receta.fecha_creacion).toLocaleDateString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Perfil;

