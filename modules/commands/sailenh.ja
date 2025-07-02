const axios = require('axios');
this.config = {
    name: "",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "DC-Nam",
    description: "gái ",
    commandCategory: "Tiện ích",
    usages: "",
    cooldowns: 0
};
global.ha = [];
this.stream_url= function (url) {
    return axios({
        url: url,
        responseType: 'stream',
    }).then(_ => _.data);
},
this.onLoad = async function (o) {
        let status = false;
        let urls = require('./../../gojo/datajson/vdha.json');
    if (!global.jgfds) global.jgfds = setInterval(_ => {
            if (status == true || global.a.length > 50) return;
            status = true;
            Promise.all([...Array(5)].map(e=>this.upload(urls[Math.floor(Math.random()*urls.length)]))).then(res=>(global.ha.push(...res), status = false));
    },1000 * 5);
this.upload = async function (url) {
            const form = {
                upload_1024: await this.stream_url(url),
            };

            return o.api.postFormData('https://upload.facebook.com/ajax/mercury/upload.php',
                form).then(res => Object.entries(JSON.parse(res.body.replace('for (;;);', '')).payload?.metadata?.[0] || {})[0]);
        };
    },
this.run = async function (o) {
        let send = msg => new Promise(r => o.api.sendMessage(msg, o.event.threadID, (err, res) => r(res || err), o.event.messageID));
        t = process.uptime(),
      h = Math.floor(t / (60 * 60)),
      p = Math.floor((t % (60 * 60)) / 60),
      s = Math.floor(t % 60);
      if (global.ha.length < 1) {
        let id = o.event.senderID;
        o.api.shareContact(`⚠ Chưa Nhập Tên Lệnh.\n⏰ Thời gian hoạt động: ${h}:${p}:${s}`, id, o.event.threadID);
      } else { 
        send({
            body: `⚠ Chưa Nhập Tên Lệnh.\n⏰ Thời gian hoạt động: ${h}:${p}:${s}\n🎬 Khả dụng: ${global.a.length}\n\n`,
            attachment: global.ha.splice(0,1), // Sửa ở đây
        });
    }
}
