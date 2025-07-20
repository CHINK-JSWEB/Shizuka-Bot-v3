const fs = require("fs");
const path = require("path");
const https = require("https");

module.exports = {
  name: "event", // Compatible with index.js (legacy event loader)
  async execute({ api, event }) {
    if (event.logMessageType !== "log:subscribe") return;

    try {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const totalMembers = threadInfo.participantIDs.length;
      const threadName = threadInfo.threadName?.toUpperCase() || "GROUP";
      const botID = api.getCurrentUserID();
      const newUsers = event.logMessageData.addedParticipants;

      for (const user of newUsers) {
        const userID = user.userFbId;
        const userName = user.fullName || "New Member";

        const mediaFolder = path.join(__dirname, "../media");
        const cacheFolder = path.join(__dirname, "../cache");

        // Make sure cache folder exists
        if (!fs.existsSync(cacheFolder)) {
          fs.mkdirSync(cacheFolder, { recursive: true });
        }

        // 🟢 Send welcome text
        await api.sendMessage({
          body: `🎉 WELCOME TO ${threadName}, @${userName}!\n\n👋 WE'RE GLAD TO HAVE YOU HERE.\n🫂 CURRENT FAMILY COUNT: ${totalMembers}`,
          mentions: [{ tag: `@${userName}`, id: userID }]
        }, event.threadID);

        // 🖼️ Welcome image from Kaiz API
        const imageURL = `https://kaiz-apis.gleeze.com/api/welcome?username=${encodeURIComponent(userName)}&avatar=https://graph.facebook.com/${userID}/picture`;
        const welcomeImagePath = path.join(cacheFolder, `welcome_${userID}.jpg`);

        try {
          await downloadImage(imageURL, welcomeImagePath);
          if (fs.existsSync(welcomeImagePath)) {
            await api.sendMessage({
              attachment: fs.createReadStream(welcomeImagePath)
            }, event.threadID);
            fs.unlinkSync(welcomeImagePath); // Clean up
          }
        } catch (e) {
          console.error(`⚠️ Failed to download or send welcome image for ${userName}:`, e.message);
        }

        // 📹 Send a random video from media/
        const videoNumber = Math.floor(Math.random() * 3) + 1;
        const videoPath = path.join(mediaFolder, `${videoNumber}.mp4`);
        if (fs.existsSync(videoPath)) {
          await api.sendMessage({ attachment: fs.createReadStream(videoPath) }, event.threadID);
        }

        // 🔊 Random welcome audio (media/*.mp3)
        const audioFiles = fs.existsSync(mediaFolder)
          ? fs.readdirSync(mediaFolder).filter(f => /\.(mp3|m4a|wav)$/i.test(f))
          : [];

        if (audioFiles.length > 0) {
          const randomAudio = path.join(mediaFolder, audioFiles[Math.floor(Math.random() * audioFiles.length)]);
          if (fs.existsSync(randomAudio)) {
            await api.sendMessage({ attachment: fs.createReadStream(randomAudio) }, event.threadID);
          }
        }

        // 👤 If the bot itself was added
        if (userID === botID) {
          await api.changeNickname("NIKOXBOT V2", event.threadID);
        }
      }

    } catch (err) {
      console.error("❌ WELCOME EVENT ERROR:", err);
    }
  }
};

// 🔽 Helper to download image
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, res => {
      if (res.statusCode !== 200) return reject(new Error(`Status Code ${res.statusCode}`));
      res.pipe(file);
      file.on("finish", () => file.close(resolve));
    }).on("error", reject);
  });
}
