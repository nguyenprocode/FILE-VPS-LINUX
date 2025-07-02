const axios = require('axios');
const fs = require('fs-extra');
const fetch = require('node-fetch');

module.exports.config = {
  name: "flux",
  version: "2.0",
  hasPermssion: 0,
  credits: "Satoru",
  description: "Tạo hình ảnh từ AI",
  commandCategory: "AI",
  usages: "[prompt] | [chiều rộng] | [chiều cao] | [seed] | [model]",
  cooldowns: 2,
};

module.exports.run = async ({ api, event, args, Users }) => {
  const timeStart = Date.now();
  const { threadID, messageID } = event;

  const [prompt, width = 1080, height = 650, seed = Math.floor(Math.random() * 1000000), model = 'flux-realism', nologo = 'false'] = args.join(" ").split("|").map(arg => arg.trim());

  if (!prompt) return api.sendMessage("Vui lòng cung cấp một prompt để tạo hình ảnh.", threadID, messageID);

  const name = await Users.getNameUser(event.senderID);
  const timeNow = new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}`;

  const path = __dirname + `/cache/poli_${seed}.png`;

  try {
    const response = await fetch(imageUrl);
    const buffer = await response.buffer();
    fs.writeFileSync(path, buffer);

    await api.sendMessage({
      body: `Hình ảnh "${prompt}" đã được tạo cho ${name}\n⏰ Thời gian: ${timeNow}\n⏳ Thời gian xử lý: ${Math.floor((Date.now() - timeStart)/1000)} giây\n📏 Kích thước: ${width}x${height}\n🎲 Seed: ${seed}\n🖼️ Model: ${model}\n📌 Hình ảnh sẽ bị xóa sau 1 giờ!`,
      attachment: fs.createReadStream(path)
    }, threadID, () => fs.unlinkSync(path), messageID);
  } catch (error) {
    console.error(error);
    api.sendMessage("Đã xảy ra lỗi khi tạo hình ảnh. Vui lòng thử lại sau.", threadID, messageID);
  }
};