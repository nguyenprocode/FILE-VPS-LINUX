module.exports.config = {
    name: "nonkydieu",
    version: "3.0.0",
    hasPermssion: 0,
    credits: "SATORU",
    description: "Game Chiếc nón kỳ diệu nhiều người chơi",
    commandCategory: "Game",
    usages: "nonkydieu [start/join/begin/end/category]",
    cooldowns: 5,
    envConfig: {
        rewardMoney: 100000,
        absoluteWinMoney: 200000
    },
    dependencies: {
        "canvas": "",
        "fs-extra": ""
    }
};

const gameConfig = {
    minPlayers: 2,
    maxPlayers: 10,
    bonusPoints: 10000,
    categories: {
        location: {
            name: "🌏 Địa danh",
            words: [
                "HA NOI", "SAI GON", "DA NANG", "VUNG TAU", "NHA TRANG",
                "DA LAT", "PHU QUOC", "HA LONG", "HOI AN", "CAN THO",
                "BIEN HOA", "HAI PHONG", "CAT BA", "HUE", "QUY NHON",
                "SAM SON", "BAC NINH", "HA GIANG", "LAO CAI", "DIEN BIEN",
                "NGHE AN", "THANH HOA", "QUANG NINH", "SOC TRANG", "BAC LIEU",
                "CA MAU", "DONG NAI", "TAY NINH", "KIEN GIANG", "LAM DONG"
            ],
            hint: "Các địa danh nổi tiếng Việt Nam"
        },
        food: {
            name: "🍜 Ẩm thực",
            words: [
                "PHO BO", "BUN CHA", "COM TAM", "BANH MI", "BANH XEO",
                "MI QUANG", "HU TIEU", "BANH CUON", "GOI CUON", "NEM CHUA",
                "BANH CHUNG", "BANH TET", "NEM RAN", "COM CHIEN", "BUN CA",
                "BANH TRANG", "CHE TROI", "BANH BOT LOC", "BANH CAY", "BANH KHOT",
                "LAU THAI", "PHO GA", "BUN RIEU", "BUN BO HUE", "COM LAM",
                "CA PHE TRUNG", "TRA SEN", "CHE BA MAU", "BANH CANH", "CHA CA"
            ],
            hint: "Các món ăn đặc trưng Việt Nam"
        },
        celebrity: {
            name: "👥 Người nổi tiếng",
            words: [
                "SON TUNG", "HOAI LINH", "THANH LOC", "HONG VAN", "MY TAM",
                "DAM VINH HUNG", "DUC PHUC", "TRUONG GIANG", "HONG NHUNG",
                "LAN NGOC", "TRAN THANH", "DEN VAU", "MONO", "CHI PU", 
                "PHUONG MY CHI", "HOANG THUY LINH", "THIEU BAO TRAM", "MIN",
                "KARIK", "BINZ", "ERIK", "JUSTATEE", "HUONG GIANG", "THUY TIEN",
                "VU CAT TUONG", "TRUC NHAN", "BICH PHUONG", "HA ANH TUAN",
                "PHUONG LY", "MIU LE"
            ],
            hint: "Các nghệ sĩ nổi tiếng Việt Nam"
        },
        football: {
            name: "⚽ Cầu thủ",
            words: [
                "CONG PHUONG", "QUANG HAI", "VAN LAM", "VAN HAU", "VAN TOAN",
                "HOANG DUC", "TUAN ANH", "TIEN DUNG", "THANH CHUNG", "TIEN LINH",
                "NGOC HAI", "HUNG DUNG", "VAN THANH", "DUC HUY", "XUAN TRUONG",
                "VAN HOANG", "HONG DUY", "DUC CHINH", "VAN QUYET", "CONG VINH",
                "HONG SON", "THE ANH", "HUU THANG", "VAN QUYEN", "THANH LUONG",
                "MINH VUONG", "TUAN HAI", "HAI LONG", "TIEN DUNG", "THANH BINH"
            ],
            hint: "Các cầu thủ bóng đá Việt Nam"
        },
        nature: {
            name: "🌿 Thiên nhiên",
            words: [
                "THIEN DUONG", "BAN GIOC", "HA LONG", "SUOI TIEN", "U MINH",
                "PHONG NHA", "CAT TIEN", "BA DEN", "SUOI TRANH", "BIEN HO",
                "DATANLA", "TA DUNG", "BA VI", "TAM DAO", "CUU LONG",
                "SONG HONG", "BIEN DONG", "VINH THAI LAN", "BACH MA", "TRUONG SON",
                "HOANG LIEN SON", "YEN TU", "SAM SON", "CAT BA", "PHU QUY",
                "LY SON", "CON DAO", "NAM DU", "THAC BA", "FANSIPAN"
            ],
            hint: "Danh lam thắng cảnh tự nhiên"
        },
        education: {
            name: "🎓 Trường học",
            words: [
                "DAI HOC QUOC GIA", "BACH KHOA", "KINH TE QUOC DAN", 
                "Y HA NOI", "THUY LOI", "GIAO THONG", "NGOAI THUONG",
                "XAY DUNG", "DUOC HA NOI", "CNTT BACH KHOA",
                "HOC VIEN AN NINH", "LE QUY DON", "NGUYEN HUE",
                "TRAN PHU", "MARIE CURIE", "AMSTERDAM",
                "THANG LONG", "CHU VAN AN", "VIET DUC",
                "LUONG THE VINH", "PHAN BOI CHAU", "LE HONG PHONG",
                "TRAN DAI NGHIA", "HONG BANG", "DOAN THI DIEM",
                "DINH TIEN HOANG", "NGUYEN BINH KHIEM", "LE LOI",
                "TRAN NHAN TONG", "MAC DINH CHI"
            ],
            hint: "Các trường học nổi tiếng"
        },
        fashion: {
            name: "👗 Thời trang",
            words: [
                "AO DAI", "NON LA", "KHAN DONG", "AO BA BA",
                "AO TU THAN", "KHAN RAN", "AO YEM", "KHAN PIEU",
                "AO TRANG", "KHAN XONG", "AO GIAO LINH", "AO CAM",
                "KHAN VUONG", "AO GIO", "NON QUAI THAO", "AO PHONG",
                "KHAN CHOANG", "AO LE", "NON KET", "AO LUA",
                "KHAN LUA", "AO NGAN", "AO BAU", "KHAN LEN",
                "AO VEST", "KHAN THE THAO", "AO POLO", "AO DET",
                "KHAN VAI", "AO THUN"
            ],
            hint: "Các loại trang phục"
        },
        company: {
            name: "🏢 Thương hiệu",
            words: [
                "VINGROUP", "VIETTEL", "MOBIFONE", "VINAPHONE",
                "VIETNAM AIRLINES", "BAMBOO", "VIETCOMBANK", "AGRIBANK",
                "BIDV", "VIETTINBANK", "FPT", "THE GIOI DI DONG",
                "SENDO", "LAZADA", "SHOPEE", "TIKI",
                "MASAN", "HABECO", "SABECO", "PETROLIMEX",
                "VNPT", "TECHCOMBANK", "ACB", "VPBANK",
                "SUN GROUP", "VINAMILK", "HUDA", "TIGER",
                "TRUNG NGUYEN", "HIGHLANDS"
            ],
            hint: "Các thương hiệu Việt Nam"
        },
        music: {
            name: "🎵 Âm nhạc",
            words: [
                "HOA NOI", "CHIM TRANG", "MAT TROI BE CON",
                "HA NOI MUA THU", "NOI VONG TAY LON", "DOA HOA HONG",
                "LY CA PHE BAN ME", "CON DUONG XUA", "TINH CA",
                "NGUOI THAY", "TINH XA", "BIEN TINH",
                "PHAI LONG CON GAI BEN TRE", "BAI CA HY VONG", "MUA XUAN",
                "CON DUONG MAU XANH", "QUE HUONG", "GIAC MO TRA HOA",
                "TINH BON MUA", "ANH CHO EM MUA XUAN", "DIEP KHUC MUA XUAN",
                "CAT BUI", "DEM LANG THANG", "PHUONG HONG",
                "HAT VE HOA LUA", "BIEN NGAN", "DEM DONG",
                "DUONG VE QUE", "DEM GANH HAO", "HUONG THOM"
            ],
            hint: "Tên các bài hát nổi tiếng"
        },
        game: {
            name: "🎮 Game Việt",
            words: [
                "THAN DONG DAT VIET", "HUYEN THOAI RUONG BO",
                "AU MOB", "GUNNY", "VIET NAM ONLINE",
                "THAN BINH", "HAI TAC TRUYEN KY", "PHONG VAN",
                "CHU BE RON", "NGOI SAO THOI TRANG", "BAY VIEN NGOC RONG",
                "LANG LA", "BIEN DONG", "LOAN CHIEN", "THIEN LONG",
                "KIEU NU", "DONG PHUONG", "GIANG HO", "TIEU NGAO",
                "SAO VANG", "ANH HUNG", "DIEP VIEN", "BAO BONG",
                "CHIEN TUYEN", "HOANG DE", "GIAI MA", "LINH THU",
                "HUNG VUONG", "BAO BOI", "TIEN HIEP"
            ],
            hint: "Các game Việt Nam"
        },
        movie: {
            name: "🎬 Phim Việt",
            words: [
                "MAT BIEC", "TIEC TRANG MAU", "BO GIA", "HAI PHUONG",
                "NGUOI BAT TU", "SONG LANG", "TRANG QUY NH", "CO BA SAI GON",
                "GIAI MA", "TAM CAM", "QUA TIM MAU", "OAN HON",
                "NGUOI VOI", "LAT MAT", "TINH DAU THO NGAY", "NHA BA NU",
                "EM VA TRINH", "TRANG TI", "MAY LANG THANG", "BAC KIM THANG",
                "DAN CHOI", "HANH PHUC", "DEM TOI", "TIEC CUOI",
                "NANG DOI", "THANH SOI", "CHO DEM", "YEU",
                "BOM", "DOI BAO"
            ],
            hint: "Tên các bộ phim Việt Nam"
        },
        travel: {
            name: "✈️ Du lịch",
            words: [
                "VUNG CAU", "PHU YEN", "MUI CA MAU", "TAM DAO",
                "SAPA", "MONG CAI", "NAM DU", "CON DAO",
                "PHU QUOC", "NINH BINH", "MAI CHAU", "CAT CAT",
                "DA BAC", "MUI NE", "BAI SAU", "TAM GIANG",
                "HA TIEN", "BAC HA", "SUOI GIANG", "LANG BIANG",
                "CAU DAI", "DONG VAN", "HANG RAO", "THAC BA",
                "BA BE", "CAT TIEN", "CAU RONG", "HO TAY",
                "SUOI HOA", "NON NUOC"
            ],
            hint: "Các địa điểm du lịch"
        },
        traditional_job: {
            name: "👨‍🌾 Nghề truyền thống",
            words: [
                "LAM GIAY", "DOT GIANG", "DET VAI", "KHAC GO",
                "LAM NON LA", "LAM HUONG", "UOM TO", "LAM VANG",
                "DET CHIEU", "LAM GOM", "REN DONG", "THEU REN",
                "NGHE MUC", "LAM MOC", "DAN LAT", "CHE BIEN TRA",
                "LAM LUOC", "THEU THUAN", "LAM DAN", "LAM MEO",
                "LAM SON", "LAM MAY", "LAM KHAN", "NGHE VOI",
                "NGHE NEN", "NGHE BUN", "NGHE MAM", "LAM TRANH",
                "NGHE MIA", "LAM DAO"
            ],
            hint: "Các nghề nghiệp truyền thống"
        },
        sports: {
            name: "🏃 Thể thao",
            words: [
                "BONG DA", "BONG CHUYEN", "BONG RO", "BONG BAN",
                "CU TA", "DAU KIEM", "TAEKWONDO", "DIEN KINH",
                "CAU LONG", "QUAN VOT", "CO TUONG", "CO VUA",
                "WUSHU", "KARATEDO", "VOI CO TRUYEN", "BOXING",
                "PENCAK SILAT", "MUAY", "LEO NUI", "BAN SUNG",
                "BAN CUNG", "BONG NEM", "THE DUC", "DANCE SPORT",
                "AEROBIC", "YOGA", "BILLARD", "DAU VAT",
                "JUDO", "MARATHON"
            ],
            hint: "Các môn thể thao"
        },
        instrument: {
            name: "🎼 Nhạc cụ",
            words: [
                "DAN BAU", "DAN TRANH", "SAO TRUC", "DAN NGUYET",
                "DAN NHI", "DAN TY BA", "TRONG DONG", "DAN TAM",
                "KEN BONG", "DAN SEN","TRONG COM", "DAN THAP LUC", "KEN NGHIEP", "TRONG DOI",
                "THANH LA", "CHAP CHOA", "SINH TIEN", "DAN HO",
                "TRONG CHAU", "KEN DOI", "DAN KHONG", "DAN NHAT",
                "TRONG BONG", "KEN LA", "DAN MUONG", "DAN GAO",
                "DAN CAM", "DAN GHITA", "KEN GO", "SANH TIEN"
            ],
            hint: "Các loại nhạc cụ"
        },
        history: {
            name: "📜 Lịch sử",
            words: [
                "HAI BA TRUNG", "LAM SON", "BACH DANG", "BA TRIEU",
                "VAN LANG", "HUNG VUONG", "THANG LONG", "NHA TRAN",
                "NHA LY", "NHA NGUYEN", "TAY SON", "DONG DA",
                "DIEN BIEN PHU", "THANG LONG", "THANG TAM", "HO CHI MINH",
                "VIET MINH", "DONG KHOI", "DOC LAP", "GIAI PHONG",
                "DONG DU", "BAC SON", "NAM KY", "CAN VUONG",
                "PHU XUAN", "GIO LINH", "KHE SANH", "TRUONG SON",
                "THANH CO", "CO LOA"
            ],
            hint: "Các địa danh và sự kiện lịch sử"
        },
        animal: {
            name: "🐾 Động vật",
            words: [
                "SAO LA", "TE GAU", "VOOC MUI HECH", "KHI DUOI LYP",
                "GAU NGUA", "HO DONG DUONG", "BOC MO", "HUOU SAO",
                "TE TE", "CU LI", "LINH TRUONG", "CA DUONG",
                "CA HOI", "BO GAY", "BO SONG", "BO TOT",
                "CAY VOC", "CHON BAY", "CAO CAT", "HO CON",
                "VEN VEN", "DA VIET", "MAN TRU", "CAY GIO",
                "NHIM", "RAI CAY", "SON DUONG", "VUON",
                "NAI", "HUOU"
            ],
            hint: "Các loài động vật Việt Nam"
        },
        plant: {
            name: "🌺 Thực vật",
            words: [
                "HOA SEN", "HOA MAI", "HOA DAO", "HOA SUNG",
                "HOA GIAY", "HOA PHUONG", "TRE LA NGA", "MAI VANG",
                "BANG LANG", "LIEU RUNG", "XA CU", "CUC HOA",
                "DUA NUOC", "THONG XANH", "LAC TIEN", "PHU DUNG",
                "DONG TIEN", "MOC LAN", "THIEN LY", "QUE CHI",
                "LAU LAU", "MAI DO", "THONG REO", "TUONG VI",
                "SIM TIM", "OI RUNG", "RE QUAI", "VAN THO",
                "CAN THANG", "BO KET"
            ],
            hint: "Các loài thực vật Việt Nam"
        }
    },
    basePoints: [1000, 2000, 3000, 4000, 5000, "Mất lượt", 1500, 2500, 3500, 4500, "x2", "Về 0"],
    layout: {
        playerPanel: {
            x: 50,
            y: 80,
            width: 280,
            height: 400
        },
        wheelCenter: {
            x: 550,
            y: 300,
            radius: 180
        },
        wordPanel: {
            x: 150,
            y: 550,
            width: 900,
            height: 200
        },
        guessPanel: {
            x: 800,
            y: 80,
            width: 350,
            height: 400
        }
    }
};

