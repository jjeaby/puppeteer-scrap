const util = require('../common/util');
require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');

const execSync = require('child_process').execSync;
const uname = execSync('uname -a');


let chromeBrowserPath;
let headlessFlag = false;

const etnewsUrl = process.env.ETNEWS_03_URL;
let screenShotName = etnewsUrl.replace("https://", "").replace("http://", "").replace(/\//g, ".",);
console.log(screenShotName);

const VIEWPORT = {width: 1280, height: 1024, deviceScaleFactor: 2};

if (uname.indexOf("arm") > -1) {
    chromeBrowserPath = process.env.RASPI_CHROME_BROWSER_PATH;
    headlessFlag = true;
}
else if (uname.indexOf("Darwin") > -1) {
    chromeBrowserPath = process.env.DARWIN_CHROME_BROWSER_PATH;
    headlessFlag = false;
}
else {
    chromeBrowserPath = process.env.LINUX_CHROME_BROWSER_PATH;
    headlessFlag = false;
}


(async () => {
        const browser = await puppeteer.launch({
            executablePath: chromeBrowserPath,
            headless: headlessFlag,
            args: ["--disable-notifications"],
            timeout: 200000,
        });

        const page = await browser.newPage();
        if (VIEWPORT) {
            await page.setViewport(VIEWPORT);
        }
        await page.tracing.start({path: 'trace.json', categories: ['devtools.timeline']})
        await page.goto(etnewsUrl);

        // util.writeFile('output_dongait.txt', '', 'w');

        //page.on('console', util.logRequest);
        await util.wait(page, '//div[@class=\'list_wrap\']/ul[@class=\'list_news\']/li[1]//a');
        await page.screenshot({path: screenShotName + '-start.png'});
        try {
            // for (let pageNum = 1; pageNum <= 1684; pageNum++) {
            for (let pageNum = 1; pageNum <= 94; pageNum++) {
                await page.goto('http://www.etnews.com/news/section.html?id1=03&page=' + pageNum)
                await page.goto(etnewsUrl + '&page=' + pageNum);

                let date = await util.getText(page, '//div[@class=\'list_wrap\']/ul[@class=\'list_news\']/li[1]//dd[@class=\'date\']/span[2]');
                if (date.toString().split(" ")[0] !== util.getYesterdayDate()) {
                    break;
                }

                for (let index = 1; index <= 15; index++) {

                    if (index < 5 || index > 9) {

                        console.log(pageNum + "-" + index);

                        let date = await util.getText(page, '//div[@class=\'list_wrap\']/ul[@class=\'list_news\']/li[' + index + ']//dd[@class=\'date\']/span[2]');
                        if (date.toString().split(" ")[0] !== util.getYesterdayDate()) {
                            break;
                        }
                        // await util.click(page, '//ul[@class=\'list_news\']/li[' + index + ']/dl//a');
                        await page.click('ul.list_news > li:nth-of-type(' + index + ') > dl a')
                        await util.wait(page, '//article/section[@id=\'articleBody\']/p');

                        let articletText = await util.getText(page, '//article/section[@id=\'articleBody\']/p');
                        util.writeFile('etnews_output.txt', articletText, 'a');
                        //console.log(date + ' ' + articletText)
                        await page.goBack();
                    }
                }
                //await util.click(page, '//li[@class=\'next\']/a')


            }

            await util.sleep(5000);
            await page.screenshot({path: screenShotName + '-end.png'});
            await browser.close();
        } catch (e) {
            console.log(e);
            await page.screenshot({path: screenShotName + '-end.png'});
            await browser.close();
        }
    }
)();
