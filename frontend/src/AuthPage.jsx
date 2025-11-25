// ===============================
// Componente: AuthPage
// Página principal de autenticación con dos opciones:
// 1. Login con Google (componente existente)
// 2. Login/Registro con Email y Contraseña
// ===============================
import LoginGoogle from "./LoginGoogle";
import EmailAuthForm from "./EmailAuthForm";
import "./AuthPage.css";

function AuthPage({ onLogin }) {
  return (
    <div className="auth-container">
      <div className="auth-header">
        <h1 className="auth-title">SmartChef</h1>
        <p className="auth-subtitle">Inicia sesión para continuar</p>
      </div>

      <div className="auth-content">
        {/* Opción 1: Login con Google */}
        <div className="auth-section">
          <h2 className="auth-section-title">Iniciar sesión con Google</h2>
          <div className="auth-google-container">
            <LoginGoogle onLogin={onLogin} />
          </div>
        </div>

        {/* Separador */}
        <div className="auth-separator">
          <div className="auth-separator-line"></div>
          <span className="auth-separator-text">O</span>
          <div className="auth-separator-line"></div>
        </div>

        {/* Opción 2: Login/Registro con Email y Contraseña */}
        <div className="auth-section">
          <h2 className="auth-section-title">
            Iniciar sesión con Email y Contraseña
          </h2>
          <EmailAuthForm onSuccess={onLogin} />
        </div>
      </div>
    </div>
  );
}

export default AuthPage;

