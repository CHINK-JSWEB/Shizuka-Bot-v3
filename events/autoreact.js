module.exports = {
  name: "event",

  async execute({ api, event }) {
    if (event.type !== "message" || event.senderID === api.getCurrentUserID()) return;

    try {
      // React with a red heart ❤️ (change if you want other emoji)
      await api.setMessageReaction("❤", event.messageID, () => {}, true);
    } catch (err) {
      console.error("❌ AutoReact Error:", err);
    }
  }
};
