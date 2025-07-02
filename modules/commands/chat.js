const fs = require('fs');
const request = require('request');
const connections = new Map();
const activeReplies = new Set();
const pendingConnections = new Map();

module.exports.config = {
  name: "chat",
  version: "1.8.0",
  hasPermssion: 3,
  credits: "Satoru",
  description: "Kết nối 2 box bằng bot",
  commandCategory: "Admin",
  usages: ["", "disconnect"],
  cooldowns: 5,
};

let atmDir = [];

const getAtm = (atm, body) => new Promise(async (resolve) => {
    let msg = {}, attachment = [];
    msg.body = body;
    for(let eachAtm of atm) {
        await new Promise(async (resolve) => {
            try {
                let response =  await request.get(eachAtm.url),
                    pathName = response.uri.pathname,
                    ext = pathName.substring(pathName.lastIndexOf(".") + 1),
                    path = __dirname + `/cache/${eachAtm.filename}.${ext}`
                response
                    .pipe(fs.createWriteStream(path))
                    .on("close", () => {
                        attachment.push(fs.createReadStream(path));
                        atmDir.push(path);
                        resolve();
                    })
            } catch(e) { console.log(e); }
        })
    }
    msg.attachment = attachment;
    resolve(msg);
})

const disconnectThreads = async (api, threadID1, threadID2) => {
    connections.delete(threadID1);
    connections.delete(threadID2);
    
    global.client.handleReply = global.client.handleReply.filter(reply => {
        if (reply.threadID === threadID1 || reply.threadID === threadID2) {
            activeReplies.delete(reply.messageID);
            return false;
        }
        return true;
    });

    const threadInfo1 = await api.getThreadInfo(threadID1);
    const threadInfo2 = await api.getThreadInfo(threadID2);

    api.sendMessage(`💬 Đã ngắt kết nối thành công khỏi nhóm "${threadInfo2.threadName}"...`, threadID1);
    api.sendMessage(`💬 Bạn đã bị ngắt kết nối khỏi nhóm "${threadInfo1.threadName}"...`, threadID2);
}

module.exports.handleReply = async function ({ api, event, handleReply, Users, Threads }) {
    const { threadID, messageID, senderID, body } = event;
    
    if (handleReply.type === "listGroups") {
        const index = parseInt(body) - 1;
        if (isNaN(index) || index < 0 || index >= handleReply.groups.length) {
            return api.sendMessage("Lựa chọn không hợp lệ. Vui lòng chọn một số từ danh sách.", threadID, messageID);
        }

        const targetThread = handleReply.groups[index];
        
        if (connections.has(threadID)) 
            return api.sendMessage("⚠️ Nhóm này đã được kết nối. Sử dụng 'chat' để ngắt kết nối trước.", threadID, messageID);

        const currentThreadInfo = await api.getThreadInfo(threadID);
        api.sendMessage(`Nhóm "${currentThreadInfo.threadName}" muốn kết nối với bạn. Trả lời "ok" để chấp nhận.`, targetThread.threadID, (err, info) => {
            if (err) return console.error(err);
            pendingConnections.set(targetThread.threadID, {
                requester: threadID,
                requesterName: currentThreadInfo.threadName,
                messageID: info.messageID
            });
            api.sendMessage(`Đã gửi yêu cầu kết nối đến nhóm "${targetThread.name}". Vui lòng chờ phản hồi.`, threadID);
        });
        return;
    }
    
    if (handleReply.type === "pendingConnection") {
        if (body.toLowerCase() === "ok") {
            const { requester, requesterName } = handleReply;
            connections.set(threadID, requester);
            connections.set(requester, threadID);
            pendingConnections.delete(threadID);
            
            const currentThreadInfo = await api.getThreadInfo(threadID);
            api.sendMessage(`💬 Đã kết nối thành công với nhóm "${currentThreadInfo.threadName}"...`, requester);
            api.sendMessage(`💬 Đã kết nối thành công với nhóm "${requesterName}"...`, threadID);
        } else {
            api.sendMessage(`Nhóm "${handleReply.threadName}" đã từ chối yêu cầu kết nối.`, handleReply.requester);
            api.sendMessage("Bạn đã từ chối yêu cầu kết nối.", threadID);
            pendingConnections.delete(threadID);
        }
        return;
    }
    
    if (!activeReplies.has(handleReply.messageID) || !connections.has(threadID)) {
        return api.sendMessage("Cuộc trò chuyện này đã kết thúc hoặc bị ngắt kết nối.", threadID, messageID);
    }
    
    const connectedThreadID = connections.get(threadID);
    if (!connectedThreadID) {
        return api.sendMessage("Không có kết nối hiện tại.", threadID, messageID);
    }

    let name = await Users.getNameUser(senderID);
    let threadInfo = await Threads.getInfo(threadID);
    let threadName = threadInfo.threadName || "Unknown";

    let text = `👉${threadName}\n${name}:\n${body}`;
    
    if(event.attachments.length > 0) {
        text = await getAtm(event.attachments, text);
    }

    api.sendMessage(text, connectedThreadID, (err, info) => {
        if (err) return console.error(err);
        atmDir.forEach(each => fs.unlinkSync(each))
        atmDir = [];
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            messID: messageID,
            threadID: threadID
        })
        activeReplies.add(info.messageID);
    }, handleReply.messID);
}

