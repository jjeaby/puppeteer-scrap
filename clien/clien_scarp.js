const util = require('../common/util');
require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs');

const execSync = require('child_process').execSync;
const uname = execSync('uname -a');


let chromeBrowserPath;
let headlessFlag = false;


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

        URL = process.env.CLIEN_PARK;



        try {
            // for (let pageNum = 1; pageNum <= 1684; pageNum++) {
            for (let pageNum = 0; pageNum <= 99999999999999; pageNum++) {
                const browser = await puppeteer.launch({
                    executablePath: chromeBrowserPath,
                    headless: headlessFlag,
                    args: ["--disable-notifications", "--disable-gpu", "--disable-glsl-translator", "--disable-translate-new-ux"],
                    networkIdleTimeout: 25000,
                    timeout: 3000000
                });

                const page = await browser.newPage();
                if (VIEWPORT) {
                    await page.setViewport(VIEWPORT);
                }
                await page.tracing.start({path: 'trace.json', categories: ['devtools.timeline']})


                let screenShotName = URL.replace("https://", "").replace("http://", "").replace(/\//g, ".",);
                console.log(screenShotName);

                await page.goto(URL);
                await util.wait(page, '//div[@class=\'board_head\']/div[@class=\'board_name\']/h2/a');
                // await page.screenshot({path: screenShotName + '-start.png'});


                await page.goto(URL + '&po=' + pageNum);

                // let date = await util.getText(page, '#div_content > div:nth-child(8) > div.list_time > span > span');
                let date = await util.getText(page, '//*[@id="div_content"]/div[7]/div[5]/span/span');
                date = date.split(' ');
                console.log(date[0] + ' ' + util.getYesterdayDate().replace(/\./g, '-'));
                // if (date[0] !== util.getYesterdayDate().replace(/\./g,'-')) {
                //     break;
                // }
                if (date[0] === '2017-12-31') {
                    break;
                }


                for (let index = 1; index <= 30; index++) {
                    console.log(pageNum + "-" + index);

                    let date = await util.getText(page, '//*[@id="div_content"]/div[7]/div[5]/span/span');
                    date = date.split(' ');
                    console.log(date[0] + ' ' + util.getYesterdayDate().replace(/\./g, '-'));
                    // if (date[0] !== util.getYesterdayDate().replace(/\./g,'-')) {
                    //     break;
                    // }
                    if (date[0] === '2017-12-31') {
                        break;
                    }


                    let selectLine = index + 6;
                    try {
                        await page.click('#div_content > div:nth-child(' + selectLine + ') > div.list_title > a > span');
                    } catch (e) {
                        continue;
                    }
                    await util.sleep(1000);
                    await util.wait(page, '//*[@id="div_content"]/div[4]/div[2]/article/div');

                    let articletText = await util.getText(page, '//*[@id="div_content"]/div[4]/div[2]/article/div');

                    let saveText = util.removeUnnecessaryChar(articletText);
                    saveText.forEach(function (saveText) {
                        if (saveText.trim().length > 0) {
                            util.writeFile('clien_' + date[0] + '.txt', saveText, 'a');
                        }
                    });
                    //console.log(date + ' ' + articletText)
                    // await page.goBack();
                    await page.goto(URL + '&po=' + pageNum);


                }

                // await util.sleep(5000);
                // await page.screenshot({path: screenShotName + '-end.png'});
                await browser.close();

            }
        } catch (e) {
            console.log(e);
            // await page.screenshot({path: screenShotName + '-end.png'});
            await browser.close();
        }

    }


)();
