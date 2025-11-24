import { useEffect, useState } from "react";
import SeleccionIngredientes from "./SeleccionIngredientes";

function App() {
  const [apiMessage, setApiMessage] = useState("Cargando API...");

  useEffect(() => {
    fetch("http://localhost:4000/api/ping")
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message))
      .catch(() => setApiMessage("No se pudo conectar con la API 😢"));
  }, []);

  return (
    <div className="App">
      <p style={{ textAlign: "center", padding: "10px" }}>{apiMessage}</p>
      <SeleccionIngredientes />
    </div>
  );
}

export default App;
