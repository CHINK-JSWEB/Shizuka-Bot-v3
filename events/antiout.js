module.exports.config = {
  name: "antiout",
  version: "1.0.0",
  author: "Nikox x Mirai",
  description: "Re-add user who left the group",
  eventType: ["log:unsubscribe"]
};

module.exports.run = async ({ api, event, Threads, Users }) => {
  const { threadID, logMessageData, author } = event;
  const leftID = logMessageData.leftParticipantFbId;

  // Don't run if it's the bot itself
  if (leftID === api.getCurrentUserID()) return;

  // Check if antiout is enabled in thread data
  const threadData = (await Threads.getData(threadID)).data || {};
  if (threadData.antiout === false) return;

  // Get user's name
  const name = global.data.userName.get(leftID) || await Users.getNameUser(leftID);

  // Determine if left on their own or was removed
  const isSelfLeave = author === leftID;

  if (isSelfLeave) {
    api.addUserToGroup(leftID, threadID, (err) => {
      if (err) {
        return api.sendMessage(
          `😞 Hindi naidagdag muli si ${name}.\nMaaaring naka-block ang bot o disabled ang Messenger nila.`,
          threadID
        );
      } else {
        return api.sendMessage(
          `🔁 Bumalik na si ${name} sa GC!`,
          threadID
        );
      }
    });
  }
};
