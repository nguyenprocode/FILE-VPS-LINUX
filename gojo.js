//========= Yêu cầu tất cả các biến cần sử dụng =========//
/////////////////////////////////////////////////////
const moment = require("moment-timezone");
const { readdirSync, readFileSync, writeFileSync, existsSync, unlinkSync, rm } = require("fs-extra");
const { join, resolve } = require("path");
const chalk = require("chalk");
const { execSync } = require('child_process');
const logger = require("./utils/log.js");
const login = require('./gojo/hzi');
const axios = require("axios");
const listPackage = JSON.parse(readFileSync('./package.json')).dependencies;
const listbuiltinModules = require("module").builtinModules;
const os = require('os');

/**
 * Lấy thông tin sử dụng bộ nhớ của tiến trình và hệ thống.
 * @returns {object} Thông tin về RAM và Heap đã sử dụng/tổng cộng.
 */
function getMemoryInfo() {
    const memory = process.memoryUsage();
    const totalRAM = os.totalmem();
    const freeRAM = os.freemem();
    const usedRAM = totalRAM - freeRAM;

    return {
        ram: {
            used: Math.round(usedRAM / 1024 / 1024),
            total: Math.round(totalRAM / 1024 / 1024),
        },
        heap: {
            used: Math.round(memory.heapUsed / 1024 / 1024),
            total: Math.round(memory.heapTotal / 1024 / 1024)
        }
    };
}

global.client = new Object({
    commands: new Map(),
    events: new Map(),
    cooldowns: new Map(),
    eventRegistered: new Array(),
    handleSchedule: new Array(),
    handleReaction: new Array(),
    handleReply: new Array(),
    mainPath: process.cwd(),
    configPath: new String(),
    /**
     * Lấy thời gian hiện tại theo múi giờ Châu Á/Hồ Chí Minh.
     * @param {string} option Tùy chọn định dạng thời gian.
     * @returns {string} Thời gian được định dạng.
     */
    getTime: function (option) {
        switch (option) {
            case "seconds":
                return `${moment.tz("Asia/Ho_Chi_minh").format("ss")}`;
            case "minutes":
                return `${moment.tz("Asia/Ho_Chi_minh").format("mm")}`;
            case "hours":
                return `${moment.tz("Asia/Ho_Chi_minh").format("HH")}`;
            case "date": 
                return `${moment.tz("Asia/Ho_Chi_minh").format("DD")}`;
            case "month":
                return `${moment.tz("Asia/Ho_Chi_minh").format("MM")}`;
            case "year":
                return `${moment.tz("Asia/Ho_Chi_minh").format("YYYY")}`;
            case "fullHour":
                return `${moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss")}`;
            case "fullYear":
                return `${moment.tz("Asia/Ho_Chi_minh").format("DD/MM/YYYY")}`;
            case "fullTime":
                return `${moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss DD/MM/YYYY")}`;
        }
    }
});

global.data = new Object({
    threadInfo: new Map(),
    threadData: new Map(),
    userName: new Map(),
    userBanned: new Map(),
    threadBanned: new Map(),
    commandBanned: new Map(),
    threadAllowNSFW: new Array(),
    allUserID: new Array(),
    allCurrenciesID: new Array(),
    allThreadID: new Array()
});

global.utils = require("./utils");
global.nodemodule = new Object();
global.config = new Object();
global.configModule = new Object();
global.moduleData = new Array();
global.language = new Object();
global.anti = resolve(process.cwd(),'anti.json');

---

//////////////////////////////////////////////////////////
//========= Tìm và get dữ liệu trong Config =========//
/////////////////////////////////////////////////////////
var configValue;
try {
    global.client.configPath = join(global.client.mainPath, "config.json");
    configValue = require(global.client.configPath);
}
catch {
    if (existsSync(global.client.configPath.replace(/\.json/g,"") + ".temp")) {
        configValue = readFileSync(global.client.configPath.replace(/\.json/g,"") + ".temp");
        configValue = JSON.parse(configValue);
        logger.loader(`Found: ${global.client.configPath.replace(/\.json/g,"") + ".temp"}`);
    }
    else return logger.loader("config.json Đâu Mất Rồi Bro=))?", "error");
}

try {
    for (const key in configValue) global.config[key] = configValue[key];
    logger.loader("Config Done");
}
catch { return logger.loader("Can't load file config!", "error") }

const { Sequelize, sequelize } = require("./gojo/database");

writeFileSync(global.client.configPath + ".temp", JSON.stringify(global.config, null, 4), 'utf8');

---

/////////////////////////////////////////
//========= Tải ngôn ngữ sử dụng =========//
/////////////////////////////////////////

