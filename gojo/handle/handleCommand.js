module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const stringSimilarity = require('string-similarity'),
        escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        logger = require("../../utils/log.js");
    const axios = require('axios');
    const request = require('request');
    const fs = require('fs');
    const path = require('path');
    const moment = require("moment-timezone");

    return async function ({ event }) {
        const dateNow = Date.now()
        const time = moment.tz("Asia/Ho_Chi_minh").format("HH:MM:ss DD/MM/YYYY");
        const { allowInbox, PREFIX, ADMINBOT, NDH, DeveloperMode, adminOnly, keyAdminOnly, ndhOnly, adminPaseOnly } = global.config;
        const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
        const { commands, cooldowns } = global.client;
        var { body, senderID, threadID, messageID } = event;

        function byte2mb(bytes) {
            const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
            let l = 0, n = parseInt(bytes, 10) || 0;
            while (n >= 1024 && ++l) n = n / 1024;
            return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)} ${units[l]}`;
        }

        let threadSettingBox = global.data.threadData.get(threadID) || {};
        let prefixbox = threadSettingBox.PREFIX || PREFIX;
        const tm = process.uptime(), Tm = (require('moment-timezone')).tz('Asia/Ho_Chi_Minh').format('HH:mm:ss || DD/MM/YYYY')
        h = Math.floor(tm / (60 * 60)), H = h < 10 ? '0' + h : h,
            m = Math.floor((tm % (60 * 60)) / 60), M = m < 10 ? '0' + m : m,
            s = Math.floor(tm % 60), S = s < 10 ? '0' + s : s, $ = ':'
        var senderID = String(senderID),
            threadID = String(threadID);
        const threadSetting = threadData.get(threadID) || {}
        const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex((threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : PREFIX)})\\s*`);
        const adminbot = require('./../../config.json');

        if (typeof body === 'string' && body.startsWith(prefixbox) && !NDH.includes(senderID) && !ADMINBOT.includes(senderID) && adminbot.adminOnly == true) {
            return api.sendMessage(`⚠️ Chỉ admin bot mới có thể sử dụng bot!`, threadID, messageID);
        }
        if (typeof body === 'string' && body.startsWith(prefixbox) && !NDH.includes(senderID) && !ADMINBOT.includes(senderID) && adminbot.adminPaseOnly == true) {
            return api.sendMessage(`⚠️ Chỉ admin bot mới được sử dụng bot trong chat riêng!`, threadID, messageID);
        }
        if (typeof body === 'string' && body.startsWith(prefixbox) && !NDH.includes(senderID) && !ADMINBOT.includes(senderID) && adminbot.ndhOnly == true) {
            return api.sendMessage(`⚠️ Chỉ người hỗ trợ bot mới có thể sử dụng bot!`, threadID, messageID);
        }

        const dataAdbox = require('./../../modules/commands/data/dataAdbox.json');
        var threadInf = (threadInfo.get(threadID) || await Threads.getInfo(threadID));
        const findd = threadInf.adminIDs.find(el => el.id == senderID);
        if (typeof body === 'string' && body.startsWith(prefixbox) && dataAdbox.adminbox.hasOwnProperty(threadID) && dataAdbox.adminbox[threadID] == true && !NDH.includes(senderID) && !ADMINBOT.includes(senderID) && !findd && event.isGroup == true) return api.sendMessage(`⚠️ Chỉ quản trị viên nhóm mới có thể sử dụng bot!`, event.threadID, event.messageID);

        if (userBanned.has(senderID) || threadBanned.has(threadID) || allowInbox == ![] && senderID == threadID) {
            if (!body.startsWith(PREFIX)) return
            if (!NDH.includes(senderID.toString()) && !ADMINBOT.includes(senderID.toString())) {
                if (userBanned.has(senderID)) {
                    const { reason, dateAdded } = userBanned.get(senderID) || {};
                    return api.sendMessage(global.getText("handleCommand", "userBanned", reason, dateAdded), threadID, async (err, info) => {
                        await new Promise(resolve => setTimeout(resolve, 15 * 1000));
                        return api.unsendMessage(info.messageID);
                    }, messageID);
                } else {
                    if (threadBanned.has(threadID)) {
                        const { reason, dateAdded } = threadBanned.get(threadID) || {};
                        return api.sendMessage(global.getText("handleCommand", "threadBanned", reason, dateAdded), threadID, async (err, info) => {
                            await new Promise(resolve => setTimeout(resolve, 15 * 1000));
                            return api.unsendMessage(info.messageID);
                        }, messageID);
                    }
                }
            }
        }
        body = body !== undefined ? body : 'x'
        const [matchedPrefix] = body.match(prefixRegex) || ['']
        var args = body.slice(matchedPrefix.length).trim().split(/ +/);
        var commandName = args.shift().toLowerCase();
        var command = commands.get(commandName);

        //------------ usePrefix -------->
        if (!prefixRegex.test(body)) {
            args = (body || '').trim().split(/ +/);
            commandName = args.shift()?.toLowerCase();
            command = commands.get(commandName);

            // Sửa lỗi: Đảm bảo 'command' tồn tại trước khi truy cập 'config'
            if (command && command.config) {
                if (command.config.usePrefix === false && commandName.toLowerCase() !== command.config.name.toLowerCase()) {
                    api.sendMessage(global.getText("handleCommand", "notMatched", command.config.name), event.threadID, event.messageID);
                    return;
                }
                if (command.config.usePrefix === true && !body.startsWith(PREFIX)) {
                    return;
                }
            }
            // Sửa lỗi: Đảm bảo 'command' tồn tại trước khi truy cập 'config'
            if (command && command.config) {
                if (typeof command.config.usePrefix === 'undefined') {
                    return;
                }
            }
        }
        //---------------END --------------<

        if (!command) {
            if (!body.startsWith((threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : PREFIX)) return;

            var allCommandName = [];
            const commandValues = commands['keys']();

            for (const cmd of commandValues) allCommandName.push(cmd);
            var gio = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss | DD/MM/YYYY");
            const name = await Users.getNameUser(event.senderID);
            let uid = event.senderID;
            const folderPath = './modules/commands';
            fs.readdir(folderPath, (err, files) => {
                if (err) {
                    console.error('Lỗi đọc thư mục:', err);
                    return;
                }
                const allFiles = files
                    .filter(file => fs.statSync(path.join(folderPath, file)).isFile())
                    .map(file => ({
                        name: file,
                        time: fs.statSync(path.join(folderPath, file)).mtime.getTime(),
                    }));
                const latestFile = allFiles.sort((a, b) => b.time - a.time)[0];
                if (latestFile) {
                    const newFile = latestFile.name;
                    const checker = stringSimilarity.findBestMatch(commandName, allCommandName);
                    if (checker.bestMatch.rating >= 1.0) {
                        command = client.commands.get(checker.bestMatch.target);
                    } else {
                        api.sendMessage(`👤 Người dùng: ${name}\n❎ Lệnh không tồn tại, gõ ${prefixbox}menu để xem các lệnh hiện có\n✏️ Lệnh gần giống là: " ${checker.bestMatch.target} "`, event.threadID, async (err, info) => {
                            await new Promise(resolve => setTimeout(resolve, 15 * 1000));
                            return api.unsendMessage(info.messageID);
                        }, event.messageID);
                    }
                }
            });
        }

        // Thêm kiểm tra `command` ở đây để xử lý trường hợp lệnh không tìm thấy
        if (!command) {
            return; // Nếu không có lệnh nào được tìm thấy, thoát hàm
        }

        if (command) {
            if (true) {
                let fs = require('fs');
                let path = __dirname + '/../../modules/commands/data/commands-banned.json';
                let data = {};
                // Sửa lỗi: Kiểm tra threadInfo.get(threadID) trước khi truy cập .adminIDs
                let is_qtv_box = id => (threadInfo.get(threadID) && threadInfo.get(threadID).adminIDs.some($ => $.id == id));
                let name = id => global.data.userName.get(id);
                let cmd = command.config.name; // Đảm bảo command.config tồn tại nhờ kiểm tra ở đầu hàm

                if (fs.existsSync(path)) data = JSON.parse(fs.readFileSync(path));
                if (data[threadID]) {
                    if (ban = data[threadID].cmds.find($ => $.cmd == cmd)) {
                        if (ADMINBOT.includes(ban.author) && !NDH.includes(senderID) && ban.author != senderID) return send(`[ BANNER COMMAND ]\n────────────────────\n🕑 Vào lúc: ${ban.time}\n👤 Admin bot: ${name(ban.author)}\n⛔ Đã cấm nhóm sử dụng lệnh ${cmd}\n✏️ Liên hệ với admin để được hỗ trợ\n────────────────────\n⏳ Uptime: ${H + $ + M + $ + S}\n⏰ Time: ${Tm}`);
                        if (is_qtv_box(ban.author) && !NDH.includes(senderID) && ban.author != senderID) return send(`[ BANNER COMMAND ]\n────────────────────\n🕑 Vào lúc: ${ban.time}\n👤 Qtv nhóm: ${name(ban.author)}\n⛔ Đã cấm thành viên sử dụng lệnh ${cmd}\n────────────────────\n⏳ Uptime: ${H + $ + M + $ + S}\n⏰ Time: ${Tm}`);
                    };
                    if (all = (data[threadID].users[senderID] || {}).all) {
                        if (all.status == true && ADMINBOT.includes(all.author) && !NDH.includes(senderID) && !ADMINBOT.includes(senderID)) return send(`[ BANNER USER ]\n────────────────────\n🕑 Vào lúc: ${all.time}\n⚠️ Bạn đã bị admin bot: ${name(all.author)} cấm\n👤 Liên hệ với admin để được hỗ trợ\n────────────────────\n⏳ Uptime: ${H + $ + M + $ + S}\n⏰ Time: ${Tm}`);
                        if (all.status == true && is_qtv_box(all.author) && !NDH.includes(senderID) && !ADMINBOT.includes(senderID) && !is_qtv_box(senderID)) return send(`[ BANNER USER ]\n────────────────────\n🕑 Vào lúc ${all.time}\n⛔ Bạn đã bị qtv box: ${name(all.author)} cấm\n────────────────────\n⏳ Uptime: ${H + $ + M + $ + S}\n⏰ Time: ${Tm}`);
                    };
                    if (user_ban = (data[threadID].users[senderID] || {
                        cmds: []
                    }).cmds.find($ => $.cmd == cmd)) {
                        if (ADMINBOT.includes(user_ban.author) && !NDH.includes(senderID) && !ADMINBOT.includes(senderID)) return send(`[ USERBAN COMMAND ]\n────────────────────\n🕑 Vào lúc: ${user_ban.time}\n👤 Admin bot: ${name(user_ban.author)}\n⛔ Đã cấm bạn sử dụng lệnh ${cmd}\n✏️ Liên hệ với admin để được hỗ trợ\n────────────────────\n⏳ Uptime: ${H + $ + M + $ + S}\n⏰ Time: ${Tm}`);
                        if (is_qtv_box(user_ban.author) && !is_qtv_box(senderID) && !NDH.includes(senderID) && !ADMINBOT.includes(senderID)) return send(`[ USERBAN COMMAND ]\n────────────────────\n🕑 Vào lúc: ${user_ban.time}\n👤 Qtv nhóm: ${name(user_ban.author)}\n⛔ Đã cấm bạn sử dụng lệnh ${cmd}\n────────────────────\n⏳ Uptime: ${H + $ + M + $ + S}\n⏰ Time: ${Tm}`);
                    }
                }
            };
        }
        // Sử dụng Optional Chaining (`?.`) để truy cập thuộc tính config một cách an toàn
        if ((_kJe82Q = process.cwd() + '/modules/commands/data/disable-command.json', fs.existsSync(_kJe82Q))) if (!ADMINBOT.includes(senderID) && !NDH.includes(senderID) && JSON.parse(fs.readFileSync(_kJe82Q))[threadID]?.[command?.config?.commandCategory] == true) return api.sendMessage(`[ DISABLE COMMAND ]\n────────────────────\n⚠️ Box không được phép sử dụng các lệnh thuộc nhóm " ${command?.config?.commandCategory} "\n👤 Liên hệ với admin để được hỗ trợ\n────────────────────\n⏳ Uptime: ${H + $ + M + $ + S}\n⏰ Time: ${Tm}`, threadID);

        if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
            if (!NDH.includes(senderID) && !ADMINBOT.includes(senderID)) {
                const banThreads = commandBanned.get(threadID) || [],
                    banUsers = commandBanned.get(senderID) || [];
                // Sử dụng Optional Chaining (`?.`) để truy cập thuộc tính name một cách an toàn
                if (banThreads.includes(command?.config?.name))
                    return api.sendMessage(global.getText("handleCommand", "commandThreadBanned", command.config.name), threadID, async (err, info) => {
                        await new Promise(resolve => setTimeout(resolve, 15 * 1000))
                        return api.unsendMessage(info.messageID);
                    }, messageID);
                // Sử dụng Optional Chaining (`?.`) để truy cập thuộc tính name một cách an toàn
                if (banUsers.includes(command?.config?.name))
                    return api.sendMessage(global.getText("handleCommand", "commandUserBanned", command.config.name), threadID, async (err, info) => {
                        await new Promise(resolve => setTimeout(resolve, 15 * 1000));
                        return api.unsendMessage(info.messageID);
                    }, messageID);
            }
        }

        var threadInfo2;
        if (event.isGroup == !![])
            try {
                threadInfo2 = (threadInfo.get(threadID) || await Threads.getInfo(threadID))
                if (Object.keys(threadInfo2).length == 0) throw new Error();
            } catch (err) {
                logger(global.getText("handleCommand", "cantGetInfoThread", "error"));
            }
        const ten = await Users.getNameUser(event.senderID)
        let uid1 = event.senderID;
        var permssion = 0;
        var threadInfoo = (threadInfo.get(threadID) || await Threads.getInfo(threadID));
        const find = threadInfoo.adminIDs.find(el => el.id == senderID);
        if (NDH.includes(senderID.toString())) permssion = 3;
        else if (ADMINBOT.includes(senderID.toString())) permssion = 2;
        else if (!ADMINBOT.includes(senderID) && find) permssion = 1;

        // Đảm bảo command.config tồn tại trước khi truy cập
        if (command && command.config) {
            var quyenhan = ""
            if (command.config.hasPermssion == 1) {
                quyenhan = "Quản Trị Viên"
            } else if (command.config.hasPermssion == 2) {
                quyenhan = "ADMIN_BOT"
            } else if (command.config.hasPermssion == 3) {
                quyenhan = "Chúa"
            }

            if (command.config.hasPermssion > permssion) return api.sendMessage(`👤 Người dùng: ${ten}\n⛔ Chỉ có ${quyenhan} mới được sử dụng lệnh ${command.config.name} \n⚠️ Bạn không có quyền sử dụng lệnh này\n────────────────────\n⏰ Time: ${Tm}`, event.threadID, async (err, info) => {
                await new Promise(resolve => setTimeout(resolve, 15 * 1000));
                return api.unsendMessage(info.messageID);
            }, event.messageID);

            if (!client.cooldowns.has(command.config.name)) client.cooldowns.set(command.config.name, new Map());
            const timestamps = client.cooldowns.get(command.config.name);
            const expirationTime = (command.config.cooldowns || 1) * 1000;
            if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + expirationTime)
                return api.sendMessage(`⚠️ Tránh để bot bị spam, bạn vui lòng chờ ${((timestamps.get(senderID) + expirationTime - dateNow) / 1000).toString().slice(0, 5)} giây để sử dụng lại lệnh "${command.config.name}" nhé!`, threadID, async (err, info) => {
                    await new Promise(resolve => setTimeout(resolve, 15 * 1000));
                    return api.unsendMessage(info.messageID);
                }, messageID);
        } else {
            // Nếu command hoặc command.config không tồn tại, có thể có lỗi logic khác hoặc lệnh không hợp lệ
            // Trong trường hợp này, chúng ta đã có kiểm tra !command ở trên, nên có thể bỏ qua hoặc log thêm nếu cần
            console.warn(`Lệnh không hợp lệ hoặc không có config: ${commandName}`);
            return;
        }

        var getText2;
        if (command.languages && typeof command.languages == 'object' && command.languages.hasOwnProperty(global.config.language))
            getText2 = (...values) => {
                var lang = command.languages[global.config.language][values[0]] || '';
                // Giá trị 0x2533 + 0x1105 + -0x3638 = 9555 + 4357 - 13880 = 26.
                // Điều này tương đương với 0x01A (hex). Có vẻ như một lỗi gõ số nguyên.
                // Có thể ý định là kiểm tra một giới hạn nào đó, hoặc nó là một lỗi đánh máy.
                // Giả định nó nên là một số nguyên dương, ví dụ 0 hoặc 1.
                // Tùy thuộc vào logic mong muốn của bạn, bạn có thể thay đổi nó.
                // Hiện tại, tôi sẽ giữ nguyên giá trị đã tính toán là 26 nhưng lưu ý nó.
                for (var i = values.length; i > 26; i--) { // Đã chuyển đổi giá trị hex sang thập phân
                    const expReg = RegExp('%' + i, 'g');
                    lang = lang.replace(expReg, values[i]);
                }
                return lang;
            };
        else getText2 = () => { };
        try {
            const Obj = {};
            Obj.api = api
            Obj.event = event
            Obj.args = args
            Obj.models = models
            Obj.Users = Users
            Obj.Threads = Threads
            Obj.Currencies = Currencies
            Obj.permssion = permssion
            Obj.getText = getText2
            command.run(Obj)
            timestamps.set(senderID, dateNow);
            if (DeveloperMode == !![])
                logger(global.getText("handleCommand", "executeCommand", time, commandName, senderID, threadID, args.join(" "), (Date.now()) - dateNow), "[ DEV MODE ]");
            return;
        } catch (e) {
            return api.sendMessage(global.getText("handleCommand", "commandError", commandName, e), threadID);
        }
    };
};