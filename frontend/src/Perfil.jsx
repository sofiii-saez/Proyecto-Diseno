// ===============================
// Componente: Perfil
// Muestra las recetas favoritas del usuario
// ===============================
import { useState, useEffect } from "react";
import { useLanguage } from "./contexts/LanguageContext";

function Perfil({ user }) {
  const { t } = useLanguage();
  const [favoritas, setFavoritas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Cargar favoritas al montar el componente
  useEffect(() => {
    if (user && user.id) {
      cargarFavoritas();
    }
  }, [user]);

  const cargarFavoritas = async () => {
    setCargando(true);
    setError(null);
    try {
      const response = await fetch(
        `http://localhost:4000/api/favoritas/${user.id}`
      );
      const data = await response.json();
      if (response.ok) {
        setFavoritas(data.favoritas || []);
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
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>⭐ {t("profile.title")}</h1>
        <p style={styles.subtitle}>
          {t("profile.subtitle", { name: user.name, count: favoritas.length })}
        </p>
      </div>

      {cargando ? (
        <div style={styles.loading}>
          <p>{t("profile.loading")}</p>
        </div>
      ) : error ? (
        <div style={styles.error}>
          <p>❌ {error}</p>
        </div>
      ) : favoritas.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyText}>
            {t("profile.empty")}
            <br />
            {t("profile.emptyHint")}
          </p>
        </div>
      ) : (
        <div style={styles.recetasGrid}>
          {favoritas.map((receta) => (
            <div key={receta.id} style={styles.recetaCard}>
              {/* Header de la tarjeta con botón eliminar */}
              <div style={styles.cardHeader}>
                <h3 style={styles.recetaTitulo}>{receta.titulo}</h3>
                <button
                  onClick={() => handleEliminarFavorita(receta.id)}
                  style={styles.eliminarBtn}
                  title={t("profile.deleteTitle")}
                >
                  ❌
                </button>
              </div>

              {/* Ingredientes */}
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>
                  {t("selection.ingredients")}
                </h4>
                <ul style={styles.list}>
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
              <div style={styles.section}>
                <h4 style={styles.sectionTitle}>{t("selection.steps")}</h4>
                <ol style={styles.list}>
                  {Array.isArray(receta.pasos) ? (
                    receta.pasos.map((paso, i) => (
                      <li key={i} style={styles.pasoItem}>
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
                <div style={styles.fecha}>
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

const styles = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "20px",
    minHeight: "100vh",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
    padding: "30px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    borderRadius: "16px",
    color: "white",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
  },
  title: {
    fontSize: "36px",
    fontWeight: "bold",
    margin: "0 0 10px 0",
  },
  subtitle: {
    fontSize: "18px",
    margin: "0",
    opacity: 0.9,
  },
  loading: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    color: "#666",
  },
  error: {
    textAlign: "center",
    padding: "40px",
    fontSize: "18px",
    color: "#dc3545",
    backgroundColor: "#ffebee",
    borderRadius: "8px",
    margin: "20px 0",
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    backgroundColor: "#f5f5f5",
    borderRadius: "12px",
    margin: "20px 0",
  },
  emptyText: {
    fontSize: "18px",
    color: "#666",
    lineHeight: "1.6",
  },
  recetasGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
    gap: "24px",
    marginTop: "20px",
  },
  recetaCard: {
    backgroundColor: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
    border: "1px solid #e0e0e0",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    paddingBottom: "16px",
    borderBottom: "2px solid #f0f0f0",
  },
  recetaTitulo: {
    margin: "0",
    fontSize: "24px",
    color: "#1976d2",
    fontWeight: "bold",
    flex: 1,
  },
  eliminarBtn: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: "4px",
    transition: "background-color 0.2s",
  },
  section: {
    marginBottom: "20px",
  },
  sectionTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "12px",
  },
  list: {
    margin: "0",
    paddingLeft: "24px",
    color: "#666",
    lineHeight: "1.6",
  },
  pasoItem: {
    marginBottom: "8px",
  },
  fecha: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e0e0e0",
    fontSize: "12px",
    color: "#999",
    fontStyle: "italic",
  },
};

export default Perfil;

