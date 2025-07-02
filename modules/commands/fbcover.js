module.exports.config = {
    name: "fbcover",
    version: "1.3.0",
    hasPermssion: 0,
    credits: "lol",
    description: "Tạo ảnh bìa Facebook tùy chỉnh với xử lý ảnh trong reply",
    commandCategory: "Ảnh",
    usages: "fbcover",
    cooldowns: 5
};

module.exports.handleReply = async function ({ api, event, handleReply, Users }) {
    const fs = require("fs-extra");
    const axios = require("axios");
    const Canvas = require("canvas");
    const jimp = require("jimp");
    const path = require("path");
    
    const { loadImage, createCanvas } = Canvas;
    const { threadID, messageID, senderID } = event;
    
    if (senderID != handleReply.author) return;
    
    const input = event.body;
    const { data } = handleReply;
    
    switch (handleReply.step) {
        case 1:
            data.birthday = input;
            api.sendMessage("Nhập trạng thái tình cảm (VD: Độc thân):", threadID, (error, info) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    author: senderID,
                    step: 2,
                    data
                });
            }, messageID);
            break;
        case 2:
            data.love = input;
            api.sendMessage("Nhập nơi ở hiện tại:", threadID, (error, info) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    author: senderID,
                    step: 3,
                    data
                });
            }, messageID);
            break;
        case 3:
            data.location = input;
            api.sendMessage("Nhập quê quán:", threadID, (error, info) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    author: senderID,
                    step: 4,
                    data
                });
            }, messageID);
            break;
        case 4:
            data.hometown = input;
            api.sendMessage("Nhập số người theo dõi:", threadID, (error, info) => {
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    author: senderID,
                    step: 5,
                    data
                });
            }, messageID);
            break;
        case 5:
            data.follow = input;
            api.sendMessage("Đang xử lý ảnh, vui lòng đợi trong giây lát...", threadID, messageID);
            
            // Bắt đầu xử lý ảnh
            let pathBg = path.join(__dirname, 'cache', 'bg.png');
            let pathAva = path.join(__dirname, 'cache', 'av.png');
            let pathLine = path.join(__dirname, 'cache', 'li.png');

            let { uid, name, birthday, love, location, hometown, follow, gender } = data;

            let avatarUrl = `https://graph.facebook.com/${uid}/picture?height=1500&width=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
            let backgroundUrl = `https://i.imgur.com/OC7ZYE6.png`;
            let lineUrl = `https://i.imgur.com/ETTWIEL.png`;

            let avatar = (await axios.get(encodeURI(avatarUrl), { responseType: "arraybuffer" })).data; 
            fs.writeFileSync(pathAva, Buffer.from(avatar, "utf-8"));
            avatar = await this.circle(pathAva);

            let background = (await axios.get(encodeURI(backgroundUrl), { responseType: "arraybuffer" })).data;
            fs.writeFileSync(pathBg, Buffer.from(background, "utf-8"));

            let line = (await axios.get(encodeURI(lineUrl), { responseType: "arraybuffer" })).data;
            fs.writeFileSync(pathLine, Buffer.from(line, "utf-8"));

            // Tải font chữ nếu chưa có
            if (!fs.existsSync(path.join(__dirname, 'cache', 'UTMAvoBold.ttf'))) {
                let getfont2 = (await axios.get(`https://drive.google.com/u/0/uc?id=1DuI-ou9OGEkII7n8odx-A7NIcYz0Xk9o&export=download`, { responseType: "arraybuffer" })).data;
                fs.writeFileSync(path.join(__dirname, 'cache', 'UTMAvoBold.ttf'), Buffer.from(getfont2, "utf-8"));
            }
            if (!fs.existsSync(path.join(__dirname, 'cache', 'Baloo Regular.ttf'))) {
                let getfont1 = (await axios.get(`https://drive.google.com/u/0/uc?id=1IrxrZxo1ht3jur4ZI5MxH9Ri6HspO6YS&export=download`, { responseType: "arraybuffer" })).data;
                fs.writeFileSync(path.join(__dirname, 'cache', 'Baloo Regular.ttf'), Buffer.from(getfont1, "utf-8"));
            }

            // Bắt đầu vẽ
            let baseImage = await loadImage(pathBg);
            let baseAva = await loadImage(avatar);
            let baseLine = await loadImage(pathLine);
            
            let canvas = createCanvas(baseImage.width, baseImage.height);
            let ctx = canvas.getContext("2d");
            
            ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(baseLine, 0, 0, canvas.width, canvas.height);
            ctx.drawImage(baseAva, 356, 233, 404, 404);
            
            // Vẽ chữ và các thông tin khác
            Canvas.registerFont(path.join(__dirname, 'cache', 'UTMAvoBold.ttf'), { family: "UTMAvoBold" });
            Canvas.registerFont(path.join(__dirname, 'cache', 'Baloo Regular.ttf'), { family: "Baloo Regular" });
            
            ctx.font = "150px UTMAvoBold";
            ctx.strokeStyle = "rgba(255,255,255, 0.2)";
            ctx.lineWidth = 3;
            ctx.textAlign = "center";
            ctx.strokeText(name, 220, 131);
            ctx.strokeText(name, 543, 383);
            ctx.strokeText(name, 361, 630);
            ctx.strokeText(name, 211, 857);
            ctx.strokeText(name, 2000, 131);
            ctx.strokeText(name, 2323, 383);
            ctx.strokeText(name, 2141, 630);
            ctx.strokeText(name, 1991, 857);

            ctx.font = "45px UTMAvoBold";
            ctx.fillStyle = "#8317d9";
            ctx.textAlign = "center";
            
            ctx.transform(1, 0, -0.4, 1, 0, 0);
            ctx.fillRect(1650, 303, canvas.width + ctx.measureText(name).width - 2350, 90);
            ctx.transform(1, 0, 0.4, 1, 0, 0);
            
            ctx.font = "50px Baloo Regular";
            ctx.textAlign = "left";
            ctx.fillStyle = "#38b6ff";
            ctx.fillText(name.toUpperCase(), 1590, 365);
            
            ctx.font = "42px Baloo Regular";
            ctx.fillStyle = "#5adfe3";
            ctx.fillText(birthday, 1777, 477);
            ctx.fillText(gender, 1762, 547);
            ctx.fillText(follow, 1708, 618);
            ctx.fillText(love, 1783, 690);
            ctx.fillText(hometown, 1719, 767);
            ctx.fillText(location, 1745, 839);
            ctx.fillText(uid, 1639, 905);

            const imageBuffer = canvas.toBuffer();
            fs.writeFileSync(pathBg, imageBuffer);
            
            api.sendMessage(
                { attachment: fs.createReadStream(pathBg) },
                threadID,
                () => fs.unlinkSync(pathBg),
                messageID
            );
            
            break;
        default:
            break;
    }
};

module.exports.run = async function ({ api, event, Users }) {
    const { threadID, messageID, senderID } = event;
    
    // Lấy thông tin người dùng
    const userInfo = await Users.getInfo(senderID);
    const name = userInfo.name;
    const gender = userInfo.gender === 2 ? "Nam" : (userInfo.gender === 1 ? "Nữ" : "Khác");

    const data = {
        uid: senderID,
        name: name,
        gender: gender
    };

    api.sendMessage("Bắt đầu quá trình tạo ảnh bìa. Vui lòng nhập ngày sinh của bạn (VD: 01/01/2000):", threadID, (error, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: senderID,
            step: 1,
            data: data
        });
    }, messageID);
};

module.exports.circle = async (image) => {
    const jimp = require("jimp");
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
}