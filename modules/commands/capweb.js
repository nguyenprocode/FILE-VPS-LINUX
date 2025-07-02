const { createReadStream, unlinkSync, existsSync } = require('fs-extra');
const puppeteer = require('puppeteer');
const { resolve } = require('path');

module.exports = {
    config: {
        name: 'cap',
        version: '1.0.8',
        hasPermssion: 1,
        credits: 'Satoru',
        description: 'Chụp wall hoặc web nào đó',
        usePrefix: true,
        usages: [
            'cap : Chụp wall của bạn',
            'cap <reply>: Chụp wall người bạn reply',
            'cap <tag>: Chụp wall người bạn tag',
            'cap <link>: Chụp wall web',
        ],
        cooldowns: 5,
        commandCategory: 'Quản trị viên',
        dependencies: {
            puppeteer: '',
            'fs-extra': '',
        },
    },
    run: async function ({ api, event, args, Users }) {
        const path = resolve(__dirname, 'cache', `cap${event.threadID}_${event.senderID}.png`);
        
        try {
            let uid;
            if (!args[0] || event.type == 'message_reply' || Object.keys(event.mentions).length !== 0) {
                if (!args[0]) uid = event.senderID;
                if (event.type == 'message_reply') uid = event.messageReply.senderID;
                if (Object.keys(event.mentions).length !== 0) uid = Object.keys(event.mentions)[0];

                const browser = await puppeteer.launch({ 
                    headless: true, 
                    args: [
                        '--no-sandbox',
                        '--disable-notifications',
                        '--disable-features=site-per-process',
                        '--window-size=1280,1280'
                    ]
                });
                
                const page = await browser.newPage();
                
                await page.setViewport({ 
                    width: 1280, 
                    height: 1280,
                    deviceScaleFactor: 1
                });

                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

                await page.evaluateOnNewDocument(() => {
                    window.Notification = undefined;
                    navigator.serviceWorker = undefined;
                    window.alert = () => {};
                    window.confirm = () => true;
                    window.prompt = () => null;
                });

                api.sendMessage('🔄 Đang tải...', event.threadID, event.messageID);

                const getAppState = api.getAppState();
                const cookies = getAppState.map(a => ({
                    name: a.key,
                    value: a.value,
                    domain: `.${a.domain}`,
                    path: a.path,
                    httpOnly: a.hostOnly,
                    sameSite: 'None',
                    secure: true,
                    sameParty: false,
                    sourceScheme: 'Secure',
                    sourcePort: 443,
                }));
                await page.setCookie(...cookies);

                await page.goto(`https://www.facebook.com/profile.php?id=${uid}`, { 
                    waitUntil: 'networkidle0',
                    timeout: 30000
                });

                // Đợi trang load
                await new Promise(resolve => setTimeout(resolve, 2000));

                // Xóa các phần tử gây nhiễu và scroll qua ảnh bìa
                await page.evaluate(() => {
                    const removeElements = [
                        '[role="dialog"]',
                        '[aria-role="dialog"]',
                        '.fixed',
                        '[style*="position: fixed"]',
                        '[role="banner"]',
                        '[role="navigation"]',
                        '#ssrb_top_nav_end',
                        '[aria-label="Điều hướng cố định"]',
                        'div[style*="position: fixed"]',
                        '[data-pagelet="ProfileActions"]',
                        'div[role="complementary"]'
                    ];
                    
                    removeElements.forEach(selector => {
                        document.querySelectorAll(selector).forEach(el => el.remove());
                    });

                    // Ẩn tất cả các phần tử cố định
                    const style = document.createElement('style');
                    style.textContent = `
                        *[style*="position: fixed"],
                        *[style*="position:fixed"],
                        .fixed {
                            display: none !important;
                        }
                    `;
                    document.head.appendChild(style);

                    // Scroll qua ảnh bìa
                    window.scrollTo(0, 350);
                });

                // Đợi scroll hoàn tất
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Cuộn xuống để load thêm nội dung
                await page.evaluate(async () => {
                    await new Promise((resolve) => {
                        let totalHeight = 0;
                        const distance = 100;
                        const timer = setInterval(() => {
                            window.scrollBy(0, distance);
                            totalHeight += distance;

                            if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
                                clearInterval(timer);
                                resolve();
                            }
                        }, 100);
                    });
                });

                // Đợi load nội dung
                await new Promise(resolve => setTimeout(resolve, 1000));

                // Quay lại vị trí sau ảnh bìa
                await page.evaluate(() => {
                    window.scrollTo(0, 350);
                });

                await new Promise(resolve => setTimeout(resolve, 500));

                // Chụp toàn bộ trang từ vị trí hiện tại
                const screenshot = await page.screenshot({
                    fullPage: true,
                    path: path
                });

                await browser.close();

                return api.sendMessage(
                    {
                        body: `✅ Đã xong ${(await Users.getData(event.senderID)).name}`,
                        mentions: [{
                            tag: (await Users.getData(event.senderID)).name,
                            id: event.senderID,
                        }],
                        attachment: createReadStream(path),
                    },
                    event.threadID,
                    () => existsSync(path) && unlinkSync(path),
                    event.messageID
                );
            }

            // Xử lý URL
            if (args[0].indexOf('https://') !== -1) {
                const browser = await puppeteer.launch({ 
                    headless: true, 
                    args: [
                        '--no-sandbox',
                        '--disable-notifications',
                        '--disable-features=site-per-process',
                        '--window-size=1280,1280'
                    ]
                });
                
                const page = await browser.newPage();
                
                await page.setViewport({ 
                    width: 1280, 
                    height: 1280,
                    deviceScaleFactor: 1
                });

                await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

                await page.evaluateOnNewDocument(() => {
                    window.Notification = undefined;
                    navigator.serviceWorker = undefined;
                    window.alert = () => {};
                    window.confirm = () => true;
                    window.prompt = () => null;
                });
                
                api.sendMessage('🔄 Đang tải...', event.threadID, event.messageID);

                if (args[0].includes('facebook.com')) {
                    const getAppState = api.getAppState();
                    const cookies = getAppState.map(a => ({
                        name: a.key,
                        value: a.value,
                        domain: `.${a.domain}`,
                        path: a.path,
                        httpOnly: a.hostOnly,
                        sameSite: 'None',
                        secure: true,
                        sameParty: false,
                        sourceScheme: 'Secure',
                        sourcePort: 443,
                    }));
                    await page.setCookie(...cookies);

                    await page.goto(args[0], { 
                        waitUntil: 'networkidle0',
                        timeout: 30000
                    });

                    // Xử lý tương tự như profile Facebook
                    await new Promise(resolve => setTimeout(resolve, 2000));

                    await page.evaluate(() => {
                        const removeElements = [
                            '[role="dialog"]',
                            '[aria-role="dialog"]',
                            '.fixed',
                            '[style*="position: fixed"]',
                            '[role="banner"]',
                            '[role="navigation"]',
                            '#ssrb_top_nav_end',
                            'div[role="complementary"]'
                        ];
                        
                        removeElements.forEach(selector => {
                            document.querySelectorAll(selector).forEach(el => el.remove());
                        });

                        const style = document.createElement('style');
                        style.textContent = `
                            *[style*="position: fixed"],
                            *[style*="position:fixed"],
                            .fixed {
                                display: none !important;
                            }
                        `;
                        document.head.appendChild(style);

                        window.scrollTo(0, 350);
                    });

                    await new Promise(resolve => setTimeout(resolve, 1000));

                    await page.evaluate(async () => {
                        await new Promise((resolve) => {
                            let totalHeight = 0;
                            const distance = 100;
                            const timer = setInterval(() => {
                                window.scrollBy(0, distance);
                                totalHeight += distance;

                                if (totalHeight >= document.body.scrollHeight - window.innerHeight) {
                                    clearInterval(timer);
                                    resolve();
                                }
                            }, 100);
                        });
                    });

                    await new Promise(resolve => setTimeout(resolve, 1000));

                    await page.evaluate(() => {
                        window.scrollTo(0, 350);
                    });

                    await new Promise(resolve => setTimeout(resolve, 500));
                }

                // Chụp ảnh
                const screenshot = await page.screenshot({
                    fullPage: true,
                    path: path
                });

                await browser.close();

                return api.sendMessage(
                    {
                        body: `✅ Đã xong ${(await Users.getData(event.senderID)).name}`,
                        mentions: [{
                            tag: (await Users.getData(event.senderID)).name,
                            id: event.senderID,
                        }],
                        attachment: createReadStream(path),
                    },
                    event.threadID,
                    () => existsSync(path) && unlinkSync(path),
                    event.messageID
                );
            }

        } catch (e) {
            console.log(e);
            api.sendMessage('❌ Đã xảy ra lỗi!', event.threadID, event.messageID);
            if (existsSync(path)) unlinkSync(path);
        }
    },
};