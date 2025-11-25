import { useEffect } from "react";

function LoginGoogle({ onLogin }) {
  const initGoogle = () => {
    if (!window.google || !window.google.accounts || !window.google.accounts.id) {
      console.error("Google Identity Services no está disponible");
      return;
    }

    const clientId =
      "TU_CLIENT_ID_COMPLETO.apps.googleusercontent.com"; // <-- reemplázalo por el real

    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const res = await fetch("http://localhost:4000/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ credential: response.credential }),
          });

          const data = await res.json();
          console.log("Respuesta backend /api/auth/google:", data);

          if (res.ok && onLogin) {
            onLogin(data); // { name, email, picture }
          }
        } catch (error) {
          console.error("Error llamando a /api/auth/google:", error);
        }
      },
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleSignInDiv"),
      {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
      }
    );
  };

  useEffect(() => {
    if (window.google && window.google.accounts && window.google.accounts.id) {
      initGoogle();
    } else {
      window.addEventListener("load", initGoogle);
      return () => window.removeEventListener("load", initGoogle);
    }
  }, [onLogin]);

  return <div id="googleSignInDiv"></div>;
}

export default LoginGoogle;

