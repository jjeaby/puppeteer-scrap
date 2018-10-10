const util = require('../common/util');
require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');

const execSync = require('child_process').execSync;
const uname = execSync('uname -a');
const armCheck = uname.indexOf("arm");

let chromeBrowserPath;
let headlessFlag = false;

const startUrl = process.env.URL;
const id = process.env.ID;
const password = process.env.PASSWORD;

let screenShotName = startUrl.replace("https://", "").replace(/\//g, ".",);

console.log(screenShotName);

const VIEWPORT = {width: 1280, height: 1024, deviceScaleFactor: 2};

if (armCheck > -1) {
    chromeBrowserPath = process.env.RASPI_CHROME_BROWSER_PATH;
    headlessFlag = true;

} else {
    chromeBrowserPath = process.env.X86_CHROME_BROWSER_PATH;
    headlessFlag = false;
}


async function xpath(page, xpath) {
    const linkHandlers = await page.$x(xpath);

    if (linkHandlers.length > 0) {
        return linkHandlers[0];
    } else {
        return undefined;
    }
};


(async () => {
    const browser = await puppeteer.launch({
        executablePath: chromeBrowserPath,
        headless: headlessFlag,
        args: ["--disable-notifications"]
    });

    const page = await browser.newPage();
    if (VIEWPORT) {
        await page.setViewport(VIEWPORT);
    }
    await page.tracing.start({path: 'trace.json', categories: ['devtools.timeline']})
    await page.goto(startUrl);

    await page.waitForXPath('//*[@id="account-bar-login-register"]/a[1]/div');
    await page.screenshot({path: screenShotName + '.png'});

    await page.waitForSelector('#account-bar-login-register > a.login-popup > div');
    let btn_login_open = await xpath(page, '//*[@id="account-bar-login-register"]/a[1]/div');


    await btn_login_open.click();
    let input_email = await xpath(page, '//div[@class=\'respoPage\']/div[@id=\'page\']//input[@id=\'email\']');


    await input_email.type(id);
    let input_password = await xpath(page, '//div[@class=\'respoPage\']/div[@id=\'page\']//input[@id=\'password\']');

    await input_password.type(password);
    let btn_login = await xpath(page, '//div[@id=\'account-bar-form-login\']//input[@id=\'edit-submit-1\']');
    await page.waitForXPath('//div[@id=\'account-bar-form-login\']//input[@id=\'edit-submit-1\']');

    await btn_login.click();
    let btn_claim = util.xPathToCss('//input[@id=\'free-learning-claim\']');
    await page.waitForSelector(btn_claim);
    await page.click(btn_claim);
    await page.screenshot({path: screenShotName + '-end.png'});

    await browser.close();
})();
