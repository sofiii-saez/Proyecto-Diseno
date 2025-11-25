// ===============================
// Componente: EmailAuthForm
// Formulario de Login/Registro con Email y Contraseña
// ===============================
import { useState } from "react";

function EmailAuthForm({ onSuccess }) {
  // Estado para alternar entre Login y Registro
  const [isRegister, setIsRegister] = useState(false);
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    password: "",
  });

  // Estado de errores y carga
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Manejar cambios en los inputs
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Limpiar error cuando el usuario empieza a escribir
    if (error) setError("");
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isRegister ? "/api/register" : "/api/login";
      const body = isRegister
        ? {
            nombre: formData.nombre,
            email: formData.email,
            password: formData.password,
          }
        : {
            email: formData.email,
            password: formData.password,
          };

      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        // Error del servidor
        setError(data.error || "Error en la autenticación");
        setLoading(false);
        return;
      }

      // Éxito - llamar a onSuccess con los datos del usuario
      // Formatear para que coincida con el formato de Google (name, email)
      if (onSuccess) {
        onSuccess({
          name: data.user.nombre,
          email: data.user.email,
          id: data.user.id,
        });
      }
    } catch (err) {
      console.error("Error en autenticación:", err);
      setError("Error de conexión. Intenta de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Tabs para alternar entre Login y Registro */}
      <div style={styles.tabs}>
        <button
          type="button"
          onClick={() => {
            setIsRegister(false);
            setError("");
            setFormData({ nombre: "", email: "", password: "" });
          }}
          style={{
            ...styles.tab,
            ...(isRegister ? {} : styles.tabActive),
          }}
        >
          Iniciar Sesión
        </button>
        <button
          type="button"
          onClick={() => {
            setIsRegister(true);
            setError("");
            setFormData({ nombre: "", email: "", password: "" });
          }}
          style={{
            ...styles.tab,
            ...(isRegister ? styles.tabActive : {}),
          }}
        >
          Crear Cuenta
        </button>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} style={styles.form}>
        {/* Campo Nombre (solo en registro) */}
        {isRegister && (
          <div style={styles.inputGroup}>
            <label htmlFor="nombre" style={styles.label}>
              Nombre
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              style={styles.input}
              placeholder="Tu nombre completo"
            />
          </div>
        )}

        {/* Campo Email */}
        <div style={styles.inputGroup}>
          <label htmlFor="email" style={styles.label}>
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
            placeholder="tu@email.com"
          />
        </div>

        {/* Campo Contraseña */}
        <div style={styles.inputGroup}>
          <label htmlFor="password" style={styles.label}>
            Contraseña
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            style={styles.input}
            placeholder={isRegister ? "Mínimo 6 caracteres" : "Tu contraseña"}
          />
        </div>

        {/* Mensaje de error */}
        {error && <div style={styles.error}>{error}</div>}

        {/* Botón de envío */}
        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.submitButton,
            ...(loading ? styles.submitButtonDisabled : {}),
          }}
        >
          {loading
            ? "Procesando..."
            : isRegister
            ? "Crear Cuenta"
            : "Iniciar Sesión"}
        </button>
      </form>
    </div>
  );
}

// Estilos del componente
const styles = {
  container: {
    maxWidth: "400px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  tabs: {
    display: "flex",
    marginBottom: "20px",
    borderBottom: "2px solid #e0e0e0",
  },
  tab: {
    flex: 1,
    padding: "12px",
    backgroundColor: "transparent",
    border: "none",
    borderBottom: "2px solid transparent",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "500",
    color: "#666",
    transition: "all 0.3s",
  },
  tabActive: {
    color: "#1976d2",
    borderBottomColor: "#1976d2",
    fontWeight: "bold",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "14px",
    fontWeight: "500",
    color: "#333",
  },
  input: {
    padding: "12px",
    fontSize: "16px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    outline: "none",
    transition: "border-color 0.3s",
  },
  error: {
    padding: "10px",
    backgroundColor: "#ffebee",
    color: "#c62828",
    borderRadius: "4px",
    fontSize: "14px",
    textAlign: "center",
  },
  submitButton: {
    padding: "12px 24px",
    fontSize: "16px",
    fontWeight: "bold",
    color: "#fff",
    backgroundColor: "#1976d2",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    transition: "background-color 0.3s",
    marginTop: "8px",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
    cursor: "not-allowed",
  },
};

export default EmailAuthForm;

