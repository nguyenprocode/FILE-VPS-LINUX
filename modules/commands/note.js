const axios = require('axios');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

module.exports = {
  config: {
    name: 'note',
    version: '0.0.1',
    hasPermssion: 3,
    credits: 'DC-Nam',
    description: 'Ghi chú',
    commandCategory: 'Admin',
    usages: '[]',
    usePrefix: true,
    images: [],
    cooldowns: 3,
  },

  run: async function(o) {
    const name = module.exports.config.name;
    const url = o.event?.messageReply?.args?.[0] || o.args[1];
    const path = `${__dirname}/${o.args[0]}`;
    const send = msg => new Promise(r => o.api.sendMessage(msg, o.event.threadID, (err, res) => r(res), o.event.messageID));

    try {
      if (/^https:\/\//.test(url)) {
        return send(`🔗 Tệp: ${path}\n\nThả cảm xúc vào tin nhắn này để xác nhận thay thế nội dung tệp`).then(res => {
          res = { ...res, name, path, o, url, action: 'confirm_replace_content' };
          global.client.handleReaction.push(res);
        });
      } else {
        if (!fs.existsSync(path)) return send(`❎ Đường dẫn tệp không tồn tại`);

        const content = fs.readFileSync(path, 'utf8');
        const response = await axios.post('https://vitieubao.click/upload', { content });
        const { edit, raw } = response.data;

        return send(`📝 Edit: ${edit}\n\n✏️ Raw: ${raw}\n────────────────\n📁 File: ${path}\n\n📌 Thả cảm xúc vào tin nhắn này để tải mã lên`).then(res => {
          res = { ...res, name, path, o, url: raw, action: 'confirm_upload' };
          global.client.handleReaction.push(res);
        });
      }
    } catch (e) {
      console.error(e);
      send(`Lỗi: ${e.message}`);
    }
  },

  handleReaction: async function(o) {
    const _ = o.handleReaction;
    const send = msg => new Promise(r => o.api.sendMessage(msg, o.event.threadID, (err, res) => r(res), o.event.messageID));

    try {
      if (o.event.userID != _.o.event.senderID) return;

      switch (_.action) {
        case 'confirm_replace_content':
        case 'confirm_upload':
          const content = (await axios.get(_.url, { responseType: 'text' })).data;
          fs.writeFileSync(_.path, content);
          send(`✅ Nội dung đã được thay thế thành công\n\n🔗 Tệp: ${_.path}`).then(res => {
            res = { ..._, ...res };
            global.client.handleReaction.push(res);
          });
          break;
        default:
          break;
      }
    } catch (e) {
      console.error(e);
      send(`Lỗi: ${e.message}`);
    }
  }
};
