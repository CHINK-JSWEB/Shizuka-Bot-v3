const fs = require("fs");
const path = require("path");

const cooldowns = new Map();

module.exports = {
    name: "pok",
    version: "1.0.4",
    description: "Pokes with a funny image",
    usage: "pok",
    usePrefix: false,

    async execute({ api, event }) {
        const { senderID, threadID } = event;

        // ✅ Anti-spam cooldown
        const key = `pok-${senderID}`;
        const now = Date.now();
        const cooldown = 10 * 1000;
        if (cooldowns.has(key) && now - cooldowns.get(key) < cooldown) return;
        cooldowns.set(key, now);

        // ✅ Load and send only once
        const imgPath = path.join(__dirname, "../media/monkey.jpg");
        if (!fs.existsSync(imgPath)) {
            return api.sendMessage("pok🔨😆", threadID);
        }

        const stream = fs.createReadStream(imgPath);

        // ✅ ONE message only
        api.sendMessage({
            body: "pok 🔨😆😆\nHAHAHAHA -nico",
            attachment: stream
        }, threadID, (err, info) => {
            if (!err) {
                api.setMessageReaction("😂", info.messageID, () => {}, true);
            }
        });
    }
};