const langFile = (readFileSync(`${__dirname}/languages/${global.config.language || "en"}.lang`, { encoding: 'utf-8' })).split(/\r?\n|\r/);
const langData = langFile.filter(item => item.indexOf('#') != 0 && item != '');
for (const item of langData) {
    const getSeparator = item.indexOf('=');
    const itemKey = item.slice(0, getSeparator);
    const itemValue = item.slice(getSeparator + 1, item.length);
    const head = itemKey.slice(0, itemKey.indexOf('.'));
    const key = itemKey.replace(head + '.', '');
    const value = itemValue.replace(/\\n/gi, '\n');
    if (typeof global.language[head] == "undefined") global.language[head] = new Object();
    global.language[head][key] = value;
}

/**
 * Lấy văn bản từ file ngôn ngữ.
 * @param {string} head - Tên module hoặc danh mục.
 * @param {string} key - Khóa văn bản.
 * @param {...any} args - Các đối số để thay thế trong văn bản.
 * @returns {string} Văn bản đã được dịch.
 */
global.getText = function (...args) {
    const langText = global.language;     
    if (!langText.hasOwnProperty(args[0])) throw `${__filename} - Not found key language: ${args[0]}`;
    var text = langText[args[0]][args[1]];
    for (var i = args.length - 1; i > 0; i--) {
        const regEx = RegExp(`%${i}`, 'g');
        text = text.replace(regEx, args[i + 1]);
    }
    return text;
}

