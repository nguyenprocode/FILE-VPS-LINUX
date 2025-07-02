module.exports.config = {
 name: "money",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "NGH",
 description: "Kiểm tra và quản lý tiền cho bản thân hoặc người khác",
 commandCategory: "Money",
 usages: "check [Tag] | + <số tiền> <Tag> | - <số tiền> <Tag> | del <Tag> | reset |",
 cooldowns: 0,
 usePrefix: false
};

module.exports.run = async function({ api, event, args, Currencies, Users }) {
     const { threadID, messageID, senderID, mentions, type, messageReply } = event;
         let targetID = senderID;
         if (Object.keys(mentions).length == 1) targetID = Object.keys(mentions)[0];
         else if (type === 'message_reply') targetID = messageReply.senderID;
         const userData = await Currencies.getData(targetID);
         const money = userData ? userData.money : 0;
         const name = (await api.getUserInfo(targetID))[targetID].name;
         api.setMessageReaction("✅", messageID, () => {}, true);
         return api.sendMessage(`👤 Tên: ${name}\n💵 Số tiền: ${money.toLocaleString()} VND`, threadID, messageID);
     }