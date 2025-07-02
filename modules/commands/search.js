const axios = require('axios');

module.exports.config = {
    name: "search",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "!", // chỉnh sửa lại bởi Blue
    description: "Tìm kiếm trên trình duyệt Chrome với từ khóa được cung cấp",
    commandCategory: "Tiện ích",
    usages: "",
    cooldowns: 0,
};

module.exports.run = async function({ api, event, args }) {
    const query = args.join(' ');
    if (!query) {
        api.sendMessage("Vui lòng cung cấp từ khóa tìm kiếm.", event.threadID);
        return;
    }

    const cx = "7514b16a62add47ae"; // Thay thế bằng Custom Search Engine ID của bạn
    const apiKey = "AIzaSyAqBaaYWktE14aDwDE8prVIbCH88zni12E"; // Thay thế bằng API key của bạn
    const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${query}`;

    try {
        const response = await axios.get(url);
        const searchResults = response.data.items.slice(0, 5);
        let message = `=== [ Google - Chrome ] ===\n─────────────────\n📃 Hiện có 5 kết quả tìm kiếm nội dung '${query}' trên Google Chrome:\n\n`;
        searchResults.forEach((result, index) => {
            message += `📝 Kết quả: ${index + 1}\n🔎 Nội dung: ${result.title}\n🌐 Link bài: ${result.link}\n📌 Chú thích: ${result.snippet}\n─────────────────\n`;
        });
        api.sendMessage(message, event.threadID);
    } catch (error) {
        console.error(error);
        api.sendMessage("Đã xảy ra lỗi khi tìm kiếm trên Chrome.", event.threadID);
    }
};