function formatMoney(amount) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " VND";
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

async function drawGame(ctx, gameData, Users) {
    // NỀN
    const bgGradient = ctx.createLinearGradient(0, 0, 0, 800);
    bgGradient.addColorStop(0, "#0D1454");
    bgGradient.addColorStop(1, "#0A0F42");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 1200, 800);

    // EFFECT BG
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 1200;
        const y = Math.random() * 800;
        const radius = Math.random() * 3;
        const alpha = Math.random() * 0.3;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // TÊN GAME
    ctx.save();
    ctx.font = "bold 40px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFD700";
    ctx.fillText("🎮 CHIẾC NÓN KỲ DIỆU 🎮", 600, 50);
    ctx.restore();

    await drawPlayerPanel(ctx, gameData, Users);
    await drawGuessPanel(ctx, gameData);
    drawWheel(ctx, gameData);
    await drawWordPanel(ctx, gameData);

    // BẢN QUYỀN
    ctx.font = "20px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "right";
    ctx.fillText("© SATORU", 1150, 770);
}
async function drawPlayerPanel(ctx, gameData, Users) {
    const panel = gameConfig.layout.playerPanel;
    
    ctx.save();
    const gradient = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.height);
    gradient.addColorStop(0, "rgba(76, 175, 80, 0.2)");
    gradient.addColorStop(1, "rgba(76, 175, 80, 0.1)");
    
    ctx.fillStyle = gradient;
    roundRect(ctx, panel.x, panel.y, panel.width, panel.height, 15);
    ctx.fill();
    
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "bold 25px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText("NGƯỜI CHƠI", panel.x + panel.width/2, panel.y + 40);

    let yPos = panel.y + 80;
    for (let player of gameData.players) {
        try {
            const isCurrentPlayer = player === gameData.currentPlayer;
            const score = gameData.scores[player] || 0;
            const name = await Users.getNameUser(player);
            const displayName = name ? name.slice(0, 12) + (name.length > 12 ? "..." : "") : "Unknown";

            if (isCurrentPlayer) {
                const highlightGrad = ctx.createLinearGradient(
                    panel.x + 10, yPos - 25,
                    panel.x + panel.width - 10, yPos + 25
                );
                highlightGrad.addColorStop(0, "rgba(255, 255, 0, 0.2)");
                highlightGrad.addColorStop(1, "rgba(255, 255, 0, 0.1)");
                ctx.fillStyle = highlightGrad;
                roundRect(ctx, panel.x + 10, yPos - 25, panel.width - 20, 50, 10);
                ctx.fill();
                ctx.strokeStyle = "#FFD700";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.fillStyle = isCurrentPlayer ? "#FFD700" : "#FFFFFF";
            ctx.font = isCurrentPlayer ? "bold 20px Arial" : "20px Arial";
            ctx.textAlign = "left";
            ctx.fillText(displayName, panel.x + 20, yPos);
            ctx.textAlign = "right";
            ctx.fillText(`${score} điểm`, panel.x + panel.width - 20, yPos);

            yPos += 60;
        } catch (error) {
            console.error(`Lỗi khi vẽ người chơi: ${error.message}`);
        }
    }
    ctx.restore();
}

