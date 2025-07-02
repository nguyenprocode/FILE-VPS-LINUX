const { simi } = require('./../../lib/sim.js');
const logger = require('./../../utils/log');

module.exports.config = {
    name: "daybot",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "gojo",
    description: "Dạy bot",
    commandCategory: "Box",
    usages: "",
    cooldowns: 2,
    dependencies: {
        "axios": ""
    }
};

const blacklistedWords = ["đụ", "địt", "dit", "dm", "đm", "điếm", "cave", "lồn", "lon", "buồi", "cặc", "cac", "chó", "cho", "súc vật", "ngu", "óc chó", "đĩ", "di~", "đỹ", "dy~", "đjt", "djt", "cc", "cl", "cmm", "cdm", "clm", "ml", "msl", "sim", "cu", "cứt", "cuk", "đb", "db", "chịch", "ch!ch", "duma", "đuma", "vl", "vcl", "vleu", "vloz", "loz", "lồz", "lìn", "nứng", "đút", "mut", "mút", "đụ má", "địt mẹ", "rận", "bố m", "bố mày", "thằng chó"];

const containsBlacklistedWord = (text) => {
    if (!text) return false;
    const lowerText = text.toLowerCase();
    return blacklistedWords.some(word => lowerText.includes(word.toLowerCase()) || lowerText.replace(/\s+/g, '').includes(word.toLowerCase()));
};

module.exports.handleEvent = async ({ api, event, Users }) => {
    const { messageReply, senderID } = event;
    if (!messageReply) return;
    try {
        const originalMessage = messageReply.body;
        const replyMessage = event.body;
        if (!originalMessage || !replyMessage) return;
        if (messageReply.senderID === api.getCurrentUserID()) return;
        if (messageReply.senderID === senderID) return;
        if (containsBlacklistedWord(originalMessage) || containsBlacklistedWord(replyMessage)) {
            logger("Phát hiện từ cấm trong nội dung dạy bot", "warn");
            return;
        }

        const response = await simi('teach', { ask: originalMessage, ans: replyMessage });
        if (response.error) {
            logger(`Lỗi khi dạy bot: ${response.error}`, "error");
            return;
        }
        logger(`Đã học: ${originalMessage} → ${replyMessage}`, "Auto Learning");
    } catch (error) {
        logger(`Lỗi xử lý: ${error.message}`, "error");
    }
};

module.exports.run = ({ api, event }) => {
    const { threadID, messageID, senderID } = event;
    return api.sendMessage("[ Gojo ] - Reply tin nhắn này nhập câu hỏi cho Bot", threadID, (err, info) => {
        global.client.handleReply.push({
            step: 1,
            name: this.config.name,
            messageID: info.messageID,
            content: {
                id: senderID,
                ask: "",
                ans: ""
            }
        })
    }, messageID);
}

module.exports.handleReply = async({ api, event, Users, handleReply }) => {
    const moment = require("moment-timezone");
    const { threadID, messageID, senderID, body } = event;
    let by_name = (await Users.getData(senderID)).name;
    if (handleReply.content.id != senderID) return;
    const input = body.trim();
    
    if (containsBlacklistedWord(input)) {
        logger("Phát hiện từ cấm trong quá trình dạy bot", "warn");
        return api.sendMessage("[ Gojo ] - Nội dung không phù hợp!", threadID, messageID);
    }

    const sendC = (msg, step, content) => api.sendMessage(msg, threadID, (err, info) => {
        global.client.handleReply.splice(global.client.handleReply.indexOf(handleReply), 1);
        api.unsendMessage(handleReply.messageID);
        global.client.handleReply.push({
            step: step,
            name: this.config.name,
            messageID: info.messageID,
            content: content
        })
    }, messageID);
    const send = async(msg) => api.sendMessage(msg, threadID, messageID);

    let content = handleReply.content;
    const timeZ = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss | DD/MM/YYYY");
    
    switch (handleReply.step) {
        case 1:
            content.ask = input;
            logger(`${by_name} đang dạy bot với câu hỏi: ${input}`, "Manual Learning");
            sendC("[ Gojo ] - Reply tin nhắn này trả lời câu hỏi vừa xong", 2, content);
            break;
        case 2:
            content.ans = input;
            global.client.handleReply.splice(global.client.handleReply.indexOf(handleReply), 1);
            api.unsendMessage(handleReply.messageID);
            let response = await simi('teach', { ask: content.ask, ans: content.ans });
            if (response.error) {
                logger(`Lỗi dạy bot: ${response.error}`, "error");
                return send(`${response.error}`);
            }
            logger(`${by_name} đã dạy bot thành công: ${content.ask} → ${content.ans}`, "Manual Learning");
            send(`[ Gojo ] - Dạy Bot thành công, previews:\n\n🤤 Data:\n🧑‍🎓Khi bạn hỏi bot: " ${content.ask} " \n📌Bot sẽ trả lời: " ${content.ans} "\n\n⏱ Time: ${timeZ}`);
            break;
    }
}