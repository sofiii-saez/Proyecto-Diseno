import { useEffect, useState } from "react";
import SeleccionIngredientes from "./SeleccionIngredientes";
import AuthPage from "./AuthPage";
import Perfil from "./Perfil";
import { useLanguage } from "./contexts/LanguageContext";

function App() {
  const { t, language, changeLanguage } = useLanguage();
  const [apiMessage, setApiMessage] = useState(t("app.loadingApi"));
  const [user, setUser] = useState(null);
  const [vistaActual, setVistaActual] = useState("home"); // "home" o "perfil"

  useEffect(() => {
    setApiMessage(t("app.loadingApi"));
    fetch(`http://localhost:4000/api/ping?idioma=${language}`)
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message))
      .catch(() => setApiMessage(t("app.apiError")));
  }, [t, language]);

  return (
    <div className="App">
      {/* Selector de idioma */}
      <div style={{ 
        textAlign: "right", 
        padding: "10px 20px",
        backgroundColor: "#f5f5f5",
        borderBottom: "1px solid #e0e0e0"
      }}>
        <button
          onClick={() => changeLanguage("es")}
          style={{
            padding: "8px 16px",
            margin: "0 5px",
            backgroundColor: language === "es" ? "#1976d2" : "#e0e0e0",
            color: language === "es" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: language === "es" ? "bold" : "normal"
          }}
        >
          ES
        </button>
        <button
          onClick={() => changeLanguage("en")}
          style={{
            padding: "8px 16px",
            margin: "0 5px",
            backgroundColor: language === "en" ? "#1976d2" : "#e0e0e0",
            color: language === "en" ? "white" : "#333",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: language === "en" ? "bold" : "normal"
          }}
        >
          EN
        </button>
      </div>

      <p style={{ textAlign: "center", padding: "10px" }}>{apiMessage}</p>

      {!user ? (
        <AuthPage onLogin={setUser} />
      ) : (
        <>
          {/* Barra de navegación superior */}
          <nav style={styles.navbar}>
            <div style={styles.navContent}>
              <div style={styles.navLeft}>
                <h1 style={styles.logo}>🍳 SmartChef</h1>
              </div>
              <div style={styles.navCenter}>
                <button
                  onClick={() => setVistaActual("home")}
                  style={{
                    ...styles.navButton,
                    ...(vistaActual === "home" ? styles.navButtonActive : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (vistaActual !== "home") {
                      e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (vistaActual !== "home") {
                      e.target.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  🏠 {t("app.home")}
                </button>
                <button
                  onClick={() => setVistaActual("perfil")}
                  style={{
                    ...styles.navButton,
                    ...(vistaActual === "perfil" ? styles.navButtonActive : {}),
                  }}
                  onMouseEnter={(e) => {
                    if (vistaActual !== "perfil") {
                      e.target.style.backgroundColor = "rgba(255,255,255,0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (vistaActual !== "perfil") {
                      e.target.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  👤 {t("app.myProfile")}
                </button>
              </div>
              <div style={styles.navRight}>
                <span style={styles.userName}>{user.name}</span>
                <button
                  onClick={() => {
                    setUser(null);
                    setVistaActual("home");
                  }}
                  style={styles.logoutButton}
                  title={t("app.logoutTitle")}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "rgba(255,255,255,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "rgba(255,255,255,0.2)";
                  }}
                >
                  🚪 {t("app.logout")}
                </button>
              </div>
            </div>
          </nav>

          {/* Contenido principal */}
          <div style={styles.mainContent}>
            {vistaActual === "home" ? (
              <>
                <div style={styles.welcomeSection}>
                  <p style={styles.welcomeText}>
                    {t("app.welcome", { name: user.name })}
                  </p>
                </div>
                <SeleccionIngredientes user={user} />
              </>
            ) : (
              <Perfil user={user} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

// Estilos para la aplicación
const styles = {
  navbar: {
    backgroundColor: "#1976d2",
    color: "white",
    padding: "0 20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  },
  navContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 0",
  },
  navLeft: {
    flex: 1,
  },
  logo: {
    margin: 0,
    fontSize: "24px",
    fontWeight: "bold",
  },
  navCenter: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    gap: "10px",
  },
  navButton: {
    padding: "10px 24px",
    fontSize: "16px",
    backgroundColor: "transparent",
    color: "white",
    border: "2px solid rgba(255,255,255,0.3)",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "500",
    transition: "all 0.3s",
  },
  navButtonActive: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "white",
    transform: "scale(1.05)",
  },
  navRight: {
    flex: 1,
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "15px",
  },
  userName: {
    fontSize: "16px",
    fontWeight: "500",
  },
  logoutButton: {
    padding: "8px 16px",
    fontSize: "14px",
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.3s",
  },
  mainContent: {
    minHeight: "calc(100vh - 80px)",
    backgroundColor: "#f5f5f5",
  },
  welcomeSection: {
    textAlign: "center",
    padding: "30px 20px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    marginBottom: "30px",
  },
  welcomeText: {
    fontSize: "24px",
    fontWeight: "500",
    margin: 0,
  },
};

export default App;