async function drawWordPanel(ctx, gameData) {
    const panel = gameConfig.layout.wordPanel;
    
    ctx.save();
    const gradient = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.height);
    gradient.addColorStop(0, "rgba(76, 175, 80, 0.2)");
    gradient.addColorStop(1, "rgba(76, 175, 80, 0.1)");
    
    ctx.fillStyle = gradient;
    roundRect(ctx, panel.x, panel.y, panel.width, panel.height, 15);
    ctx.fill();
    
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (gameData.category) {
        ctx.font = "bold 25px Arial";
        ctx.fillStyle = "#FFD700";
        ctx.textAlign = "center";
        ctx.fillText(`Chủ đề: ${gameConfig.categories[gameData.category].name}`, panel.x + panel.width/2, panel.y + 40);
    }

    if (gameData.word) {
        const words = gameData.word.split(' ');
        const boxSize = 35;
        const spacing = boxSize * 0.3;
        const wordSpacing = boxSize;
        
        const totalWidth = words.reduce((width, word, index) => {
            return width + (word.length * (boxSize + spacing)) + (index > 0 ? wordSpacing : 0);
        }, -spacing);
        
        let startX = panel.x + (panel.width - totalWidth) / 2;
        const startY = panel.y + 80;

        words.forEach((word, wordIndex) => {
            const chars = word.split('');
            
            chars.forEach((char, charIndex) => {
                const x = startX + charIndex * (boxSize + spacing);
                
                ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
                roundRect(ctx, x, startY, boxSize, boxSize, 5);
                ctx.fill();
                ctx.strokeStyle = "#FFD700";
                ctx.lineWidth = 1;
                ctx.stroke();

                if (gameData.guessed.includes(char)) {
                    ctx.font = `bold ${boxSize * 0.7}px Arial`;
                    ctx.fillStyle = "#FFD700";
                    ctx.textAlign = "center";
                    ctx.shadowColor = "#FFD700";
                    ctx.shadowBlur = 10;
                    ctx.fillText(char, x + boxSize/2, startY + boxSize - 8);
                    ctx.shadowBlur = 0;
                }
            });
            
            startX += (word.length * (boxSize + spacing)) + wordSpacing;
        });
    }
    ctx.restore();
}

