const fs = require("fs");
const toggleFile = "./resendToggle.json";
let toggle = {};
try { toggle = require(toggleFile); } catch {}

module.exports = {
  config: {
    name: "resendtoggle",
    role: 1, // admin only
    guide: { en: "Toggle auto-resend ON/OFF" }
  },
  execute: async ({ api, event }) => {
    const threadID = event.threadID;

    toggle[threadID] = !toggle[threadID]; // switch ON/OFF
    fs.writeFileSync(toggleFile, JSON.stringify(toggle, null, 2));

    await api.sendMessage(
      `🔁 Auto-resend is now ${toggle[threadID] ? "ON" : "OFF"}!`,
      threadID
    );
  }
};