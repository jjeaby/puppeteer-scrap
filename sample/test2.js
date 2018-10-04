const puppeteer = require('puppeteer');
(async () => {
        const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});
        const page = await browser.newPage();
        await page.goto('https://google.com');
        await page.screenshot({path: 'google.png'});
        await browser.close();
})();
