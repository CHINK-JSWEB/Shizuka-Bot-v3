const axios = require("axios");

module.exports = {
  config: {
    name: "country",
    version: "1.0",
    author: "Nikox",
    description: "Get information about any country.",
    usage: "[country name]",
    commandCategory: "info",
    cooldowns: 5,
  },

  onStart: async function ({ api, event, args }) {
    const name = args.join(" ");
    if (!name) return api.sendMessage("❌ Please provide a country name.", event.threadID);

    const url = `https://rapido.zetsu.xyz/api/country?name=${encodeURIComponent(name)}`;

    try {
      const res = await axios.get(url);
      const data = res.data;

      if (!data.name?.common) throw new Error("Invalid data");

      const {
        name: { common, official },
        capital,
        region,
        subregion,
        population,
        area,
        currencies,
        languages,
        flag,
        maps,
      } = data;

      const currency = Object.values(currencies)[0];
      const languageList = Object.values(languages).join(", ");

      const reply = 
`🌍 Country: ${common} (${official})
🏙️ Capital: ${capital?.[0] || "N/A"}
📍 Region: ${region} - ${subregion}
👫 Population: ${population.toLocaleString()}
📐 Area: ${area.toLocaleString()} km²
💱 Currency: ${currency.name} (${currency.symbol})
🗣️ Languages: ${languageList}
🚩 Flag: ${flag}
🗺️ [View on Google Maps](${maps.googleMaps})`;

      api.sendMessage(reply, event.threadID, event.messageID);

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Country not found or error occurred.", event.threadID, event.messageID);
    }
  }
};
