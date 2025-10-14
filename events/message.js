// events/message.js
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const brainPath = path.join(__dirname, "../data/brain.json");
const learnPath = path.join(__dirname, "../data/learn.json");
const lastReplyPath = path.join(__dirname, "../data/nobi-last-reply.json");
const configPath = path.join(__dirname, "../data/shizuka-config.json");

let lastHiTime = 0;
let lastYoTime = 0;
let hiUsed = false;

let brain = {};
let learn = {};
let lastReply = {};
let aiConfig = { enabled: true };

// Load JSON files
function loadJSON(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, "utf8"));
    }
  } catch (e) {
    console.error(`⚠️ Failed to read ${filePath}:`, e);
  }
  return {};
}

function saveJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(`⚠️ Failed to save ${filePath}:`, e);
  }
}

function getHeader() {
  const now = new Date();
  return (
    "🟢⚪🔴SHIZUKA🔴⚪🟢\n" +
    "Owner : Jonnel Soriano\n" +
    "Creator : Jonnel 👑\n" +
    `Time : ${now.toLocaleTimeString("en-US", { hour12: true })}\n` +
    `Date : ${now.toLocaleDateString("en-US")}\n` +
    "--------------------\n"
  );
}

function cleanText(text) {
  return text.trim().toLowerCase();
}

// Check if message is a command
function isCommand(text, cmds) {
  const cmdNames = Object.keys(cmds);
  return cmdNames.some(c => text.startsWith(c));
}

module.exports = {
  name: "message",

  async execute({ api, event, args, cmds }) {
    const { threadID, senderID, body } = event;
    if (!body || typeof body !== "string") return;

    const text = body.trim();
    const lowerText = cleanText(text);

    // Load data
    brain = loadJSON(brainPath);
    learn = loadJSON(learnPath);
    lastReply = loadJSON(lastReplyPath);
    aiConfig = loadJSON(configPath);

    const botID = api.getCurrentUserID();
    if (senderID === botID) return;

    // --- Default media folder ---
    const mediaFolder = path.join(__dirname, "../media/message");
    let imageStream = null;
    if (fs.existsSync(mediaFolder)) {
      const files = fs.readdirSync(mediaFolder).filter(f => /\.(jpg|jpeg|png|gif)$/i.test(f));
      if (files.length > 0) {
        const random = files[Math.floor(Math.random() * files.length)];
        imageStream = fs.createReadStream(path.join(mediaFolder, random));
      }
    }

    const header = getHeader();

    // --- Default greetings ---
    if (/\b(hi|hello|hola)\b/i.test(text)) {
      if (Date.now() - lastHiTime < 10000) return; // 10s cooldown
      api.sendMessage({ body: header + "👋 Hello there!", attachment: imageStream || undefined }, threadID);
      lastHiTime = Date.now();
      hiUsed = true;
      return;
    }

    if (/\byo\b/i.test(text)) {
      if (!hiUsed) return;
      if (Date.now() - lastYoTime < 5 * 60 * 1000) return; // 5min cooldown
      api.sendMessage({ body: header + "🗣️ Yo wassup!", attachment: imageStream || undefined }, threadID);
      lastYoTime = Date.now();
      hiUsed = false;
      return;
    }

    // --- AI toggle commands ---
    if (lowerText === "shizuka on") {
      aiConfig.enabled = true;
      saveJSON(configPath, aiConfig);
      return api.sendMessage("✅ Shizuka AI is now ON!", threadID);
    }

    if (lowerText === "shizuka off") {
      aiConfig.enabled = false;
      saveJSON(configPath, aiConfig);
      return api.sendMessage("🛑 Shizuka AI is now OFF!", threadID);
    }

    // --- Ignore commands if AI is ON ---
    if (aiConfig.enabled && isCommand(lowerText, cmds)) return;

    // --- Respond if bot's name is mentioned (any case) ---
    if (lowerText.includes("shizuka")) {
      // Brain + learn lookup
      let response = brain[lowerText] || learn[lowerText] || null;
      if (!response) response = "🤖 I heard you!";
      api.sendMessage(header + response, threadID);
      return;
    }

    // --- Respond if AI is ON and unknown message ---
    if (aiConfig.enabled) {
      try {
        const res = await axios.get(
          `https://kaiz-apis.gleeze.com/api/gpt-4o-pro?ask=${encodeURIComponent(text)}&uid=${senderID}&apikey=fef2683d-2c7c-4346-a5fe-9e153bd9b7d0`
        );
        const aiResp = res.data?.response || "🤖 Sorry, I have no answer.";
        api.sendMessage(header + aiResp, threadID);
      } catch (e) {
        console.error("❌ AI Error:", e.message);
      }
      return;
    }

    // --- Respond using brain/learn if exists ---
    if (brain[lowerText] || learn[lowerText]) {
      const reply = brain[lowerText] || learn[lowerText];
      api.sendMessage(header + reply, threadID);
    }
  },
};