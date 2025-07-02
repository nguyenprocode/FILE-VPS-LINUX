const { existsSync, mkdirSync, readFileSync, writeFileSync } = global.nodemodule["fs-extra"];
const { join } = global.nodemodule["path"];

module.exports.config = {
    name: "leave",
    eventType: ["log:unsubscribe"],
    version: "1.0.4",
    credits: "HĐGN & Modified by Satoru",
    description: "Thông báo Bot hoặc người dùng rời khỏi nhóm có random gif/ảnh/video",
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
};

const checkttPath = __dirname + '/../commands/_checktt/';
const leavePath = __dirname + '/../commands/data/leave';

module.exports.onLoad = function () {
    const path = join(__dirname, "cache", "leaveGif");
    if (!existsSync(path)) mkdirSync(path, { recursive: true });
    if (!existsSync(leavePath)) mkdirSync(leavePath, { recursive: true });
}

module.exports.run = async function ({ api, event, Users, Threads }) {
    if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) {
        const interactionDataPath = checkttPath + event.threadID + '.json';
        if (existsSync(interactionDataPath)) {
            fs.unlinkSync(interactionDataPath);
        }
        console.log(`Đã xóa dữ liệu tương tác của nhóm: ${event.threadID} do bot rời khỏi nhóm`, "[ UPDATE DATA ]");
        return;
    }
    
    const { threadID, logMessageData } = event;
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss - DD/MM/YYYY");
    let thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
    if (thu == 'Sunday') thu = 'Chủ Nhật'
    if (thu == 'Monday') thu = 'Thứ Hai'
    if (thu == 'Tuesday') thu = 'Thứ Ba'
    if (thu == 'Wednesday') thu = 'Thứ Tư'
    if (thu == "Thursday") thu = 'Thứ Năm'
    if (thu == 'Friday') thu = 'Thứ Sáu'
    if (thu == 'Saturday') thu = 'Thứ Bảy'

    const threadData = global.data.threadData.get(parseInt(threadID)) || (await Threads.getData(threadID)).data;
    const name = global.data.userName.get(logMessageData.leftParticipantFbId) || await Users.getNameUser(logMessageData.leftParticipantFbId);
    const type = (event.author == logMessageData.leftParticipantFbId) ? "Đã tự động rời khỏi nhóm." : "Đã bị Quản trị viên xóa khỏi nhóm.";

    // Kiểm tra xem có shortcut leave không
    const shortcutData = global.moduleData.shortcut.get(threadID) || [];
    const leaveShortcut = shortcutData.find(e => e.input_type === 'leave');

    let msg, attachment;
    if (leaveShortcut) {
        msg = leaveShortcut.output;
        // Lấy attachment từ shortcut nếu có
        if (leaveShortcut.uri) {
            if (/^https:\/\//.test(leaveShortcut.uri)) {
                attachment = await global.utils.getStreamFromURL(leaveShortcut.uri);
            } else if (leaveShortcut.uri === 'girl') {
                attachment = global.girl.splice(0, 1);
            } else if (leaveShortcut.uri === 'boy') {
                attachment = global.boy.splice(0, 1);
            }
        }
    } else {
        msg = threadData.customLeave 
            ? threadData.customLeave
            : `[ Thành Viên Thoát Nhóm ]\n─────────────────\n👤 Thành viên: {name}\n📌 Lý do: {type}\n📝 Profile: {link}\n📆 Thoát nhóm vào {thu}\n⏰ Thời gian: {time}`;
        try {
            attachment = global.a.splice(0, 1);
        } catch (e) {
            console.error("Error getting default attachment:", e);
            attachment = null;
        }
    }

    msg = msg
        .replace(/\{name}/g, name)
        .replace(/\{type}/g, type)
        .replace(/\{link}/g, `https://www.facebook.com/profile.php?id=${logMessageData.leftParticipantFbId}`)
        .replace(/\{thu}/g, thu)
        .replace(/\{time}/g, time);

    // Xử lý log người rời nhóm
    const leaveLogPath = join(leavePath, `${threadID}.json`);
    let leaveLog = [];
    if (existsSync(leaveLogPath)) {
        leaveLog = JSON.parse(readFileSync(leaveLogPath));
    }

    let userIndex = leaveLog.findIndex(user => user.uid === logMessageData.leftParticipantFbId);

    if (userIndex === -1) {
        leaveLog.push({
            name: name,
            uid: logMessageData.leftParticipantFbId,
            time: time,
            reason: type,
            facebook: `https://www.facebook.com/${logMessageData.leftParticipantFbId}`
        });
    } else {
        leaveLog[userIndex] = {
            name: name,
            uid: logMessageData.leftParticipantFbId,
            time: time,
            reason: type,
            facebook: `https://www.facebook.com/${logMessageData.leftParticipantFbId}`
        };
    }

    writeFileSync(leaveLogPath, JSON.stringify(leaveLog, null, 2));

    // Cập nhật dữ liệu tương tác
    if (existsSync(checkttPath + threadID + '.json')) {
        const threadData = JSON.parse(readFileSync(checkttPath + threadID + '.json'));
        const userData_week_index = threadData.week.findIndex(e => e.id == logMessageData.leftParticipantFbId);
        const userData_day_index = threadData.day.findIndex(e => e.id == logMessageData.leftParticipantFbId);
        const userData_total_index = threadData.total.findIndex(e => e.id == logMessageData.leftParticipantFbId);

        if (userData_total_index != -1) threadData.total.splice(userData_total_index, 1);
        if (userData_week_index != -1) threadData.week.splice(userData_week_index, 1);
        if (userData_day_index != -1) threadData.day.splice(userData_day_index, 1);

        writeFileSync(checkttPath + threadID + '.json', JSON.stringify(threadData, null, 4));
    }

    // Chuẩn bị dữ liệu tin nhắn
    const messageData = {
        body: msg,
        attachment: attachment
    };

    // Lưu dữ liệu tin nhắn vào global để shortcut handler có thể sử dụng
    if (!global.shortcutData) global.shortcutData = {};
    if (!global.shortcutData[threadID]) global.shortcutData[threadID] = {};
    global.shortcutData[threadID].leaveMessage = messageData;

    // Nếu không có shortcut, gửi tin nhắn như bình thường
    if (!leaveShortcut) {
        return api.sendMessage(messageData, threadID);
    } else {
        console.log(`Shortcut leave found for thread ${threadID}. Message prepared for shortcut handler.`);
    }
}