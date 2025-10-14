module.exports = {
  name: "senduid",
  version: "1.1",
  description: "Send a message to a specific Facebook UID with style",
  usage: "senduid <UID> <message>",
  cooldown: 3,
  role: 1, // 1 = admin only
  credits: "Jonnel",

  async execute({ api, event, args }) {
    const threadID = event.threadID;

    if (!args[0] || !args[1]) {
      return api.sendMessage(
        "❌ Usage: senduid <UID> <message>\nExample: senduid 100082770721408 Kamusta",
        threadID
      );
    }

    const targetUID = args[0];
    const msg = args.slice(1).join(" ");

    // Build styled message
    const styledMessage =
`🟢⚪🔴 ── 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱 𝗯𝘆 𝗚𝗲𝗺𝗶𝗻𝗶 2.0 ── 🟢⚪🔴
💬 Message for UID: ${targetUID}

📌 Content:
"${msg}"

──────────────
🔹 Powered by Jonnel`;

    try {
      await api.sendMessage(styledMessage, targetUID);
      return api.sendMessage(`✅ Successfully sent message to UID: ${targetUID}`, threadID);
    } catch (err) {
      console.error("❌ senduid error:", err);
      return api.sendMessage(
        `❌ Failed to send message to UID: ${targetUID}`,
        threadID
      );
    }
  }
};