const util = require('../common/util');
require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');

const execSync = require('child_process').execSync;
const uname = execSync('uname -a');
const armCheck = uname.indexOf("arm");

let chromeBrowserPath;
let headlessFlag = false;

const dongaItIURL = process.env.DONGAIT_URL;
let screenShotName = dongaItIURL.replace("https://", "").replace("http://", "").replace(/\//g, ".",);
console.log(screenShotName);

const VIEWPORT = {width: 1280, height: 1024, deviceScaleFactor: 2};

if (armCheck > -1) {
    chromeBrowserPath = process.env.RASPI_CHROME_BROWSER_PATH;
    headlessFlag = true;
} else {
    chromeBrowserPath = process.env.X86_CHROME_BROWSER_PATH;
    headlessFlag = false;
}


(async () => {
        const browser = await puppeteer.launch({
            executablePath: chromeBrowserPath,
            headless: headlessFlag,
            args: ["--disable-notifications"],
            timeout: 100000,
        });

        const page = await browser.newPage();
        if (VIEWPORT) {
            await page.setViewport(VIEWPORT);
        }
        await page.tracing.start({path: 'trace.json', categories: ['devtools.timeline']})
        await page.goto(dongaItIURL);

        util.writeFile('output_dongait.txt', '', 'w');

        //page.on('console', util.logRequest);
        await util.wait(page, '//header[@class=\'contents\']/nav[@class=\'skin\']/button[@class=\'btn\']');
        await page.screenshot({path: screenShotName + '-start.png'});
        try {
            // for (let pageNum = 1; pageNum <= 1684; pageNum++) {
            for (let pageNum = 1; pageNum <= 1684; pageNum++) {

                let date = await util.getText(page, '//li[@class=\'li1\']/a/span[@class=\'intro\']/time');

                // if (date.toString().split(" ")[0] !== '어제') {
                //     break;
                // }

                for (let index = 1; index <= 10; index++) {
                    let date = await util.getText(page, '//li[@class=\'li' + index + '\']/a/span[@class=\'intro\']/time');
                    // if (date.toString().split(" ")[0] !== '어제') {
                    //     break;
                    // }

                    await util.click(page, '//li[@class=\'li' + index + '\']/a');
                    await util.wait(page, '//div[@class=\'base\']');

                    let articletText = await util.getText(page, '//*[@id="contents"]/article/p');
                    util.writeFile('output_dongait.txt', articletText, 'a');

                    await page.goBack();
                }
                await util.click(page, '//li[@class=\'next\']/a')
            }

            await util.sleep(5000);
            await page.screenshot({path: screenShotName + '-end.png'});
            await browser.close();
        } catch (e) {
            await page.screenshot({path: screenShotName + '-end.png'});
            await browser.close();
        }
    }
)();
