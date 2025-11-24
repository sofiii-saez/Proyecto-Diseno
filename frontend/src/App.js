import { useEffect, useState } from "react";
import SeleccionIngredientes from "./SeleccionIngredientes";
import LoginGoogle from "./LoginGoogle";

function App() {
  const [apiMessage, setApiMessage] = useState("Cargando API...");
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4000/api/ping")
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message))
      .catch(() => setApiMessage("No se pudo conectar con la API 😢"));
  }, []);

  return (
    <div className="App">
      <p style={{ textAlign: "center", padding: "10px" }}>{apiMessage}</p>

      {!user ? (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p>Inicia sesión para personalizar tu experiencia:</p>
          <LoginGoogle onLogin={setUser} />
        </div>
      ) : (
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <p>
            Hola, <strong>{user.name}</strong> 👋
          </p>
        </div>
      )}

      <SeleccionIngredientes />
    </div>
  );
}

export default App;
