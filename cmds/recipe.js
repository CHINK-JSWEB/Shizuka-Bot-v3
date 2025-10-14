const axios = require("axios");

module.exports = {
  name: "recipe",
  version: "1.0",
  usePrefix: false,
  description: "Get a recipe based on ingredients",
  usage: "recipe [ingredients,comma,separated]",

  async execute({ api, event, args }) {
    const { threadID, messageID } = event;
    const ingredients = args.join(",").toLowerCase().replace(/,\s+/g, ",");

    if (!ingredients) {
      return api.sendMessage("❗ Usage: recipe [ingredients]\nExample: recipe chicken rice", threadID, messageID);
    }

    const url = `https://kaiz-apis.gleeze.com/api/recipe?ingredients=${encodeURIComponent(ingredients)}&apikey=fef2683d-2c7c-4346-a5fe-9e153bd9b7d0`;

    try {
      const res = await axios.get(url);
      const data = res.data;

      if (data.error || !data.recipe) {
        return api.sendMessage(`⚠️ No recipe found using: ${ingredients.replace(/,/g, ", ")}`, threadID, messageID);
      }

      const message = `🍽 Jonnel Recipe Suggestion\n\n📋 Ingredients: ${ingredients.replace(/,/g, ", ")}\n\n🍳 Recipe:\n${data.recipe}`;
      return api.sendMessage(message, threadID, messageID);
    } catch (err) {
      console.error("❌ RECIPE ERROR:", err);
      return api.sendMessage("❌ Error fetching recipe. Try again later.", threadID, messageID);
    }
  }
};