async function drawGuessPanel(ctx, gameData) {
    const panel = gameConfig.layout.guessPanel;
    
    ctx.save();
    const gradient = ctx.createLinearGradient(panel.x, panel.y, panel.x, panel.y + panel.height);
    gradient.addColorStop(0, "rgba(76, 175, 80, 0.2)");
    gradient.addColorStop(1, "rgba(76, 175, 80, 0.1)");
    
    ctx.fillStyle = gradient;
    roundRect(ctx, panel.x, panel.y, panel.width, panel.height, 15);
    ctx.fill();
    
    ctx.strokeStyle = "#4CAF50";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.font = "bold 25px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText("CHỮ ĐÃ ĐOÁN", panel.x + panel.width/2, panel.y + 40);

    const guessed = gameData.guessed || [];
    const letterSize = 35;
    const spacing = 10;
    const lettersPerRow = Math.floor((panel.width - 40) / (letterSize + spacing));
    let startX = panel.x + 20;
    let startY = panel.y + 80;

    guessed.forEach((char, index) => {
        if (index > 0 && index % lettersPerRow === 0) {
            startY += letterSize + spacing;
            startX = panel.x + 20;
        }

        ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
        roundRect(ctx, startX, startY, letterSize, letterSize, 5);
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.fillStyle = "#FFFFFF";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText(char, startX + letterSize/2, startY + letterSize - 8);

        startX += letterSize + spacing;
    });

    if (gameData.category && gameConfig.categories[gameData.category]?.hint) {
        ctx.font = "20px Arial";
        ctx.fillStyle = "#FFD700";
        ctx.textAlign = "center";
        const hint = gameConfig.categories[gameData.category].hint;
        const words = hint.split(' ');
        let line = '';
        let y = panel.y + panel.height - 60;

        for (let word of words) {
            const testLine = line + word + ' ';
            const metrics = ctx.measureText(testLine);
            if (metrics.width > panel.width - 40 && line !== '') {
                ctx.fillText(line, panel.x + panel.width/2, y);
                line = word + ' ';
                y += 25;
            } else {
                line = testLine;
            }
        }
        ctx.fillText(line, panel.x + panel.width/2, y);
    }
    
    ctx.restore();
}

