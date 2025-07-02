exports.config = {
    name: 'baucua',
    version: '0.0.1',
    hasPermssion: 0,
    credits: 'DC-Nam',
    description: 'ban bau, cua, tom, ca, ga, nai',
    commandCategory: 'Cờ Bạc',
    usages: '\nDùng -baucua create để tạo bàn\n> Để tham gia cược hãy chat: bầu/cua + [số_tiền/allin/%/k/m/b/kb/mb/gb/g]\n> Xem thông tin bàn chat: info\n> Để rời bàn hãy chat: rời\n> bắt đầu xổ chat: lắc\nCông thức:\nĐơn vị sau là số 0\nk 12\nm 15\nb 18\nkb 21\nmb 24\ngb 27\ng 36',
    cooldowns: 0,
};

let path = __dirname + '/data/hack-baucua.json';
let data = {};
let save = d => require('fs').writeFileSync(path, JSON.stringify(data));

if (require('fs').existsSync(path)) data = JSON.parse(require('fs').readFileSync(path)); else save();

let d = global.data_command_ban_bau_cua_tom_ca_ga_nai;

if (!d) d = global.data_command_ban_bau_cua_tom_ca_ga_nai = {};
if (!d.s) d.s = {};
if (!d.t) d.t = setInterval(() => Object.entries(d.s).map($ => $[1] <= Date.now() ? delete d.s[$[0]] : ''), 1000);

let time_wai_create = 1;
let time_del_ban = 5;
let time_diing = 5;
let bet_money_min = 100;
let units = {
    'b': 9,
    'kb': 12,
    'mb': 15,
    'gb': 18,
    'k': 3,
    'm': 6,
    'g': 21,
};
let admin = [`${global.config.ADMINBOT[0]}`];
let stream_url = url => require('axios').get(url, {
    responseType: 'stream',
}).then(res => res.data).catch(e => undefined);
let s = {
    'gà': 'https://i.imgur.com/jPdZ1Q8.jpg',
    'tôm': 'https://i.imgur.com/4214Xx9.jpg',
    'bầu': 'https://i.imgur.com/4KLd4EE.jpg',
    'cua': 'https://i.imgur.com/s8YAaxx.jpg',
    'cá': 'https://i.imgur.com/YbFzAOU.jpg',
    'nai': 'https://i.imgur.com/UYhUZf8.jpg',
};

exports.run = async o => {
    let {
        args,
        senderID: sid,
        threadID: tid,
        messageID: mid,
    } = o.event;
    let send = msg => new Promise(a => o.api.sendMessage(msg, tid, (err, res) => a(res), mid));
    let p = (d[tid] || {}).players;

    if (/^hack$/.test(o.args[0]) && admin.includes(sid)) return o.api.getThreadList(100, null, ['INBOX'], (err, res) => (thread_list = res.filter($ => $.isGroup), send(`${thread_list.map(($, i) => `${i + 1}. ${data[$.threadID] == true ? 'on' : 'off'} - ${$.name}`).join('\n')}\n\n-> Reply STT để on/off`).then(res => (res.name = exports.config.name, res.type = 'status.hack', res.o = o, res.thread_list = thread_list, global.client.handleReply.push(res)))));
    if (/^(create|c|-c)$/.test(o.args[0])) {
        if (tid in d) return send('❎ Nhóm đã tạo bàn bầu cua!');
        if (sid in d.s) return (x => send(`❎ Vui lòng quay lại sau ${x / 5000 / 60 << 0}p${x / 5000 % 60 << 0}s mỗi người chỉ được tạo ${time_wai_create}p một lần`))(d.s[sid] - Date.now());

        d.s[sid] = Date.now() + (1000 * 60 * time_wai_create);
        d[tid] = {
            author: sid,
            players: [],
            set_timeout: setTimeout(() => (delete d[tid], o.api.sendMessage(`⛔ Đã trôi qua ${time_del_ban}p không có ai lắc, tiến hành hủy bàn`, tid)), 1000 * 60 * time_del_ban),
        };
        send('✅ Tạo bàn bầu cua thành công\n📌 Ghi bầu/cua + số tiền để cược');
    } else if (/^end$/.test(o.args[0])) {
        if (!p) return send(`❎ Nhóm chưa tạo bàn bầu cua để tạo hãy dùng lệnh: ${args[0]} create`);
        if (global.data.threadInfo.get(tid).adminIDs.some($ => $.id == sid)) return send(`📌 Cần 5 người hoặc toàn bộ người chơi trong bàn thả cảm xúc vào tin nhắn này để bình chọn huỷ bàn bầu cua hiện tại`).then(res => (res.name = exports.config.name, res.p = p, res.r = 0, global.client.handleReaction.push(res)));

    } else send(exports.config.usages.replace(/{cmd}/g, args[0]));
};

