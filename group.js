module.exports = {
    name: "event",

    async execute({ api, event }) {
        if (event.logMessageType === "log:subscribe") {
            try {
                const threadInfo = await api.getThreadInfo(event.threadID);
                const totalMembers = threadInfo.participantIDs.length;
                const botID = api.getCurrentUserID();

                const newUsers = event.logMessageData.addedParticipants;
                for (const user of newUsers) {
                    const userID = user.userFbId;
                    const userName = user.fullName || "there";

                    const mentions = [
                        { tag: `@${userName}`, id: userID },
                        { tag: "@Mark", id: "100030880666720" },
                        { tag: "@BotCreator", id: "100030880666720" }
                    ];

                    const message = {
                        body: `👋Niko- Wilkom Suldyir@${userName} to the group!
👥 Total members: ${totalMembers}


👨‍💻[ADMIN] @Nico Igdalino: W1lkom suldyir!! 

Bot creator:  @Angel Nico P Igdalino`,
                        mentions
                    };

                    await api.sendMessage(message, event.threadID);

                    // Set bot nickname if it's the one added
                    if (userID === botID) {
                        const newNickname = "NikoxBot V2";
                        await api.changeNickname(newNickname, event.threadID, botID);
                    }
                }
            } catch (err) {
                console.error("❌ Error in group event:", err);
            }
        }
    }
};