async function drawVictoryScreen(ctx, winner, word, category, Users) {
    // NỀN
    const gradient = ctx.createLinearGradient(0, 0, 0, 800);
    gradient.addColorStop(0, "#1a237e");
    gradient.addColorStop(1, "#0a1557");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 800);

    // HIỆU ỨNG PHÁO HOA
    for (let i = 0; i < 30; i++) {
        const x = Math.random() * 1200;
        const y = Math.random() * 400;
        const radius = Math.random() * 50 + 20;
        const hue = Math.random() * 360;
        const fireworkGradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        fireworkGradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 1)`);
        fireworkGradient.addColorStop(0.8, `hsla(${hue}, 100%, 50%, 0.3)`);
        fireworkGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0)`);
        ctx.fillStyle = fireworkGradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // TIÊU ĐỀ CHIẾN THẮNG
    ctx.save();
    ctx.font = "bold 60px Arial";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 8;
    ctx.strokeText("🎊 CHIẾN THẮNG TUYỆT ĐỐI! 🎊", 150, 150);
    const titleGradient = ctx.createLinearGradient(200, 100, 1000, 150);
    titleGradient.addColorStop(0, "#FFD700");
    titleGradient.addColorStop(0.5, "#FFA500");
    titleGradient.addColorStop(1, "#FF8C00");
    ctx.fillStyle = titleGradient;
    ctx.fillText("🎊 CHIẾN THẮNG TUYỆT ĐỐI! 🎊", 150, 150);
    ctx.restore();

    // THÔNG TIN NGƯỜI THẮNG
    const winnerName = await Users.getNameUser(winner);
    ctx.font = "bold 45px Arial";
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(`👑 NGƯỜI CHIẾN THẮNG: ${winnerName}`, 600, 250);

    // THÔNG TIN PHẦN THƯỞNG
    ctx.font = "bold 40px Arial";
    ctx.fillStyle = "#00FF00";
    ctx.fillText(`💰 PHẦN THƯỞNG: ${formatMoney(200000)}`, 600, 320);

    // THÔNG TIN TỪ KHÓA
    ctx.font = "bold 35px Arial";
    ctx.fillStyle = "#FFD700";
    if (category) {
        ctx.fillText(`📝 CHỦ ĐỀ: ${gameConfig.categories[category].name}`, 600, 390);
    }
    ctx.fillText(`🎯 TỪ KHÓA: ${word}`, 600, 450);

    // HIỆU ỨNG ÁNH SÁNG
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * 1200;
        const y = Math.random() * 800;
        const radius = Math.random() * 2 + 1;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // BẢN QUYỀN
    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    ctx.textAlign = "right";
    ctx.fillText("© SATORU", 1150, 770);
}