try {
    var appStateFile = resolve(join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"));
    var appState = require(appStateFile);
    logger.loader(global.getText("mirai", "foundPathAppstate"))
}
catch { return logger.loader(global.getText("mirai", "notFoundPathAppstate"), "error") }
console.log(chalk.bold.hex("#FFFF00").bold("[ GOJO ]"));

---

////////////////////////////////////////////////////////////
//== Đăng nhập tài khoản và bắt đầu lắng nghe sự kiện ====//
////////////////////////////////////////////////////////////
function onBot({ models }) {
    const loginData = {};
    loginData['appState'] = appState;
    login(loginData, async(loginError, loginApiData) => {
        if (loginError) return logger(JSON.stringify(loginError), `ERROR`);
        
        // Giám sát bộ nhớ: Vẫn thu thập thông tin RAM nhưng không in ra console.
        setInterval(() => {
            const currentMem = getMemoryInfo();
            // Bạn có thể sử dụng `currentMem` ở đây cho các mục đích khác (ví dụ: ghi vào file log riêng, gửi cảnh báo)
            // nhưng sẽ không hiển thị trên console.
        }, 30000); // Giám sát mỗi 30 giây

        global.client.api = loginApiData;
        loginApiData.setOptions(global.config.FCAOption);
        writeFileSync(appStateFile, JSON.stringify(loginApiData.getAppState(), null, '\x09'));
        global.config.version = '1.2.15';
        global.client.timeStart = new Date().getTime();

        // Tải lệnh (commands)
        const listCommand = readdirSync(global.client.mainPath + '/modules/commands').filter(command => command.endsWith('.js') && !command.includes('example') && !global.config.commandDisabled.includes(command));
        for (const command of listCommand) {
            try {
                var module = require(global.client.mainPath + '/modules/commands/' + command);
                if (!module.config || !module.run || !module.config.commandCategory) throw new Error(global.getText('mirai', 'errorFormat'));
                if (global.client.commands.has(module.config.name || '')) throw new Error(global.getText('mirai', 'nameExist'));
                if (!module.languages || typeof module.languages != 'object' || Object.keys(module.languages).length == 0) {/* logger.loader(global.getText('mirai', 'notFoundLanguage', module.config.name), 'warn');*/ }
                if (module.config.dependencies && typeof module.config.dependencies == 'object') {
                    for (const reqDependencies in module.config.dependencies) {
                        const reqDependenciesPath = join(__dirname, 'nodemodules', 'node_modules', reqDependencies);
                        try {
                            if (!global.nodemodule.hasOwnProperty(reqDependencies)) {
                                if (listPackage.hasOwnProperty(reqDependencies) || listbuiltinModules.includes(reqDependencies)) global.nodemodule[reqDependencies] = require(reqDependencies);
                                else global.nodemodule[reqDependencies] = require(reqDependenciesPath);
                            } else '';
                        } catch {
                            var check = false;
                            var isError;
                            // logger.loader(global.getText('mirai', 'notFoundPackage', reqDependencies, module.config.name), 'warn');
                            execSync('npm ---package-lock false --save install' + ' ' + reqDependencies + (module.config.dependencies[reqDependencies] == '*' || module.config.dependencies[reqDependencies] == '' ? '' : '@' + module.config.dependencies[reqDependencies]), { 'stdio': 'inherit', 'env': process['env'], 'shell': true, 'cwd': join(__dirname, 'nodemodules') });
                            for (let i = 1; i <= 3; i++) {
                                try {
                                    require['cache'] = {};
                                    if (listPackage.hasOwnProperty(reqDependencies) || listbuiltinModules.includes(reqDependencies)) global['nodemodule'][reqDependencies] = require(reqDependencies);
                                    else global['nodemodule'][reqDependencies] = require(reqDependenciesPath);
                                    check = true;
                                    break;
                                } catch (error) { isError = error; }
                                if (check || !isError) break;
                            }
                            if (!check || isError) throw global.getText('mirai', 'cantInstallPackage', reqDependencies, module.config.name, isError);
                        }
                    }
                    // logger.loader(global.getText('mirai', 'loadedPackage', module.config.name));
                }
                if (module.config.envConfig) try {
                    for (const envConfig in module.config.envConfig) {
                        if (typeof global.configModule[module.config.name] == 'undefined') global.configModule[module.config.name] = {};
                        if (typeof global.config[module.config.name] == 'undefined') global.config[module.config.name] = {};
                        if (typeof global.config[module.config.name][envConfig] !== 'undefined') global['configModule'][module.config.name][envConfig] = global.config[module.config.name][envConfig];
                        else global.configModule[module.config.name][envConfig] = module.config.envConfig[envConfig] || '';
                        if (typeof global.config[module.config.name][envConfig] == 'undefined') global.config[module.config.name][envConfig] = module.config.envConfig[envConfig] || '';
                    }
                    // logger.loader(global.getText('mirai', 'loadedConfig', module.config.name));
                } catch (error) {
                    throw new Error(global.getText('mirai', 'loadedConfig', module.config.name, JSON.stringify(error)));
                }
                if (module.onLoad) {
                    try {
                        const moduleData = {};
                        moduleData.api = loginApiData;
                        moduleData.models = models;
                        module.onLoad(moduleData);
                    } catch (e) {
                        throw new Error(global.getText('mirai', 'cantOnload', module.config.name, JSON.stringify(e)), 'error');
                    };
                }
                if (module.handleEvent) global.client.eventRegistered.push(module.config.name);
                global.client.commands.set(module.config.name, module);
                // logger.loader(global.getText('mirai', 'successLoadModule', module.config.name));
            } catch (error) {
                // logger.loader(global.getText('mirai', 'failLoadModule', command, error), 'error');
            };
        }

        // Tải sự kiện (events)
        const events = readdirSync(global.client.mainPath + '/modules/events').filter(event => event.endsWith('.js') && !global.config.eventDisabled.includes(event));
        for (const ev of events) {
            try {
                var event = require(global.client.mainPath + '/modules/events/' + ev);
                if (!event.config || !event.run) throw new Error(global.getText('mirai', 'errorFormat'));
                if (global.client.events.has(event.config.name) || '') throw new Error(global.getText('mirai', 'nameExist'));
                if (event.config.dependencies && typeof event.config.dependencies == 'object') {
                    for (const dependency in event.config.dependencies) {
                        const _0x21abed = join(__dirname, 'nodemodules', 'node_modules', dependency);
                        try {
                            if (!global.nodemodule.hasOwnProperty(dependency)) {
                                if (listPackage.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency)) global.nodemodule[dependency] = require(dependency);
                                else global.nodemodule[dependency] = require(_0x21abed);
                            } else '';
                        } catch {
                            let check = false;
                            let isError;
                            // logger.loader(global.getText('mirai', 'notFoundPackage', dependency, event.config.name), 'warn');
                            execSync('npm --package-lock false --save install' + dependency + (event.config.dependencies[dependency] == '*' || event.config.dependencies[dependency] == '' ? '' : '@' + event.config.dependencies[dependency]), { 'stdio': 'inherit', 'env': process['env'], 'shell': true, 'cwd': join(__dirname, 'nodemodules') });
                            for (let i = 1; i <= 3; i++) {
                                try {
                                    require['cache'] = {};
                                    if (global.nodemodule.hasOwnProperty(dependency) || listbuiltinModules.includes(dependency) || listPackage.hasOwnProperty(dependency)) {
                                        global.nodemodule[dependency] = require(dependency);
                                    } else {
                                        global.nodemodule[dependency] = require(_0x21abed);
                                    }
                                    check = true;
                                    break;
                                } catch (error) { isError = error; }
                                if (check || !isError) break;
                            }
                            if (!check || isError) throw global.getText('mirai', 'cantInstallPackage', dependency, event.config.name);
                        }
                    }
                    // logger.loader(global.getText('mirai', 'loadedPackage', event.config.name));
                }
                if (event.config.envConfig) try {
                    for (const _0x5beea0 in event.config.envConfig) {
                        if (typeof global.configModule[event.config.name] == 'undefined') global.configModule[event.config.name] = {};
                        if (typeof global.config[event.config.name] == 'undefined') global.config[event.config.name] = {};
                        if (typeof global.config[event.config.name][_0x5beea0] !== 'undefined') global.configModule[event.config.name][_0x5beea0] = global.config[event.config.name][_0x5beea0];
                        else global.configModule[event.config.name][_0x5beea0] = event.config.envConfig[_0x5beea0] || '';
                        if (typeof global.config[event.config.name][_0x5beea0] == 'undefined') global.config[event.config.name][_0x5beea0] = event.config.envConfig[_0x5beea0] || '';
                    }
                    // logger.loader(global.getText('mirai', 'loadedConfig', event.config.name));
                } catch (error) {
                    throw new Error(global.getText('mirai', 'loadedConfig', event.config.name, JSON.stringify(error)));
                }
                if (event.onLoad) try {
                    const eventData = {};
                    eventData.api = loginApiData, eventData.models = models;
                    event.onLoad(eventData);
                } catch (error) {
                    throw new Error(global.getText('mirai', 'cantOnload', event.config.name, JSON.stringify(error)), 'error');
                }
                global.client.events.set(event.config.name, event);
                // logger.loader(global.getText('mirai', 'successLoadModule', event.config.name));
            } catch (error) {
                // logger.loader(global.getText('mirai', 'failLoadModule', ev, error), 'error');
            }
        }
        
        logger.loader(global.getText('mirai', 'finishLoadModule', global.client.commands.size, global.client.events.size)); 

        writeFileSync(global.client['configPath'], JSON['stringify'](global.config, null, 4), 'utf8'); 
        try {
            // Xóa file .temp cấu hình
            await rm(global['client']['configPath'] + '.temp', { force: true });
        } catch (e) {
            logger(`Failed to remove temp config file: ${e.message}`, 'warn');
        }
        
        const listenerData = {};
        listenerData.api = loginApiData; 
        listenerData.models = models;
        const listener = require('./gojo/listen')(listenerData);
        
        /**
         * Hàm làm mới token fb_dtsg.
         */
        async function refreshFb_dtsg() {
            try {
                if (loginApiData && typeof loginApiData.refreshFb_dtsg === 'function') {
                    await loginApiData.refreshFb_dtsg();
                    console.log('Reset fb_dtsg thành công!');
                } else {
                    logger("error", "loginApiData hoặc hàm refreshFb_dtsg không khả dụng.");
                }
            } catch (err) {
                logger("error", `Đã xảy ra lỗi khi làm mới fb_dtsg: ${err.message}`);
            }
        }

        // Tự động làm mới fb_dtsg mỗi giờ (3600000 ms)
        setInterval(refreshFb_dtsg, 3600000); 

        /**
         * Callback lắng nghe sự kiện từ API.
         * @param {Error} error - Đối tượng lỗi nếu có.
         * @param {object} message - Đối tượng tin nhắn/sự kiện.
         */
        function listenerCallback(error, message) {
            if (error) {
                logger(global.getText('mirai', 'handleListenError', JSON.stringify(error)), 'error');
                // Nếu lỗi là do đăng xuất, thoát tiến trình để process manager khởi động lại.
                if (error.error === 'Not logged in.') {
                    logger("Bot đã đăng xuất, đang cố gắng khởi động lại...", "CRITICAL ERROR");
                    process.exit(1); 
                }
                return;
            }
            // Bỏ qua các loại sự kiện không liên quan đến tin nhắn
            if (['presence', 'typ', 'read_receipt'].some(data => data == message.type)) return;
            return listener(message);
        };

        global.handleListen = loginApiData.listenMqtt(listenerCallback);
        global.client.api = loginApiData;

    });
}

