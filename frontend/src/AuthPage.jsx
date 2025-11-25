// ===============================
// Componente: AuthPage
// Página principal de autenticación con dos opciones:
// 1. Login con Google (componente existente)
// 2. Login/Registro con Email y Contraseña
// ===============================
import LoginGoogle from "./LoginGoogle";
import EmailAuthForm from "./EmailAuthForm";

function AuthPage({ onLogin }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>SmartChef</h1>
        <p style={styles.subtitle}>Inicia sesión para continuar</p>
      </div>

      <div style={styles.content}>
        {/* Opción 1: Login con Google */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Iniciar sesión con Google</h2>
          <div style={styles.googleContainer}>
            <LoginGoogle onLogin={onLogin} />
          </div>
        </div>

        {/* Separador */}
        <div style={styles.separator}>
          <div style={styles.separatorLine}></div>
          <span style={styles.separatorText}>O</span>
          <div style={styles.separatorLine}></div>
        </div>

        {/* Opción 2: Login/Registro con Email y Contraseña */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            Iniciar sesión con Email y Contraseña
          </h2>
          <EmailAuthForm onSuccess={onLogin} />
        </div>
      </div>
    </div>
  );
}

// Estilos del componente
const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  },
  header: {
    textAlign: "center",
    marginBottom: "40px",
  },
  title: {
    fontSize: "48px",
    fontWeight: "bold",
    color: "#1976d2",
    margin: "0 0 10px 0",
  },
  subtitle: {
    fontSize: "18px",
    color: "#666",
    margin: "0",
  },
  content: {
    width: "100%",
    maxWidth: "500px",
  },
  section: {
    marginBottom: "30px",
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#333",
    marginBottom: "20px",
    textAlign: "center",
  },
  googleContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "20px",
    backgroundColor: "#fff",
    borderRadius: "8px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  separator: {
    display: "flex",
    alignItems: "center",
    margin: "30px 0",
    gap: "15px",
  },
  separatorLine: {
    flex: 1,
    height: "1px",
    backgroundColor: "#ddd",
  },
  separatorText: {
    color: "#999",
    fontSize: "14px",
    fontWeight: "500",
  },
};

export default AuthPage;