function drawWheel(ctx, gameData) {
    const wheel = gameConfig.layout.wheelCenter;
    
    ctx.save();
    ctx.translate(wheel.x, wheel.y);
    ctx.rotate(gameData.rotation || 0);

    const sections = gameConfig.basePoints.length;
    const points = gameConfig.basePoints;

    for (let i = 0; i < sections; i++) {
        const startAngle = (i * 2 * Math.PI) / sections;
        const endAngle = ((i + 1) * 2 * Math.PI) / sections;
        
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, wheel.radius);
        const isEven = i % 2 === 0;
        gradient.addColorStop(0, isEven ? "#FFD700" : "#FFA500");
        gradient.addColorStop(1, isEven ? "#FFA500" : "#FF8C00");

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, wheel.radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = "#FFFFFF";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.save();
        ctx.rotate(startAngle + Math.PI / sections);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "#000000";
        ctx.shadowColor = "#FFFFFF";
        ctx.shadowBlur = 2;
        ctx.fillText(points[i], wheel.radius - 20, 0);
        ctx.restore();
    }

    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    const centerGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 20);
    centerGradient.addColorStop(0, "#FFD700");
    centerGradient.addColorStop(1, "#FFA500");
    ctx.fillStyle = centerGradient;
    ctx.fill();
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();

    ctx.save();
    ctx.translate(wheel.x + wheel.radius + 10, wheel.y);
    
    ctx.beginPath();
    ctx.moveTo(0, 0); 
    ctx.lineTo(20, -15); 
    ctx.lineTo(20, 15); 
    ctx.closePath();

    const arrowGradient = ctx.createLinearGradient(0, 0, 20, 0);
    arrowGradient.addColorStop(0, "#FF0000"); 
    arrowGradient.addColorStop(1, "#8B0000"); 
    ctx.fillStyle = arrowGradient;
    ctx.fill();
    ctx.shadowColor = "#FF0000";
    ctx.shadowBlur = 10;
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();
}
module.exports.handleEvent = async function({api, event, client, Users}) {
    if (!event.body) return;
    const { threadID, messageID, senderID, body } = event;

    if (body.toLowerCase() === "join") {
        let game = global.moduleData.nonkydieu.get(threadID);
        if (!game || game.status !== "waiting") {
            api.sendMessage("⚠ Không có phòng game nào đang chờ!", threadID, messageID);
            return;
        }

        try {
            if (game.players.includes(senderID)) {
                api.sendMessage("⚠ Bạn đã tham gia rồi!", threadID, messageID);
                return;
            }

            if (game.players.length >= gameConfig.maxPlayers) {
                api.sendMessage(`⚠ Phòng đã đủ ${gameConfig.maxPlayers} người chơi!`, threadID, messageID);
                return;
            }

            const playerName = await Users.getNameUser(senderID);
            game.players.push(senderID);
            global.moduleData.nonkydieu.set(threadID, game);

            api.sendMessage(
                `👋 ${playerName} đã tham gia game! (${game.players.length}/${gameConfig.maxPlayers} người chơi)`,
                threadID, messageID
            );
        } catch (error) {
            console.error(error);
            api.sendMessage("❌ Đã xảy ra lỗi khi tham gia game!", threadID, messageID);
        }
        return;
    }

    if (body.toLowerCase() === "start") {
        let game = global.moduleData.nonkydieu.get(threadID);
        if (!game || game.status !== "waiting") {
            api.sendMessage("⚠ Không có phòng game nào đang chờ!", threadID, messageID);
            return;
        }

        if (game.players[0] !== senderID) {
            api.sendMessage("⚠ Chỉ chủ phòng mới có thể bắt đầu game!", threadID, messageID);
            return;
        }

        if (game.players.length < gameConfig.minPlayers) {
            api.sendMessage(`⚠ Cần tối thiểu ${gameConfig.minPlayers} người chơi để bắt đầu!`, threadID, messageID);
            return;
        }

        try {
            const Canvas = require("canvas");
            const fs = require("fs-extra");

            const category = game.category || Object.keys(gameConfig.categories)[Math.floor(Math.random() * Object.keys(gameConfig.categories).length)];
            const words = gameConfig.categories[category].words;
            game.word = words[Math.floor(Math.random() * words.length)];
            game.status = "playing";
            game.currentPlayer = game.players[0];
            game.rotation = 0;
            game.category = category;
            game.hasSpun = false;

            let canvas = Canvas.createCanvas(1200, 800);
            let ctx = canvas.getContext("2d");

            await drawGame(ctx, game, Users);

            const pathImg = __dirname + "/cache/nonkydieu_" + threadID + ".png";
            fs.writeFileSync(pathImg, canvas.toBuffer());

            const name = await Users.getNameUser(game.currentPlayer);
            api.sendMessage({
                body: "🎮 Game bắt đầu!\n" +
                `👉 Lượt của: ${name}\n` +
                `📝 Chủ đề: ${gameConfig.categories[category].name}\n` +
                `💡 Gợi ý: ${gameConfig.categories[category].hint}\n` +
                '💭 Chat "spin" hoặc "quay" để quay bánh xe!',
                attachment: fs.createReadStream(pathImg)
            }, threadID, (error, info) => {
                fs.unlinkSync(pathImg);

                global.client.handleReply.push({
                    name: "nonkydieu",
                    messageID: info.messageID,
                    author: game.currentPlayer,
                    type: "guess",
                    threadID: threadID,
                    wordToGuess: game.word,
                    currentPlayer: game.currentPlayer,
                    currentPoints: null,
                    players: game.players,
                    scores: {},
                    guessed: [],
                    rotation: 0,
                    category: category,
                    messageToUnsend: info.messageID 
                });

                game.messageToUnsend = info.messageID;
                global.moduleData.nonkydieu.set(threadID, game);
            }, messageID);

        } catch (error) {
            console.error(error);
            api.sendMessage("❌ Đã xảy ra lỗi khi bắt đầu game!", threadID, messageID);
            global.moduleData.nonkydieu.delete(threadID);
        }
        return;
    }

    if (body.toLowerCase() === "end") {
        let game = global.moduleData.nonkydieu.get(threadID);
        if (!game) {
            api.sendMessage("⚠ Không có game nào đang chạy!", threadID, messageID);
            return;
        }

        if (senderID !== game.players[0] && senderID !== game.currentPlayer) {
            api.sendMessage("⚠ Chỉ chủ phòng hoặc người đang chơi mới có thể kết thúc game!", threadID, messageID);
            return;
        }

        try {
            let msg = "🛑 Game đã kết thúc!\n";
            msg += `📝 Từ khóa là: ${game.word}\n\n`;

            const sortedPlayers = [...game.players]
            .sort((a, b) => (game.scores[b] || 0) - (game.scores[a] || 0));

            msg += "🏆 Bảng xếp hạng:\n";
            const medals = ["🥇", "🥈", "🥉"];

            for (let i = 0; i < sortedPlayers.length; i++) {
                const player = sortedPlayers[i];
                const name = await Users.getNameUser(player);
                const score = game.scores[player] || 0;
                msg += `${i < 3 ? medals[i]: `${i+1}.`} ${name}: ${score} điểm\n`;
            }

            api.sendMessage(msg, threadID, messageID);
            global.moduleData.nonkydieu.delete(threadID);
            return;
        } catch (error) {
            console.error(error);
            api.sendMessage("❌ Đã xảy ra lỗi khi kết thúc game!", threadID);
        }
        return;
    }

    let game = global.moduleData.nonkydieu?.get(threadID);
    if (!game || game.status !== "playing" || senderID !== game.currentPlayer) return;

    if (body.toLowerCase() === "spin" || body.toLowerCase() === "quay") {
        if (game.hasSpun) {
            api.sendMessage("⚠️ Bạn đã quay rồi! Hãy đoán chữ hoặc đợi lượt tiếp theo!", threadID, messageID);
            return;
        }

        try {
            const Canvas = require("canvas");
            const fs = require("fs-extra");

            const points = gameConfig.basePoints;
            const randomIndex = Math.floor(Math.random() * points.length);
            const randomPoint = points[randomIndex];

            const sectorsCount = points.length;
            const sectorAngle = (Math.PI * 2) / sectorsCount;
            const baseRotation = game.rotation || 0;
            const targetRotation = ((sectorsCount - randomIndex) * sectorAngle)
            + (Math.PI * 4)
            + (Math.random() * sectorAngle * 0.5);
            game.rotation = baseRotation + targetRotation;

            let nextPlayer = game.currentPlayer;
            let currentPoints = null;
            
            if (randomPoint === "Mất lượt") {
                const nextPlayerIndex = (game.players.indexOf(senderID) + 1) % game.players.length;
                nextPlayer = game.players[nextPlayerIndex];
                game.hasSpun = false;
            } else if (randomPoint === "Về 0") {
                if (!game.scores) game.scores = {};
                game.scores[senderID] = 0;
                currentPoints = 0;
                game.hasSpun = true;
            } else if (randomPoint === "x2") {
                if (!game.scores) game.scores = {};
                currentPoints = game.scores[senderID] || 0;
                game.hasSpun = true;
            } else {
                currentPoints = typeof randomPoint === "number" ? randomPoint : 0;
                game.hasSpun = true;
            }

            let canvas = Canvas.createCanvas(1200, 800);
            let ctx = canvas.getContext("2d");

            await drawGame(ctx, {
                ...game,
                currentPlayer: nextPlayer,
                currentPoints: currentPoints
            }, Users);

            const pathImg = __dirname + "/cache/nonkydieu_" + threadID + ".png";
            fs.writeFileSync(pathImg, canvas.toBuffer());

            const name = await Users.getNameUser(nextPlayer);
            let msg = "";

            if (randomPoint === "Mất lượt") {
                msg = `💫 Bạn quay trúng: Mất lượt!\n` +
                `👉 Đến lượt: ${name}\n` +
                `💭 Chat "spin" hoặc "quay" để quay bánh xe!`;
            } else {
                msg = `💫 Bạn quay được: ${randomPoint}\n` +
                `🎯 Hãy reply tin nhắn này để đoán chữ\n` +
                `💡 Gợi ý: ${gameConfig.categories[game.category]?.hint || "Không có gợi ý"}`;
            }

            api.unsendMessage(game.messageToUnsend);

            api.sendMessage({
                body: msg,
                attachment: fs.createReadStream(pathImg)
            }, threadID, (error, info) => {
                fs.unlinkSync(pathImg);

                global.client.handleReply.push({
                    name: "nonkydieu",
                    messageID: info.messageID,
                    author: nextPlayer,
                    type: "guess",
                    threadID: threadID,
                    wordToGuess: game.word,
                    currentPlayer: nextPlayer,
                    currentPoints: currentPoints,
                    players: game.players,
                    scores: game.scores,
                    guessed: game.guessed,
                    rotation: game.rotation,
                    category: game.category,
                    messageToUnsend: info.messageID
                });

                game.currentPlayer = nextPlayer;
                game.messageToUnsend = info.messageID;
                global.moduleData.nonkydieu.set(threadID, game);
            }, messageID);

        } catch (error) {
            console.error(error);
            api.sendMessage("❌ Đã xảy ra lỗi!", threadID);
        }
    }
};