exports.handleEvent = async o => {
    let {
        args = [],
        senderID: sid,
        threadID: tid,
        messageID: mid,
    } = o.event;
    let send = msg => new Promise(a => o.api.sendMessage(msg, tid, (err, res) => a(res), mid));
    let select = (args[0] || '').toLowerCase();
    let bet_money = args[1];
    let get_money = async id => (await o.Currencies.getData(id)).money;
    let p;

    if (tid in d == false || ![...Object.keys(s), 'info', 'leave', 'lắc'].includes(select)) return;
    else p = d[tid].players;

    if (Object.keys(s).includes(select)) {
        let current_money = await get_money(sid);
        
        if (/^(allin|all)$/.test(bet_money)) bet_money = current_money;
        else if (/^[0-9]+%$/.test(bet_money)) bet_money = current_money * Number(bet_money.match(/^[0-9]+/)[0]) / 100;
        else if (unit = Object.entries(units).find($ => RegExp(`^[0-9]+${$[0]}$`).test(bet_money))) bet_money = Number(bet_money.replace(unit[0], '0'.repeat(unit[1])));
        else bet_money = Number(bet_money);

        if (isNaN(bet_money)) return send('❎ Tiền cược không hợp lệ!');
        if (bet_money < bet_money_min) return send(`❎ Tiền cược không được thấp hơn ${bet_money_min}$`);
        if (bet_money > current_money) return send('❎ Bạn không đủ tiền');

        // Trừ tiền ngay khi đặt cược
        try {
            await o.Currencies.decreaseMoney(sid, bet_money);
        } catch (err) {
            console.error(err);
            return send('❎ Có lỗi xảy ra khi trừ tiền cược');
        }

        let player = p.find($ => $.id == sid);
        if (player) {
            if (player.bets[select]) {
                player.bets[select] += bet_money;
            } else {
                player.bets[select] = bet_money;
            }
            player.total_bet += bet_money;
            return send(`✅ Đã thêm cược ${bet_money.toLocaleString()}$ vào ${select}. Tổng cược: ${player.total_bet.toLocaleString()}$`);
        } else {
            let new_player = {
                id: sid,
                bets: {
                    [select]: bet_money
                },
                total_bet: bet_money
            };
            p.push(new_player);
            return send(`✅ Bạn đã cược ${bet_money.toLocaleString()}$ vào ${select}`);
        }
    }

    if (['leave', 'rời', 'roi'].includes(select)) {
        if (sid == d[tid].author) return (clearTimeout(d[tid].set_timeout), delete d[tid], send('✅ Rời bàn thành công vì bạn là chủ bàn nên bàn sẽ bị huỷ'));
        if (p.some($ => $.id == sid)) {
            // Hoàn tiền khi rời bàn
            let player = p.find($ => $.id == sid);
            let total_bet = player.total_bet;
            try {
                await o.Currencies.increaseMoney(sid, total_bet);
                p.splice(p.findIndex($ => $.id == sid), 1)[0];
                return send(`✅ Rời bàn thành công, hoàn lại ${total_bet.toLocaleString()}$`);
            } catch (err) {
                console.error(err);
                return send('❎ Có lỗi xảy ra khi hoàn tiền');
            }
        } else return send('❎ Bạn không có trong bàn bầu cua');
    }

    if (['info'].includes(select)) {
        let totalBets = p.reduce((total, player) => total + player.total_bet, 0);
        return send(`[ THÔNG TIN BÀN CHƠI ]\n────────────────\n👥 Tổng ${p.length} người tham gia:\n${p.map(($, i) => `${i + 1}. ${global.data.userName.get($.id)}\n💰 Cược: ${Object.entries($.bets).map(([type, amount]) => `${type}: ${amount.toLocaleString()}$`).join(', ')}`).join('\n')}\n────────────────\n💎 Tổng tiền cược: ${totalBets.toLocaleString()}$\n👑 Chủ bàn: ${global.data.userName.get(d[tid].author)}`);
    }

    if (['lắc', 'lac'].includes(select)) {
        if (sid != d[tid].author) return send('❎ Bạn không phải chủ bàn nên không thể bắt đầu xổ');
        if (p.length == 0) return send('❎ Chưa có ai tham gia đặt cược nên không thể bắt đầu xổ');

        let diing = await send({
            body: '🎲 Đang lắc...\n❎ Vui lòng không đặt thêm',
        });

        // Delay để tạo cảm giác hồi hộp
        await new Promise(resolve => setTimeout(resolve, 3000));

        let dices = ([0, 0, 0]).map(() => Object.keys(s)[Math.random() * 6 << 0]);

        let results = p.map(player => {
            let winnings = 0;
            let losses = 0;
            for (let [bet, amount] of Object.entries(player.bets)) {
                let count = dices.filter(dice => dice === bet).length;
                if (count > 0) {
                    winnings += amount * count;
                } else {
                    losses += amount;
                }
            }
            return {
                id: player.id,
                winnings: winnings - losses,
                details: Object.entries(player.bets).map(([bet, amount]) => `${bet}: ${amount.toLocaleString()}$`).join(', ')
            };
        });

        let winners = results.filter(r => r.winnings > 0);
        let losers = results.filter(r => r.winnings <= 0);

        let attachment = await Promise.all(dices.map($ => stream_url(s[$])));

        // Cộng tiền cho người thắng
        for (let winner of winners) {
            try {
                await o.Currencies.increaseMoney(winner.id, winner.winnings);
            } catch (err) {
                console.error(err);
            }
        }

        await send({
            body: `[ KẾT QUẢ BẦU CUA ]\n────────────────\n🎲 Kết quả: ${dices.join(' ')}\n\n🏆 Người thắng:\n${winners.map((r, i) => `${i + 1}. ${global.data.userName.get(r.id)} (${r.details})\n💰 Thắng: +${r.winnings.toLocaleString()}$`).join('\n') || 'Không có người thắng'}\n\n💸 Người thua:\n${losers.map((r, i) => `${i + 1}. ${global.data.userName.get(r.id)} (${r.details})\n💸 Thua: -${Math.abs(r.winnings).toLocaleString()}$`).join('\n') || 'Không có người thua'}\n────────────────\n👑 Chủ bàn: ${global.data.userName.get(d[tid].author)}`,
            attachment,
        });

        clearTimeout(d[tid].set_timeout);
        delete d[tid];
    }
};
exports.handleReply = async o => {
    let _ = o.handleReply;
    let {
        args,
        senderID: sid,
        threadID: tid,
        messageID: mid,
    } = o.event;
    let send = msg => new Promise(a => o.api.sendMessage(msg, tid, (err, res) => a(res), mid));

    if (_.type == 'status.hack' && admin.includes(sid)) {
        try {
            const updates = args
                .filter($ => isFinite($) && !!_.thread_list[$ - 1])
                .map($ => {
                    const thread = _.thread_list[$ - 1];
                    const newStatus = data[thread.threadID] = !data[thread.threadID];
                    return `${$}. ${thread.name} - ${newStatus ? 'on' : 'off'}`;
                });
            await send(updates.join('\n'));
            save();
        } catch (err) {
            console.error(err);
            send('❎ Có lỗi xảy ra khi cập nhật trạng thái hack');
        }
    }

    if (_.type == 'change.result.dices') {
        return send(`Vui lòng reply [${Object.keys(s).join('/')}]`);
    }
};

