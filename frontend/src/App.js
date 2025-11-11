import { useEffect, useState } from "react";

function App() {
  const [apiMessage, setApiMessage] = useState("Cargando API...");

  useEffect(() => {
    fetch("http://localhost:4000/api/ping")
      .then((res) => res.json())
      .then((data) => setApiMessage(data.message))
      .catch(() => setApiMessage("No se pudo conectar con la API 😢"));
  }, []);

  return (
    <div>
      <h1>Proyecto recetas</h1>
      <p>{apiMessage}</p>
    </div>
  );
}

export default App;
