const axios = require("axios");

async function sendMessage(senderId, messageData, pageAccessToken) {
  try {
    await axios.post(`https://graph.facebook.com/v17.0/me/messages?access_token=${pageAccessToken}`, {
      recipient: { id: senderId },
      message: messageData
    });
  } catch (error) {
    console.error("❌ Error sending message:", error.response?.data || error.message);
  }
}

module.exports = { sendMessage };
