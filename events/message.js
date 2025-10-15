// events/message.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");

// Paths
const brainPath = path.join(__dirname, "../data/brain.json");
const learnPath = path.join(__dirname, "../data/learn.json");
const shizukaConfigPath = path.join(__dirname, "../data/shizuka-config.json");
const aiConfigPath = path.join(__dirname, "../data/ai-config.json");

let lastHiTime = 0;
let lastHelloTime = 0;
let lastYoTime = 0;

module.exports = {
  name: "message",

  async execute({ api, event }) {
    const { threadID, senderID, body } = event;
    if (!body || typeof body !== "string") return;

    const text = body.toLowerCase().trim();
    const now = Date.now();

    // Load configs
    let shizukaConfig = { on: true, name: "Shizuka", prefix: "!" };
    let aiConfig = { on: true };
    if (fs.existsSync(shizukaConfigPath)) {
      try { shizukaConfig = JSON.parse(fs.readFileSync(shizukaConfigPath, "utf8")); } catch {}
    }
    if (fs.existsSync(aiConfigPath)) {
      try { aiConfig = JSON.parse(fs.readFileSync(aiConfigPath, "utf8")); } catch {}
    }

    const shizukaActive = shizukaConfig.on;
    const aiActive = aiConfig.on;
    const botName = shizukaConfig.name || "Shizuka";

    // Skip commands (starts with prefix)
    if (text.startsWith(shizukaConfig.prefix || "!") || text.startsWith("/")) return;

    // ----- TOGGLE LOGIC -----
    if (text === "shizuka on" || text === "shizuka off") {
      shizukaConfig.on = text.endsWith("on");
      fs.writeFileSync(shizukaConfigPath, JSON.stringify(shizukaConfig, null, 2));
      return api.sendMessage(`✅ Shizuka is now ${shizukaConfig.on ? "ON" : "OFF"}`, threadID);
    }
    if (text === "ai on" || text === "ai off") {
      aiConfig.on = text.endsWith("on");
      fs.writeFileSync(aiConfigPath, JSON.stringify(aiConfig, null, 2));
      return api.sendMessage(`✅ AI auto-reply is now ${aiConfig.on ? "ON" : "OFF"}`, threadID);
    }

    // 🟢⚪🔴 Header
    const header = `🟢⚪🔴 ${botName} 🔴⚪🟢\nOwner : Jonnel Soriano\nPowered by: Jonnel AI 👑\nTime : ${new Date().toLocaleTimeString()}\nDate : ${new Date().toLocaleDateString()}\n__________________________________\n`;

    // Default greetings (always respond)
    const greetings = [
      { regex: /\bhi\b/, cooldown: 10000, lastTime: () => lastHiTime, setTime: t => lastHiTime = t, message: "Hello there! 😊 pagbati mula sa aking master na pogi 👑Jonnel" },
      { regex: /\bhello\b/, cooldown: 10000, lastTime: () => lastHelloTime, setTime: t => lastHelloTime = t, message: "Hey! How are you today? 😎" },
      { regex: /\byow\b/, cooldown: 5*60*1000, lastTime: () => lastYoTime, setTime: t => lastYoTime = t, message: "Yow! Wassup dude! 🔥" }
    ];

    for (let greet of greetings) {
      if (greet.regex.test(text)) {
        if (now - greet.lastTime() < greet.cooldown) return;
        api.sendMessage(header + greet.message, threadID);
        greet.setTime(now);
        return;
      }
    }

    const botCalled = text.includes(botName.toLowerCase());

    // Only respond if Shizuka or AI active or bot name mentioned
    if (!shizukaActive && !aiActive && !botCalled) return;

    // Load brain and learn
    const brain = fs.existsSync(brainPath) ? JSON.parse(fs.readFileSync(brainPath, "utf8")) : {};
    const learn = fs.existsSync(learnPath) ? JSON.parse(fs.readFileSync(learnPath, "utf8")) : {};

    // Shizuka replies
    if (shizukaActive && (brain[text] || learn[text])) {
      const reply = brain[text] || learn[text];
      return api.sendMessage(header + reply, threadID);
    }

    // AI fallback reply
    if (aiActive || botCalled) {
      try {
        const res = await axios.get(`https://kaiz-apis.gleeze.com/api/gpt-4o-pro?ask=${encodeURIComponent(body)}&uid=${senderID}&imageUrl=&apikey=fef2683d-2c7c-4346-a5fe-9e153bd9b7d0`);
        const reply = res.data?.response || "Hmm, I have no idea 🤔";
        api.sendMessage(header + reply, threadID);

        // Save unknown message to learn.json only if Shizuka active
        if (shizukaActive) {
          learn[text] = reply;
          fs.writeFileSync(learnPath, JSON.stringify(learn, null, 2));
        }
      } catch (err) {
        console.error("AI fallback error:", err.message);
      }
    }
  }
};