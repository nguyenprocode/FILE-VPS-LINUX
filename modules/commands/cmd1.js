const { execSync } = require('child_process');
const { writeFileSync, unlinkSync, readFileSync, readdirSync } = require('fs-extra');
const { join } = require('path');

module.exports.config = {
    name: "cmd",
    version: "1.2.7",
    hasPermssion: 3,
    credits: "Mirai Team",
    description: "Quản lý/Kiểm soát toàn bộ module của bot",
    commandCategory: "Admin",
    usages: "[load/unload/loadAll/unloadAll] [tên module]",
    cooldowns: 5,
    dependencies: {
        "fs-extra": "",
        "child_process": "",
        "path": ""
    }
};

module.exports.run = async function ({ event, args, api }) {
    const { configPath, mainPath } = global.client;
    const logger = require(mainPath + "/utils/log");
    const { threadID, messageID } = event;
    var moduleList = args.splice(1, args.length);

    const loadModule = async (nameModule, configValue) => {
        try {
            const dirModule = __dirname + `/${nameModule}.js`;
            delete require.cache[require.resolve(dirModule)];
            const command = require(dirModule);
            
            // Remove existing event handlers
            if (command.config.name) {
                const index = global.client.eventRegistered.indexOf(command.config.name);
                if (index > -1) {
                    global.client.eventRegistered.splice(index, 1);
                }
            }
            
            global.client.commands.delete(nameModule);
            
            if (!command.config || !command.run || !command.config.commandCategory) {
                throw new Error("Module không đúng định dạng!");
            }
            
            global.client.commands.set(command.config.name, command);
            
            // Config management
            if (command.config.envConfig) {
                for (const [key, value] of Object.entries(command.config.envConfig)) {
                    if (typeof global.configModule[command.config.name] === "undefined") {
                        global.configModule[command.config.name] = {};
                    }
                    if (typeof configValue[command.config.name] === "undefined") {
                        configValue[command.config.name] = {};
                    }
                    global.configModule[command.config.name][key] = global.configModule[command.config.name][key] ?? value;
                    configValue[command.config.name][key] = configValue[command.config.name][key] ?? value;
                }
            }
            
            // Register event handler only once
            if (command.handleEvent && !global.client.eventRegistered.includes(command.config.name)) {
                global.client.eventRegistered.push(command.config.name);
            }
            
            // Execute onLoad if present
            if (command.onLoad) {
                await command.onLoad({ configValue });
            }
            
            return { success: true, command };
        } catch (error) {
            return { success: false, error };
        }
    };

    switch (args[0]) {
        case "load": {
            if (moduleList.length == 0) return api.sendMessage("Tên module không được để trống!", threadID, messageID);

            delete require.cache[require.resolve(configPath)];
            var configValue = require(configPath);
            writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 2), 'utf8');

            const currentCommands = new Set(global.client.commands.keys());
            const errorList = [], loadedList = [], commandGroups = {}, newCommands = [];

            for (const nameModule of moduleList) {
                const result = await loadModule(nameModule, configValue);
                if (result.success) {
                    const command = result.command;
                    loadedList.push(command.config.name);

                    global.config["commandDisabled"] = global.config["commandDisabled"].filter(item => item !== `${nameModule}.js`);
                    configValue["commandDisabled"] = configValue["commandDisabled"].filter(item => item !== `${nameModule}.js`);

                    const category = command.config.commandCategory.toLowerCase();
                    if (!commandGroups[category]) commandGroups[category] = [];
                    commandGroups[category].push(command.config.name);

                    if (!currentCommands.has(command.config.name)) newCommands.push(command.config.name);

                    logger.loader(`Loaded command ${command.config.name}!`);
                } else {
                    errorList.push({ name: nameModule, error: result.error });
                    console.log(`Không thể load module ${nameModule} với lỗi:`);
                    console.error(result.error);
                }
            }

            if (errorList.length > 0) {
                api.sendMessage(`Không thể load ${errorList.length} module`, threadID, messageID);
                let msg = "Các module bị lỗi:";
                errorList.forEach(({ name, error }) => {
                    msg += `\n - ${name}: ${error.message || "Không xác định được lỗi"}`;
                });
                api.sendMessage(msg, threadID, messageID);
            }

            if (loadedList.length > 0) {
                let loadedMessage = `✅ Load thành công ${loadedList.length} lệnh\n\n`;

                for (const [category, commands] of Object.entries(commandGroups)) {
                    loadedMessage += `📁 ${category.charAt(0).toUpperCase() + category.slice(1)}:\n`;
                    loadedMessage += commands.map(cmd => `   ➣ ${cmd}`).join('\n');
                    loadedMessage += '\n\n';
                }

                if (newCommands.length > 0) {
                    loadedMessage += `📥 Lệnh mới được thêm vào: ${newCommands.join(', ')}\n\n`;
                }

                loadedMessage += `━━━━━━━━━━━━━━━━\n`;

                api.sendMessage(loadedMessage, threadID, messageID);
            }

            writeFileSync(configPath, JSON.stringify(configValue, null, 4), 'utf8');
            unlinkSync(configPath + ".temp");
            break;
        }
        case "unload": {
            if (moduleList.length == 0) return api.sendMessage("Tên module không được để trống!", threadID, messageID);
            var configValue = require(configPath);
            writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 4), 'utf8');
            for (const nameModule of moduleList) {
                global.client.commands.delete(nameModule);
                global.client.eventRegistered = global.client.eventRegistered.filter(item => item !== nameModule);
                configValue["commandDisabled"].push(`${nameModule}.js`);
                global.config["commandDisabled"].push(`${nameModule}.js`);
                logger(`Unloaded command ${nameModule}!`);
            }
            writeFileSync(configPath, JSON.stringify(configValue, null, 4), 'utf8');
            unlinkSync(configPath + ".temp");
            return api.sendMessage(`Đã hủy tải thành công ${moduleList.length} module.`, threadID, messageID);
        }
        case "loadAll": {
            moduleList = readdirSync(__dirname).filter((file) => file.endsWith(".js") && !file.includes('example') && !file.includes("command"));
            moduleList = moduleList.map(item => item.replace(/\.js/g, ""));

            delete require.cache[require.resolve(configPath)];
            var configValue = require(configPath);
            writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 2), 'utf8');

            const currentCommands = new Set(global.client.commands.keys());
            const errorList = [], loadedList = [], commandGroups = {}, newCommands = [];

            for (const nameModule of moduleList) {
                const result = await loadModule(nameModule, configValue);
                if (result.success) {
                    const command = result.command;
                    loadedList.push(command.config.name);

                    global.config["commandDisabled"] = global.config["commandDisabled"].filter(item => item !== `${nameModule}.js`);
                    configValue["commandDisabled"] = configValue["commandDisabled"].filter(item => item !== `${nameModule}.js`);

                    const category = command.config.commandCategory.toLowerCase();
                    if (!commandGroups[category]) commandGroups[category] = [];
                    commandGroups[category].push(command.config.name);

                    if (!currentCommands.has(command.config.name)) newCommands.push(command.config.name);

                    logger.loader(`Loaded command ${command.config.name}!`);
                } else {
                    errorList.push({ name: nameModule, error: result.error });
                    console.log(`Không thể load module ${nameModule} với lỗi:`);
                    console.error(result.error);
                }
            }

            if (errorList.length > 0) {
                api.sendMessage(`Không thể load ${errorList.length} module`, threadID, messageID);
                let msg = "Các module bị lỗi:";
                errorList.forEach(({ name, error }) => {
                    msg += `\n - ${name}: ${error.message || "Không xác định được lỗi"}`;
                });
                api.sendMessage(msg, threadID, messageID);
            }

            if (loadedList.length > 0) {
                let loadedMessage = `✅ Load thành công ${loadedList.length} lệnh\n\n`;

                for (const [category, commands] of Object.entries(commandGroups)) {
                    loadedMessage += `📁 ${category.charAt(0).toUpperCase() + category.slice(1)}:\n`;
                    loadedMessage += commands.map(cmd => `   ➣ ${cmd}`).join('\n');
                    loadedMessage += '\n\n';
                }

                if (newCommands.length > 0) {
                    loadedMessage += `📥 Lệnh mới được thêm vào: ${newCommands.join(', ')}\n\n`;
                }

                loadedMessage += `━━━━━━━━━━━━━━━━\n`;

                api.sendMessage(loadedMessage, threadID, messageID);
            }

            writeFileSync(configPath, JSON.stringify(configValue, null, 4), 'utf8');
            unlinkSync(configPath + ".temp");
            break;
        }
        case "unloadAll": {
            moduleList = readdirSync(__dirname).filter((file) => file.endsWith(".js") && !file.includes('example') && !file.includes("command"));
            moduleList = moduleList.map(item => item.replace(/\.js/g, ""));
            var configValue = require(configPath);
            writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 4), 'utf8');
            for (const nameModule of moduleList) {
                global.client.commands.delete(nameModule);
                global.client.eventRegistered = global.client.eventRegistered.filter(item => item !== nameModule);
                configValue["commandDisabled"].push(`${nameModule}.js`);
                global.config["commandDisabled"].push(`${nameModule}.js`);
                logger(`Unloaded command ${nameModule}!`);
            }
            writeFileSync(configPath, JSON.stringify(configValue, null, 4), 'utf8');
            unlinkSync(configPath + ".temp");
            return api.sendMessage(`Đã hủy tải thành công ${moduleList.length} module.`, threadID, messageID);
        }
        default:
            return api.sendMessage("Lựa chọn không hợp lệ!", threadID, messageID);
    }
};