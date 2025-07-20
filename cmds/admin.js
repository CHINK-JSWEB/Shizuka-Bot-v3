const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "admin",
  version: "1.0",
  role: 1,
  description: "Toggle admin-only mode ON or OFF",
  guide: {
    en: "admin"
  }
};

module.exports.execute = async function ({ api, event }) {
  const ADMIN_UID = "100023119327716";
  const adminFile = path.join(__dirname, "..", "adminMode.json");

  if (event.senderID !== ADMIN_UID) {
    return api.sendMessage("❌ You are not the bot admin.", event.threadID);
  }

  let state = false;
  if (fs.existsSync(adminFile)) {
    try {
      const current = JSON.parse(fs.readFileSync(adminFile));
      state = !current.enabled;
    } catch (e) {
      return api.sendMessage("❌ Error reading admin mode file.", event.threadID);
    }
  }

  fs.writeFileSync(adminFile, JSON.stringify({ enabled: state }, null, 2));
  const statusMsg = state
    ? "🔐 Admin-only mode is now ON.\nOnly the bot admin can use commands."
    : "🔓 Admin-only mode is now OFF.\nEveryone can use commands.";

  return api.sendMessage(statusMsg, event.threadID);
};
