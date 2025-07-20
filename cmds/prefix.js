const fs = require("fs");
const path = require("path");
const configPath = "./config.json";
const config = JSON.parse(fs.readFileSync(configPath));

// Optional: override prefix
config.prefix = "help";

module.exports = {
    name: "prefix",
    usePrefix: false,
    usage: "prefix",
    version: "1.9",
    description: "Displays the bot's prefix with local cat GIF.",
    cooldown: 5,
    admin: false,

    execute: async ({ api, event }) => {
        const { threadID, messageID } = event;
        const botPrefix = config.prefix || "/";
        const botName = config.botName || "Nikoxbot V2";
        const gifPath = path.join(__dirname, "../assets/nikoxcat.gif");

        if (!fs.existsSync(gifPath)) {
            return api.sendMessage("⚠️ GIF not found: assets/nikoxcat.gif", threadID, messageID);
        }

        const message = {
            body:
`🤖 BOT INFORMATION
📌 Prefix: ${botPrefix}
🆔 Bot Name: ${botName}

Made with 🖤
All rights reserved © 2025`,
            attachment: fs.createReadStream(gifPath)
        };

        try {
            api.sendMessage(message, threadID);
        } catch (err) {
            console.error("❌ Failed to send prefix message:", err);
            api.sendMessage("⚠️ Failed to send message.", threadID, messageID);
        }
    },
};
