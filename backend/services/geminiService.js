const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("❌ GEMINI_API_KEY no está definido en .env");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function generateShoppingListWithAI(pantry, recipes) {
  const prompt = `
Eres un asistente que arma listas de supermercado.

Ingredientes que el usuario YA tiene:
${JSON.stringify(pantry, null, 2)}

Recetas que quiere cocinar:
${JSON.stringify(recipes, null, 2)}

Devuélveme SOLO un JSON con:
{
 "items": [
   { "name": "...", "quantity": "...", "category": "..." }
 ]
}
`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

module.exports = { generateShoppingListWithAI };