---

//////////////////////////////////////////////
//========= Kết nối đến  Database =========//
//////////////////////////////////////////////

(async() => {
    try {
        await sequelize.authenticate();
        const authentication = {};
        authentication.Sequelize = Sequelize;
        authentication.sequelize = sequelize;
        const models = require('./gojo/database/model')(authentication);

        const botData = {};
        botData.models = models;
        onBot(botData);
    }
    catch (error) { logger(global.getText('mirai', 'successConnectDatabase', JSON.stringify(error)), '[ RYO ] '); }

})()

// Xử lý lỗi toàn cục để bắt các lỗi không được xử lý
process.on('unhandledRejection', (reason, p) => {
    console.error("Unhandled Rejection at:", p, "reason:", reason);
    logger(`Unhandled Rejection: ${reason.stack || reason}`, "UNHANDLED REJECTION");
    // Trong môi trường production, bạn có thể cân nhắc `process.exit(1)` ở đây
    // để đảm bảo bot được khởi động lại sạch sẽ bởi process manager.
});

process.on('uncaughtException', err => { 
    console.error("Uncaught Exception:", err);
    logger(`Uncaught Exception: ${err.stack || err}`, "UNCAUGHT EXCEPTION");
    // Lỗi nghiêm trọng, cần thoát và khởi động lại.
    process.exit(1); 
});
