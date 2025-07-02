const chalk = require('chalk');
const moment = require("moment-timezone");

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function interpolateColor(color1, color2, factor) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return '#000000';

    const r = Math.round(rgb1.r + factor * (rgb2.r - rgb1.r));
    const g = Math.round(rgb1.g + factor * (rgb2.g - rgb1.g));
    const b = Math.round(rgb1.b + factor * (rgb2.b - rgb1.b));
    
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
}

// Mảng màu gradient mới
const gradientPalettes = [
    ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'], // Cầu vồng
    ['#FF0000', '#FF00FF', '#9400D3', '#4B0082'], // Đỏ tím
    ['#00FF00', '#00FFFF', '#0000FF', '#4B0082'], // Xanh dương
    ['#FFD700', '#FFA500', '#FF4500', '#8B0000'], // Vàng cam đỏ
    ['#00FF00', '#00FA9A', '#00CED1', '#0000FF']  // Xanh lá biển
];

let currentPalette = 0;
let currentIndex = 0;

function createLineGradient(text, colors) {
    const chars = text.split('');
    let result = '';
    const totalChars = chars.length;
    
    chars.forEach((char, i) => {
        const section = (i / totalChars) * (colors.length - 1);
        const colorIndex = Math.floor(section);
        const factor = section - colorIndex;
        
        const color = interpolateColor(
            colors[colorIndex],
            colors[colorIndex + 1] || colors[colorIndex],
            factor
        );
        result += chalk.hex(color)(char);
    });
    
    return result;
}

module.exports.config = {
    name: "console",
    version: "1.3.0",
    hasPermssion: 3,
    credits: "JRT modified by Satoru",
    description: "Bật/tắt ghi log console với gradient",
    commandCategory: "Admin",
    usages: "[on/off]",
    cooldowns: 5,
};

module.exports.handleEvent = async function ({ api, args, Users, event, Threads, utils, client }) {
    const { threadID, messageID, senderID, isGroup } = event;
    
    if (global.data.console == false) return;

    moment.locale('vi');
    var time = moment().format('HH:mm DD/MM/YYYY');
    
    var nameBox = "Tin nhắn riêng";
    if (isGroup) {
        try {
            const threadInfo = await Threads.getInfo(threadID);
            nameBox = threadInfo.threadName || "Tên không tồn tại";
        } catch (err) {
            console.error("Error getting thread info:", err);
            nameBox = "Lỗi lấy tên nhóm";
        }
    }
    var groupOrPrivate = isGroup ? '👥 Nhóm' : '👤 Cá nhân';

    var nameUser = await Users.getNameUser(senderID) || "Tên không tồn tại";
    var msg = event.body || "Ảnh, video hoặc kí tự đặc biệt";

    if (event.attachments && event.attachments.length > 0) {
        msg = event.attachments.map(att => att.type === 'photo' ? 'Ảnh' : 'Video').join(', ');
    }

    const isBot = senderID == api.getCurrentUserID();
    const botLabel = isBot ? '[BOT] ' : '';

    // Rotate through gradient palettes
    currentIndex = (currentIndex + 1) % 10;
    if (currentIndex === 0) {
        currentPalette = (currentPalette + 1) % gradientPalettes.length;
    }
    
    const currentColors = gradientPalettes[currentPalette];
    
    const topBorder = '╔══════════════════════════════════════════════════════════════════╗';
    const bottomBorder = '╚═════════════════════════ Satoru ═════════════════════════════════╝';
    const line = '║';
    const space = ' '.repeat(64 - nameBox.length - groupOrPrivate.length);
    const truncate = (str, maxLength) => str.length > maxLength ? str.slice(0, maxLength - 3) + '...' : str;

    // Tạo gradient cho từng dòng với màu sắc khác nhau
    console.log(createLineGradient(topBorder, currentColors));
    console.log(createLineGradient(`${line} ${groupOrPrivate} ${nameBox}${space}`, currentColors));
    console.log(createLineGradient(`${line} Người dùng: ${botLabel}${truncate(nameUser, 52 - botLabel.length)}`, currentColors));
    console.log(createLineGradient(`${line} Tin nhắn: ${truncate(msg, 54)}`, currentColors));
    console.log(createLineGradient(`${line} Thời gian: ${truncate(time, 52)}`, currentColors));
    console.log(createLineGradient(`${line} ID: ${truncate(senderID, 58)}`, currentColors));
    console.log(createLineGradient(bottomBorder, currentColors));
};

module.exports.run = async function ({ api, args, Users, event, Threads, utils, client }) {
    const { threadID, messageID } = event;
    
    if (args.length === 0) {
        return api.sendMessage("Vui lòng sử dụng on hoặc off.", threadID, messageID);
    }

    const action = args[0].toLowerCase();

    if (action === "on") {
        global.data.console = true;
        return api.sendMessage("Đã bật ghi log console với hiệu ứng gradient.", threadID, messageID);
    } else if (action === "off") {
        global.data.console = false;
        return api.sendMessage("Đã tắt ghi log console.", threadID, messageID);
    } else {
        return api.sendMessage("Cú pháp không hợp lệ. Vui lòng sử dụng on hoặc off.", threadID, messageID);
    }
};

// Clear console với gradient
setInterval(() => {
    console.clear();
    const clearMessage = 'Console đã được xóa 🗑️';
    console.log(createLineGradient(clearMessage, gradientPalettes[0]));
}, 30 * 60 * 1000);