module.exports.handleReply = async function({api, event, handleReply, Users, Currencies}) {
    const { threadID, messageID, senderID, body } = event;

    if (!handleReply || !handleReply.type || !handleReply.wordToGuess) {
        api.sendMessage("❌ Có lỗi xảy ra với handleReply!", threadID);
        return;
    }

    if (handleReply.type !== "guess" || senderID !== handleReply.currentPlayer) {
        api.sendMessage("⚠ Chưa đến lượt của bạn!", threadID);
        return;
    }

    if (body.toLowerCase() === "spin" || body.toLowerCase() === "quay") {
        return;
    }

    if (handleReply.currentPoints === null && handleReply.currentPoints !== 0) {
        api.sendMessage("⚠ Bạn cần quay trước khi đoán chữ!", threadID, messageID);
        return;
    }

    try {
        const Canvas = require("canvas");
        const fs = require("fs-extra");

        const guess = body.toUpperCase();

        if (!handleReply.guessed) handleReply.guessed = [];
        if (handleReply.guessed.includes(guess)) {
            api.sendMessage("⚠ Chữ này đã được đoán rồi!", threadID, messageID);
            return;
        }

        api.unsendMessage(handleReply.messageToUnsend);

        if (guess === handleReply.wordToGuess) {
    await Currencies.increaseMoney(senderID, this.config.envConfig.absoluteWinMoney);
    
    let canvas = Canvas.createCanvas(1200, 800);
    let ctx = canvas.getContext("2d");

    await drawVictoryScreen(ctx, senderID, handleReply.wordToGuess, handleReply.category, Users);

    const pathImg = __dirname + "/cache/nonkydieu_victory_" + threadID + ".png";
    fs.writeFileSync(pathImg, canvas.toBuffer());

    api.sendMessage({
        body: `🎊 CHIẾN THẮNG TUYỆT ĐỐI!\n` +
              `👑 Người chiến thắng: ${await Users.getNameUser(senderID)}\n` +
              `💰 Thưởng tuyệt đối: ${formatMoney(this.config.envConfig.absoluteWinMoney)}\n` +
              `🎯 Từ khóa: ${handleReply.wordToGuess}`,
        attachment: fs.createReadStream(pathImg)
    }, threadID, (error, info) => {
        fs.unlinkSync(pathImg);
        global.moduleData.nonkydieu.delete(threadID);
    });
    return;
}

        handleReply.guessed.push(guess);
        const occurrences = (handleReply.wordToGuess.match(new RegExp(guess, 'g')) || []).length;
        const correctGuess = occurrences > 0;

        let nextPlayer = senderID;
        let currentPoints = handleReply.currentPoints;

        if (correctGuess && (currentPoints || currentPoints === 0)) {
            if (!handleReply.scores) handleReply.scores = {};

            let points;
            if (handleReply.currentPoints === handleReply.scores[senderID]) {
                points = handleReply.currentPoints * 2;
                handleReply.scores[senderID] = points;

                let bonusMsg = `🎯 Chữ "${guess}" đúng!\n`;
                bonusMsg += `✨ Điểm của bạn được nhân đôi!\n`;
                bonusMsg += `💰 Điểm hiện tại: ${points} điểm\n`;
                bonusMsg += "🎲 Bạn được quay tiếp!";

                api.sendMessage(bonusMsg, threadID, messageID);
            } else {
                points = currentPoints * occurrences;
                handleReply.scores[senderID] = (handleReply.scores[senderID] || 0) + points;

                let bonusMsg = `🎯 Chữ "${guess}" xuất hiện ${occurrences} lần!\n`;
                if (occurrences > 1) {
                    bonusMsg += `✨ Nhân điểm x${occurrences}!\n`;
                }
                bonusMsg += `💰 +${points} điểm!\n`;
                bonusMsg += "🎲 Bạn được quay tiếp!";

                api.sendMessage(bonusMsg, threadID, messageID);
            }
            let game = global.moduleData.nonkydieu.get(threadID);
            if (game) {
                game.hasSpun = false;
                global.moduleData.nonkydieu.set(threadID, game);
            }
        } else {
            nextPlayer = handleReply.players[(handleReply.players.indexOf(senderID) + 1) % handleReply.players.length];
            currentPoints = null;
            let game = global.moduleData.nonkydieu.get(threadID);
            if (game) {
                game.hasSpun = false;
                game.currentPlayer = nextPlayer;
                global.moduleData.nonkydieu.set(threadID, game);
            }
        }

        let canvas = Canvas.createCanvas(1200, 800);
        let ctx = canvas.getContext("2d");

        const gameState = {
            word: handleReply.wordToGuess,
            players: handleReply.players,
            scores: handleReply.scores || {},
            currentPlayer: nextPlayer,
            guessed: handleReply.guessed,
            rotation: handleReply.rotation || 0,
            category: handleReply.category
        };

        await drawGame(ctx, gameState, Users);

        const pathImg = __dirname + "/cache/nonkydieu_" + threadID + ".png";
        fs.writeFileSync(pathImg, canvas.toBuffer());

        const won = !handleReply.wordToGuess.split('').filter(char => char !== ' ').some(char => !handleReply.guessed.includes(char));
        let msg = "";

        if (won) {
            const sortedPlayers = [...handleReply.players]
            .sort((a, b) => (handleReply.scores[b] || 0) - (handleReply.scores[a] || 0));

            // Thưởng cho người thắng cuối game
            const winner = sortedPlayers[0];
            await Currencies.increaseMoney(winner, this.config.envConfig.rewardMoney);
            const winnerName = await Users.getNameUser(winner);

            msg = "🎉 Trò chơi kết thúc!\n";
            msg += `📝 Từ khóa: ${handleReply.wordToGuess}\n`;
            msg += `🏆 Người chiến thắng: ${winnerName}\n`;
            msg += `💰 Thưởng: ${formatMoney(this.config.envConfig.rewardMoney)}\n\n`;
            msg += "🏆 Bảng xếp hạng:\n";

            for (let i = 0; i < sortedPlayers.length; i++) {
                const player = sortedPlayers[i];
                const name = await Users.getNameUser(player);
                const score = handleReply.scores[player] || 0;
                const medals = ["🥇", "🥈", "🥉"];
                msg += `${i < 3 ? medals[i]: `${i+1}.`} ${name}: ${score} điểm\n`;
            }
        } else {
            const currentPlayerName = await Users.getNameUser(nextPlayer);
            if (correctGuess) {
                msg = "✅ Đoán đúng!\n" +
                "👉 Bạn được quay tiếp!\n" +
                '💭 Chat "spin" hoặc "quay" để quay tiếp!';
            } else {
                msg = "❌ Rất tiếc!\n" +
                `👉 Đến lượt: ${currentPlayerName}\n` +
                '💭 Chat "spin" hoặc "quay" để quay bánh xe!';
            }
            msg += `\n\n💡 Gợi ý: ${gameConfig.categories[handleReply.category]?.hint || "Không có gợi ý"}`;
        }

        api.sendMessage({
            body: msg,
            attachment: fs.createReadStream(pathImg)
        }, threadID, (error, info) => {
            fs.unlinkSync(pathImg);

            if (!won) {
                global.client.handleReply.push({
                    name: "nonkydieu",
                    messageID: info.messageID,
                    author: nextPlayer,
                    type: "guess",
                    threadID: threadID,
                    wordToGuess: handleReply.wordToGuess,
                    currentPlayer: nextPlayer,
                    currentPoints: correctGuess ? currentPoints: null,
                    players: handleReply.players,
                    scores: handleReply.scores || {},
                    guessed: handleReply.guessed,
                    rotation: handleReply.rotation || 0,
                    category: handleReply.category,
                    messageToUnsend: info.messageID
                });

                let game = global.moduleData.nonkydieu.get(threadID);
                if (game) {
                    game.currentPlayer = nextPlayer;
                    game.guessed = handleReply.guessed;
                    game.scores = handleReply.scores || {};
                    game.messageToUnsend = info.messageID;
                    global.moduleData.nonkydieu.set(threadID, game);
                }
            } else {
                global.moduleData.nonkydieu.delete(threadID);
            }
        }, messageID);

    } catch (error) {
        console.error(error);
        api.sendMessage("❌ Đã xảy ra lỗi!", threadID);
    }
};

