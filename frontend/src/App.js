import { useState } from "react";
import SeleccionIngredientes from "./SeleccionIngredientes";
import AuthPage from "./AuthPage";
import Perfil from "./Perfil";
import { useLanguage } from "./contexts/LanguageContext";
import "./App.css";

function App() {
  const { t, language, changeLanguage } = useLanguage();
  const [user, setUser] = useState(null);
  const [vistaActual, setVistaActual] = useState("home"); // "home" o "perfil"

  return (
    <div className="App">
      {/* Selector de idioma */}
      <div className="language-selector">
        <button
          onClick={() => changeLanguage("es")}
          style={{
            ...styles.languageButton,
            backgroundColor: language === "es" ? "#1976d2" : "#e0e0e0",
            color: language === "es" ? "white" : "#333",
            fontWeight: language === "es" ? "bold" : "normal"
          }}
        >
          ES
        </button>
        <button
          onClick={() => changeLanguage("en")}
          style={{
            ...styles.languageButton,
            backgroundColor: language === "en" ? "#1976d2" : "#e0e0e0",
            color: language === "en" ? "white" : "#333",
            fontWeight: language === "en" ? "bold" : "normal"
          }}
        >
          EN
        </button>
      </div>

      {!user ? (
        <AuthPage onLogin={setUser} />
      ) : (
        <>
          {/* Barra de navegación superior */}
          <nav className="navbar">
            <div className="nav-content">
              <div className="nav-left">
                <h1 className="nav-logo">🍳 SmartChef</h1>
              </div>
              <div className="nav-center">
                <button
                  onClick={() => setVistaActual("home")}
                  className={`nav-button ${vistaActual === "home" ? "nav-button-active" : ""}`}
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
                  className={`nav-button ${vistaActual === "perfil" ? "nav-button-active" : ""}`}
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
              <div className="nav-right">
                <span className="user-name">{user.name}</span>
                <button
                  onClick={() => {
                    setUser(null);
                    setVistaActual("home");
                  }}
                  className="logout-button"
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
          <div className="main-content">
            {vistaActual === "home" ? (
              <>
                <div className="welcome-section">
                  <p className="welcome-text">
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

// Estilos para la aplicación (solo los que necesitan ser dinámicos)
const styles = {
  languageButton: {
    padding: "8px 16px",
    margin: "0 5px",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "all 0.2s",
  },
};

export default App;
