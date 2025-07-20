const fs = require("fs");
const path = require("path");

let lastHiTime = 0;
let lastYoTime = 0;
let hiUsed = false;

module.exports = {
    name: "message",
    async execute({ api, event }) {
        const { threadID, body } = event;
        if (!body) return;

        const now = Date.now();
        const text = body.toLowerCase();

        const mediaFolder = path.join(__dirname, "../media/message");
        const imageFiles = fs.readdirSync(mediaFolder).filter(file =>
            /\.(jpg|jpeg|png|gif)$/i.test(file)
        );
        if (imageFiles.length === 0) return;

        const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
        const imageStream = fs.createReadStream(path.join(mediaFolder, randomImage));

        // Handle "hi" or "hello"
        if ((text.includes("hi") || text.includes("hello"))) {
            if (now - lastHiTime < 10000) return; // 10 seconds CD
            api.sendMessage({
                body: "👋 Pogi ng master namin si Nikox hahaha 🤣✌️",
                attachment: imageStream
            }, threadID);
            lastHiTime = now;
            hiUsed = true;
            return;
        }

        // Handle "yo"
        if (text.includes("yo")) {
            if (!hiUsed) return; // "hi" must be used first
            if (now - lastYoTime < 5 * 60 * 1000) return; // 5 min CD
            api.sendMessage({
                body: "🗣️ Yo wassup nigga! Sabi ng master Nikox namin hahaha 😎🔥",
                attachment: imageStream
            }, threadID);
            lastYoTime = now;
            hiUsed = false; // Reset so "hi" is required again
        }
    }
};