module.exports.run = async function({api, event, args, Users}) {
    const { threadID, messageID, senderID } = event;
    
    if (!global.moduleData) global.moduleData = {};
    if (!global.moduleData.nonkydieu) global.moduleData.nonkydieu = new Map();

    if (args[0]?.toLowerCase() === "category") {
        let msg = "📜 DANH SÁCH CHỦ ĐỀ 📜\n\n";
        for (const [key, category] of Object.entries(gameConfig.categories)) {
            msg += `${category.name}\n`;
            msg += `💭 Gợi ý: ${category.hint}\n`;
            msg += `🔧 Sử dụng: nonkydieu catset ${key}\n\n`;
        }
        api.sendMessage(msg, threadID);
        return;
    }

    if (args[0]?.toLowerCase() === "catset") {
        const category = args[1];
        if (!gameConfig.categories[category]) {
            api.sendMessage("❌ Chủ đề không hợp lệ! Dùng 'nonkydieu category' để xem danh sách.", threadID);
            return;
        }

        let game = global.moduleData.nonkydieu.get(threadID);
        if (!game || game.status !== "waiting") {
            api.sendMessage("⚠ Không có phòng game nào đang chờ!", threadID);
            return;
        }

        if (game.players[0] !== senderID) {
            api.sendMessage("⚠ Chỉ chủ phòng mới có thể chọn chủ đề!", threadID);
            return;
        }

        game.category = category;
        global.moduleData.nonkydieu.set(threadID, game);
        api.sendMessage(`📝 Đã chọn chủ đề: ${gameConfig.categories[category].name}`, threadID);
        return;
    }

    if (!args[0] || args[0].toLowerCase() === "create") {
        if (global.moduleData.nonkydieu.has(threadID)) {
            api.sendMessage("⚠ Đã có game đang chạy ở nhóm này!", threadID, messageID);
            return;
        }

        try {
            const playerName = await Users.getNameUser(senderID);
            global.moduleData.nonkydieu.set(threadID, {
                status: "waiting",
                players: [senderID],
                word: "",
                guessed: [],
                scores: {},
                currentPlayer: null,
                rotation: 0,
                hasSpun: false
            });

            api.sendMessage({
                body: "🎮 Game Chiếc Nón Kỳ Diệu\n\n" +
                `👑 Người tạo: ${playerName}\n\n` +
                "📜 Luật chơi:\n" +
                "1. Mỗi lượt chỉ được quay 1 lần\n" +
                "2. Chat spin/quay để quay bánh xe\n" +
                "3. Reply tin nhắn để đoán chữ\n" +
                "4. Đoán đúng được tiếp tục, sai mất lượt\n" +
                "5. Chữ xuất hiện nhiều lần sẽ được nhân điểm\n" +
                `6. Đoán trúng cả từ được thưởng ${formatMoney(this.config.envConfig.absoluteWinMoney)}\n` + 
                `7. Người thắng cuối game được thưởng ${formatMoney(this.config.envConfig.rewardMoney)}\n\n` +
                "👥 Chat để thực hiện lệnh:\n" +
                "join: Tham gia\n" +
                "start: Bắt đầu\n" +
                "end: Kết thúc\n" +
                "category: Xem danh sách chủ đề\n" +
                "catset: Đặt chủ đề\n"
            }, threadID, messageID);
        } catch (error) {
            console.error(error);
            api.sendMessage("❌ Đã xảy ra lỗi khi tạo game!", threadID);
        }
    }
};