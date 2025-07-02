const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
  name: "tiktok",
  version: "1.0.0",
  hasPermission: 0,
  credits: "Kz Khánhh",
  description: "Tải video tiktok",
  commandCategory: "Tiện ích",
  usage: "searchtt + từ khóa tìm kiếm, ví dụ: .searchtt buồn",
  cooldowns: 5
};


const roof = n => +n != +Math.floor(n) ? +Math.floor(n) + 1 : +n;
const localeStr = n => ((+n).toLocaleString()).replace(/,/g, '.');
const { get } = require('axios');
const{
    createReadStream,
    mkdirSync,
    rmdirSync,
    unlinkSync
} = require('fs-extra');
const{
    image
} = require('image-downloader');

module.exports.handleReply = async ({ api, event, handleReply }) => {
    const $ = handleReply;
    if ($.case == 'runListUserPost') {
        if (['list'].includes(event.args[0])) {
            if (event.args[1] > roof($.data.length / 6) || event.args[1] < 1 || isNaN(event.args[1])) return api.sendMessage(`𝗧𝗿𝗮𝗻𝗴 ${event.args[1]} 𝗸𝗵𝗼̂𝗻𝗴 𝗻𝗮̆̀𝗺 𝘁𝗿𝗼𝗻𝗴 𝗱𝗮𝗻𝗵 𝘀𝗮́𝗰𝗵!`, event.threadID, event.messageID); else return runListUserPost(api, event, $.data, 6, +event.args[1], $.type, $.author);
        } else return api.sendMessage({ body: $.type ? infoVideoUserPost($.data[event.args[0] - 1]) : infoMusicUserPost($.data[event.args[0] - 1].music_info), attachment: await downStreamURL($.data[event.args[0] - 1][$.type ? 'play' : 'music'], __dirname + `/cache/${event.messageID}.${$.type ? 'mp4' : 'mp3'}`) }, event.threadID, () => unlinkSync(__dirname + `/cache/${event.messageID}.${$.type ? 'mp4' : 'mp3'}`), event.messageID);
    };
    const { threadID, messageID, body } = event;
    if (handleReply.author != event.senderID || !body) return;
    let args = body.split(' ');
    switch (handleReply.type) {
        case 'search':
            if (isNaN(body)) return;
            const { videoInfo } = handleReply;
            const index = parseInt(body) - 1;
            if (index < 0 || index >= videoInfo.length) return api.sendMessage("𝗦𝗼̂́ 𝘁𝘂̛́ 𝘁𝘂̣ 𝗸𝗵𝗼̂𝗻𝗴 𝗵𝗼̛̣𝗽 𝗹𝗲̂", threadID, messageID);
            api.setMessageReaction("⌛", event.messageID, () => { }, true);
            api.unsendMessage(handleReply.messageID);

            const { digg_count, comment_count, play_count, share_count, download_count, duration, region, title, nickname, unique_id } = videoInfo[index];
            axios.get(videoInfo[index].nowatermark, { responseType: "stream" }).then(res => {
                res.data.pipe(fs.createWriteStream(__dirname + "/cache/tiktok.mp4"));
                res.data.on("end", () => {
                    api.setMessageReaction("✅", event.messageID, () => { }, true);
                    api.sendMessage({ body: `
====== [ 𝐓𝐈𝐊𝐓𝐎𝐊 ] ====
➣ 𝘘𝘶𝘰̂́𝘤 𝘨𝘪𝘢: ${region}
➣ 𝘛𝘪𝘵𝘭𝘦: ${title}
➣ 𝘒𝘦̂𝘯𝘩: ${nickname}
➣ 𝘐𝘋 𝘯𝘨𝘶̛𝘰̛̀𝘪 𝘥𝘶̀𝘯𝘨: ${unique_id}
➣ 𝘓𝘶̛𝘰̛̣𝘵 𝘵𝘪𝘮: ${digg_count}
➣ 𝘛𝘰̂̉𝘯𝘨 𝘣𝘪̀𝘯𝘩 𝘭𝘶𝘢̣̂𝘯: ${comment_count}
➣ 𝘓𝘶̛𝘰̛̣𝘵 𝘹𝘦𝘮: ${play_count}
➣ 𝘓𝘶̛𝘰̛̣𝘵 𝘤𝘩𝘪𝘢 𝘴𝘦̉: ${share_count}
➣ 𝘓𝘶̛𝘰̛̣𝘵 𝘵𝘢̉𝘪: ${download_count}
➣ 𝘛𝘪𝘮𝘦: ${duration} giây`, attachment: fs.createReadStream(__dirname + "/cache/tiktok.mp4") }, threadID, () => fs.unlinkSync(__dirname + "/cache/tiktok.mp4"), messageID);
                });
            }).catch(err => console.log(err));
            break;
    }
};

