import { useEffect } from "react";

function LoginGoogle({ onLogin }) {
  useEffect(() => {
    if (!window.google) {
      console.error("Google script no cargó");
      return;
    }

    const clientId = "746080246822-6m9f1ctm1p22va55b4jgho0frsag4862.apps.googleusercontent.com"; // <-- reemplaza por el mismo que en .env

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
          console.log("Respuesta backend auth:", data);

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
  }, [onLogin]);

  return <div id="googleSignInDiv"></div>;
}

export default LoginGoogle;
