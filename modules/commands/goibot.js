const fs = require('fs');
const path = require('path');
const { simi } = require('./../../lib/sim.js');
const statusFilePath = path.join(__dirname, 'data', 'goibot.json');

function readStatus() {
    if (!fs.existsSync(statusFilePath)) {
        return {};
    }
    const data = fs.readFileSync(statusFilePath);
    return JSON.parse(data);
}

function writeStatus(status) {
    fs.writeFileSync(statusFilePath, JSON.stringify(status, null, 4));
}

module.exports.config = {
    name: 'bot',
    version: '1.1.1',
    hasPermssion: 1,
    credits: 'Gojo',
    description: 'Trò truyện cùng bot chat',
    commandCategory: 'Người dùng',
    usages: '[dùng /goibot on/off để bật/tắt module]',
    cooldowns: 2,
};

module.exports.run = ({ event, api, args }) => {
    const threadID = event.threadID;
    const status = readStatus();

    if (args[0] === 'on') {
        status[threadID] = true;
        api.sendMessage('Gọi bot đã được bật cho nhóm này.', threadID);
    } else if (args[0] === 'off') {
        status[threadID] = false;
        api.sendMessage('Gọi bot đã được tắt cho nhóm này.', threadID);
    }

    writeStatus(status);
};

module.exports.handleEvent = async function({ api, event }) {
    const threadID = event.threadID;
    const status = readStatus();
    if (!status[threadID]) return;

    if (event.body && event.body.toLowerCase().includes('bot')) {
        try {
            const response = await simi('ask', event.body);
            if (response.error) {
                api.sendMessage('Hong hỉu :)).', threadID);
                return;
            }
            
            api.sendMessage(
                { body: response.answer },
                event.threadID,
                (err, data) => {
                    if (err) return console.error(err);
                    global.client.handleReply.push({
                        name: this.config.name,
                        messageID: data.messageID
                    });
                },
                event.messageID
            );
        } catch (error) {
            console.error(error);
            api.sendMessage('Hong hỉu :)).', threadID);
        }
    }
};

module.exports.handleReply = async function({ handleReply: $, api, event }) {
    const threadID = event.threadID;
    const status = readStatus();
    if (!status[threadID]) return;

    try {
        const response = await simi('ask', event.body);
        if (response.error) {
            api.sendMessage('Hong hỉu :)).', threadID);
            return;
        }

        api.sendMessage(
            { body: response.answer },
            event.threadID,
            (err, data) => {
                if (err) return console.error(err);
                global.client.handleReply.push({
                    name: this.config.name,
                    messageID: data.messageID
                });
            },
            event.messageID
        );
    } catch (error) {
        console.error(error);
        api.sendMessage('Chẹo', event.threadID, (err, data) => {
            if (err) return console.error(err);
            global.client.handleReply.push({
                name: this.config.name,
                messageID: data.messageID
            });
        }, event.messageID);
    }
};