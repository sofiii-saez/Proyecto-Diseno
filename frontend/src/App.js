import { useEffect, useState } from "react";
import SeleccionIngredientes from "./SeleccionIngredientes";

function App() {
  const [apiMessage, setApiMessage] = useState("Cargando API...");

  useEffect(() => {
    fetch("/api/ping")
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message))
      .catch(() => setApiMessage("No se pudo conectar con la API 😢"));
  }, []);

  // Función que se ejecutará cuando el usuario haga clic en "Listo"
  const handleIngredientesListos = (ingredientes) => {
    console.log("Recibidos en App:", ingredientes);
    // Aquí después conectarás con la API de IA
  };

  return (
    <div className="App">
      <SeleccionIngredientes onListo={handleIngredientesListos} />
    </div>
  );
}

export default App;
