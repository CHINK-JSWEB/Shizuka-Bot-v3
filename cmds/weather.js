const axios = require("axios");

module.exports = {
  name: "weather",
  version: "1.9",
  usePrefix: false,
  description: "Check weather in your city",
  usage: "weather [city name]",

  async execute({ api, event, args }) {
    const { threadID, messageID } = event;

    if (!args.length) {
      return api.sendMessage("🌦️ Usage: weather [city name]", threadID, messageID);
    }

    const city = args.join(" ");
    const url = `https://api.nekorinn.my.id/info/weather?city=${encodeURIComponent(city)}`;

    try {
      const res = await axios.get(url);
      const result = res.data?.result;

      const location = result?.location;
      const current = result?.current;

      if (!location || !current) {
        return api.sendMessage("❌ Could not retrieve weather data. Please try again later.", threadID, messageID);
      }

      const msg =
`🌤️ Weather in ${location.name}, ${location.country}
🌡️ Temperature: ${current.temp_c}°C
☁️ Condition: ${current.condition?.text || "N/A"}
💧 Humidity: ${current.humidity}%
🌬️ Wind: ${current.wind_kph} km/h
📍 Feels Like: ${current.feelslike_c}°C

🤖 Powered by Angel Nico Igdalino Bot
🌦️ Ito ang panahon ngayon sana walang bagyo hahaha - oxN1K0X
🛡️ Made with 💚 2025 — NikoxSec ORG`;

      api.sendMessage(msg, threadID, messageID);

    } catch (err) {
      console.error("❌ Weather API Error:", err.message);
      api.sendMessage("❌ Failed to fetch weather data.", threadID, messageID);
    }
  }
};
