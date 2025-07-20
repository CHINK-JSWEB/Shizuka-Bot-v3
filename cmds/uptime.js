const os = require("os");
const cooldowns = new Map();

module.exports = {
    name: "uptime",
    description: "Bot uptime and system info",
    usage: "uptime",
    version: "1.0.3",
    usePrefix: false,

    async execute({ api, event }) {
        const { threadID, senderID } = event;
        const key = `uptime-${senderID}`;
        const now = Date.now();

        const cooldown = 10 * 1000;
        if (cooldowns.has(key) && now - cooldowns.get(key) < cooldown) return;
        cooldowns.set(key, now);

        // 📆 Uptime duration
        const uptimeSec = process.uptime();
        const days = Math.floor(uptimeSec / (60 * 60 * 24));
        const hours = Math.floor((uptimeSec / (60 * 60)) % 24);
        const minutes = Math.floor((uptimeSec / 60) % 60);
        const seconds = Math.floor(uptimeSec % 60);

        // 🕒 Start time
        const startedAt = new Date(Date.now() - uptimeSec * 1000).toLocaleString("en-PH", {
            timeZone: "Asia/Manila",
            hour12: true
        });

        // 📦 RAM info
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const usedMB = (usedMem / 1024 / 1024).toFixed(1);
        const totalMB = (totalMem / 1024 / 1024).toFixed(1);
        const percent = ((usedMem / totalMem) * 100).toFixed(1);

        // 📤 Send message
        const response =
`🕒 *Bot Uptime Info*

⏰ Started At: ${startedAt}
⏱️ Uptime: ${days}d ${hours}h ${minutes}m ${seconds}s

📦 RAM Usage: ${usedMB}MB / ${totalMB}MB (${percent}%)
📡 Ping: OK

🤖 Maintained by: Angel Nico Igdalino`;

        api.sendMessage(response, threadID);
    }
};