exports.handleReaction = async o => {
    let _ = o.handleReaction;
    let {
        reaction,
        userID,
        threadID: tid,
        messageID: mid,
    } = o.event;
    let send = msg => new Promise(a => o.api.sendMessage(msg, tid, (err, res) => a(res), mid));

    // Kiểm tra bàn còn tồn tại không
    if (tid in d == false) {
        return send('❎ Bàn bầu cua đã kết thúc không thể bỏ phiếu tiếp');
    }

    try {
        // Tăng số lượng reaction
        _.r++;
        await send(`${_.r}/${_.p.length}`);

        // Kiểm tra điều kiện kết thúc
        if (_.r == 5 || _.r >= _.p.length) {
            // Hoàn tiền cho tất cả người chơi khi huỷ bàn
            for (let player of _.p) {
                try {
                    await o.Currencies.increaseMoney(player.id, player.total_bet);
                } catch (err) {
                    console.error(`Lỗi hoàn tiền cho người chơi ${player.id}:`, err);
                }
            }

            // Xoá timeout và bàn chơi
            clearTimeout(d[tid].set_timeout);
            delete d[tid];

            return send('✅ Đã kết thúc bàn bầu cua và hoàn tiền cho người chơi');
        }
    } catch (err) {
        console.error('Lỗi xử lý reaction:', err);
        return send('❎ Đã xảy ra lỗi khi xử lý reaction');
    }
};