module.exports.run = async ({ api, event, args }) => {
    api.setMessageReaction("⌛", event.messageID, () => { }, true);
    const search = args.join(" ");
    if (!search) return api.sendMessage("𝗕𝗮̣𝗻 𝗰𝗵𝘂̛𝗮 𝗻𝗵𝗮̣̂𝗽 𝘁𝘂̛̀ 𝗸𝗵𝗼́𝗮 𝘁𝗶̀𝗺 𝗸𝗶𝗲̂́𝗺", event.threadID);
    axios.get(`https://hoanghao.me/api/tiktok/search?keyword=${encodeURI(search)}`).then(async res => {
        const { videos: result } = res.data.data;
        if (result.length == 0) return api.sendMessage("𝗞𝗵𝗼̂𝗻𝗴 𝘁𝗶̀𝗺 𝘁𝗵𝗮̂́𝘆 𝗸𝗲̂́𝘁 𝗾𝘂𝗮̉ 𝗻𝗮̀𝗼", event.threadID);

        const lengthResult = result.length > 9 ? 9 : result.length;
        let videoInfo = [];
        let msg = `🔎 𝐻𝑒̣̂ 𝑡ℎ𝑜̂́𝑛𝑔 đ𝑎̃ 𝑡𝑖̀𝑚 𝑡ℎ𝑎̂́𝑦 ${lengthResult} 𝘬𝘦̂́𝘵 𝘲𝘶𝘢̉ 𝑝ℎ𝑢̀ ℎ𝑜̛̣𝑣𝑖 𝑏𝑎̣𝑛\n====================\n`;
        
        let nameATM = [], attachment = [];
        for (let i = 0; i < lengthResult; i++) {
            
            const { digg_count, comment_count, play_count, share_count, download_count, duration, region, title, play: nowatermark, origin_cover: cover } = result[i];
            const { nickname, unique_id } = result[i].author;
            let stream_ = await axios.get(encodeURI(cover), { responseType: 'arraybuffer' });
            const tempDir = __dirname + "/tikinfo" + Date.now() + ".png";
            fs.writeFileSync(tempDir, Buffer.from(stream_.data, 'utf8'));
            nameATM.push(tempDir);
            attachment.push(fs.createReadStream(tempDir));
            
            msg += `➣ Kết quả: ${i + 1}\n➣ Tác giả:${nickname}\n➣ Title: ${title}\n➣ 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻: ${duration} giây\n====================\n`;
            videoInfo.push({ digg_count, comment_count, play_count, share_count, download_count, region, nickname, title, nowatermark, cover, unique_id, duration });
        }
        api.setMessageReaction("✅", event.messageID, () => { }, true);
        msg += '\n\n😉 𝑃𝘩𝑎̉𝘯 𝘩𝑜̂̀𝘪 𝘵𝑖𝘯 𝘯ℎ𝘢̆́𝑛 𝑛𝘢̀𝑦 𝑡𝘩𝑒𝘰 𝘴𝑜̂́ 𝑡𝘩𝑢̛́ 𝑡𝘶̛̣ 𝘷𝑖𝘥𝑒𝘰 𝘤𝑎̂̀𝘯 𝘹𝑒𝘮';

        api.sendMessage({ body: msg, attachment }, event.threadID, (err, info) => {
            if (err) return console.log(err);
            nameATM.forEach(pa => fs.unlinkSync(pa));
            global.client.handleReply.push({
                name: module.exports.config.name,
                author: event.senderID,
                messageID: info.messageID,
                videoInfo,
                type: "search"
            });
        });
    }).catch(err => console.log(err));
};