module.exports.run = async function ({ api, event, args, Users, Threads }) {
    const { threadID, messageID, senderID } = event;
    
    if (connections.has(threadID)) {
        const connectedThread = connections.get(threadID);
        await disconnectThreads(api, threadID, connectedThread);
        return;
    }

    if (args.length === 0) {
        const threads = await api.getThreadList(100, null, ['INBOX']);
        const botUserID = api.getCurrentUserID();
        
        const filteredGroups = await Promise.all(threads
            .filter(thread => thread.isGroup && thread.threadID != threadID)
            .map(async (thread) => {
                const threadInfo = await api.getThreadInfo(thread.threadID);
                return {
                    ...thread,
                    isInGroup: threadInfo.participantIDs.includes(botUserID)
                };
            }));
        
        const groups = filteredGroups.filter(thread => thread.isInGroup);
        
        if (groups.length === 0) {
            return api.sendMessage("Không có nhóm nào để kết nối.", threadID, messageID);
        }
        
        let msg = "Danh sách các nhóm có thể kết nối:\n\n";
        groups.forEach((group, index) => {
            msg += `${index + 1}. ${group.name}\n`;
        });
        msg += "\nReply số thứ tự để gửi yêu cầu kết nối với nhóm tương ứng.";
        
        return api.sendMessage(msg, threadID, (error, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: senderID,
                type: "listGroups",
                groups: groups
            });
        }, messageID);
    }

    if (args[0].toLowerCase() === "disconnect") {
        api.sendMessage("Không có kết nối nào để ngắt. Sử dụng 'chat' để xem danh sách nhóm và kết nối.", threadID, messageID);
    } else {
        api.sendMessage("Lệnh không hợp lệ. Sử dụng 'chat' để xem danh sách nhóm và kết nối, hoặc 'chat disconnect' để ngắt kết nối.", threadID, messageID);
    }
};

module.exports.handleEvent = async function({ api, event, Users, Threads }) {
    const { threadID, messageID, senderID, body } = event;
    
    if (pendingConnections.has(threadID) && body.toLowerCase() === "ok") {
        const { requester, requesterName } = pendingConnections.get(threadID);
        connections.set(threadID, requester);
        connections.set(requester, threadID);
        pendingConnections.delete(threadID);
        
        const currentThreadInfo = await api.getThreadInfo(threadID);
        api.sendMessage(`💬 Đã kết nối thành công với nhóm "${currentThreadInfo.threadName}"...`, requester);
        api.sendMessage(`💬 Đã kết nối thành công với nhóm "${requesterName}"...`, threadID);
        return;
    }

    if (event.type !== "message" || event.senderID === api.getCurrentUserID()) return;

    const destinationThreadID = connections.get(threadID);
    
    if (destinationThreadID) {
        let name = await Users.getNameUser(senderID);
        let threadInfo = await Threads.getInfo(threadID);
        let threadName = threadInfo.threadName || "Unknown";

        let text = `👉${threadName}\n${name}:${body}`;
        
        if(event.attachments.length > 0) {
            text = await getAtm(event.attachments, text);
        }

        api.sendMessage(text, destinationThreadID, (err, info) => {
            if (err) return console.error(err);
            atmDir.forEach(each => fs.unlinkSync(each))
            atmDir = [];
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                messID: messageID,
                threadID: threadID
            })
            activeReplies.add(info.messageID);
        });
    }
};