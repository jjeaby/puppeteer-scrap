require('dotenv').config()
var chromeBrowserPath = "";
var headlessFlag = false;

const execSync = require('child_process').execSync;
const uname = execSync('uname -a');
const armCheck = uname.indexOf("arm");

const VIEWPORT = {width: 1280, height: 1024, deviceScaleFactor: 2};


if (armCheck > -1) {
    chromeBrowserPath = process.env.RASPI_CHROME_BROWSER_PATH;
    headlessFlag = true;

} else {
    chromeBrowserPath = process.env.X86_CHROME_BROWSER_PATH;
    headlessFlag = false;
}

console.log(armCheck, chromeBrowserPath)

const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({
        executablePath: chromeBrowserPath,
        headless: headlessFlag
    });

    const page = await browser.newPage();
    if (VIEWPORT) {
        await page.setViewport(VIEWPORT);
    }
    await page.tracing.start({path: 'trace.json', categories: ['devtools.timeline']})
    await page.goto('https://www.naver.com/');
    await page.screenshot({path: 'naver.png'});
    await browser.close();
})();
