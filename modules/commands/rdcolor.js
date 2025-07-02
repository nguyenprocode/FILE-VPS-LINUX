module.exports.config = {
    name: "settheme",
    version: "1.2.0",
    hasPermssion: 1,
    credits: "̣lvbang & Claude",
    description: "Đổi chủ đề box chat theo tên",
    commandCategory: "QTV",
    usages: "[tên chủ đề]",
    cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
    const themeMap = {
        'mặc định': '196241301102133',
        'tình yêu': '169463077092846',
        'halloween': '172391903518204',
        'tết': '627144732056021',
        'giáng sinh': '1430390744208143',
        'đại dương': '121330102980110',
        'hoa': '2058653964378557',
        'cầu vồng': '3190514984517598',
        'hoàng hôn': '3082966625307060',
        'núi lửa': '627144732056021',
        'bầu trời': '3377344502519592',
        'thiên hà': '574890876573708'
    };

    const themeName = args.join(' ').toLowerCase();

    if (!themeName) {
        return api.sendMessage("Vui lòng nhập tên chủ đề. Các chủ đề có sẵn: " + Object.keys(themeMap).join(', '), event.threadID);
    }

    if (themeMap.hasOwnProperty(themeName)) {
        const themeID = themeMap[themeName];
        return api.changeThreadColor(themeID, event.threadID, (err) => {
            if (err) return api.sendMessage("Đã có lỗi xảy ra khi thay đổi chủ đề", event.threadID);
            api.sendMessage(`Đã thay đổi chủ đề thành "${themeName}"`, event.threadID);
        });
    } else {
        return api.sendMessage(`Chủ đề "${themeName}" không có sẵn. Các chủ đề có sẵn: ` + Object.keys(themeMap).join(', '), event.threadID);
    }
};