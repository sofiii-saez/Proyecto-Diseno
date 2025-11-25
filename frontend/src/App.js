import { useEffect, useState } from "react";
import SeleccionIngredientes from "./SeleccionIngredientes";
import LoginGoogle from "./LoginGoogle";
import { useLanguage } from "./contexts/LanguageContext";

function App() {
  const { t, language, changeLanguage } = useLanguage();
  const [apiMessage, setApiMessage] = useState(t("app.loadingApi"));
  const [user, setUser] = useState(null);

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
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p>{t("app.loginPrompt")}</p>
          <LoginGoogle onLogin={setUser} />
        </div>
      ) : (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p>
            {t("app.welcome", { name: user.name })}
          </p>
        </div>
      )}

      <SeleccionIngredientes />
    </div>
  );
}

export default App;
