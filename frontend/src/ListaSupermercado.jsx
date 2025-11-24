/**
 * Componente que muestra una lista de ingredientes faltantes
 * con enlaces para buscarlos en supermercados chilenos online.
 * 
 * @param {Object} props - Props del componente
 * @param {Array<string>} props.ingredientesFaltantes - Array de strings con los ingredientes que faltan
 */
function ListaSupermercado({ ingredientesFaltantes }) {
  // Si no hay ingredientes faltantes, no mostrar nada
  if (!ingredientesFaltantes || ingredientesFaltantes.length === 0) {
    return (
      <div style={{
        marginTop: "16px",
        padding: "12px",
        backgroundColor: "#e8f5e9",
        borderRadius: "8px",
        color: "#2e7d32"
      }}>
        <p style={{ margin: 0 }}>✅ Ya tienes todos los ingredientes necesarios</p>
      </div>
    );
  }

  /**
   * Función que genera la URL de búsqueda en Google para un ingrediente
   * restringida a supermercados chilenos (Líder, Jumbo, Tottus)
   * 
   * @param {string} ingrediente - Nombre del ingrediente a buscar
   * @returns {string} URL de búsqueda en Google
   */
  const generarUrlBusqueda = (ingrediente) => {
    // Construir la búsqueda: ingrediente + restricción a sitios de supermercados chilenos
    const busqueda = `${ingrediente} site:lider.cl OR site:jumbo.cl OR site:tottus.cl`;
    
    // Usar encodeURIComponent para codificar correctamente la URL
    const busquedaCodificada = encodeURIComponent(busqueda);
    
    // Construir la URL completa de Google
    return `https://www.google.com/search?q=${busquedaCodificada}`;
  };

  return (
    <div style={{
      marginTop: "16px",
      padding: "16px",
      backgroundColor: "#fff3e0",
      border: "1px solid #ffb74d",
      borderRadius: "8px"
    }}>
      <h4 style={{
        marginTop: 0,
        marginBottom: "12px",
        color: "#e65100",
        fontSize: "18px"
      }}>
        Ingredientes que te faltan
      </h4>
      
      <ul style={{
        margin: 0,
        paddingLeft: "20px",
        color: "#666"
      }}>
        {ingredientesFaltantes.map((ingrediente, index) => (
          <li key={index} style={{ marginBottom: "8px" }}>
            {/* Mostrar el nombre del ingrediente */}
            <span style={{ marginRight: "8px" }}>{ingrediente}</span>
            
            {/* Enlace para buscar en supermercados chilenos */}
            <a
              href={generarUrlBusqueda(ingrediente)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#1976d2",
                textDecoration: "none",
                fontSize: "14px"
              }}
              onMouseEnter={(e) => {
                e.target.style.textDecoration = "underline";
              }}
              onMouseLeave={(e) => {
                e.target.style.textDecoration = "none";
              }}
            >
              🔍 Buscar en supermercados
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ListaSupermercado;

