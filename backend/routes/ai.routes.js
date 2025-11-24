const express = require("express");
const router = express.Router();
const { generateShoppingListWithAI } = require("../services/geminiService");

router.post("/shopping-list", async (req, res) => {
  const { pantry, recipes } = req.body;

  try {
    const data = await generateShoppingListWithAI(pantry, recipes);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Error usando Gemini" });
  }
});

module.exports = router;
