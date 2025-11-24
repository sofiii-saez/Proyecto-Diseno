const express = require("express");
const router = express.Router();
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google
router.post("/google", async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: "Falta credential de Google" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;

    // Por ahora, solo devolvemos los datos básicos
    return res.json({ name, email, picture });
  } catch (error) {
    console.error("Error verificando Google ID token:", error);
    return res.status(400).json({ error: "Token inválido" });
  }
});

module.exports = router;
