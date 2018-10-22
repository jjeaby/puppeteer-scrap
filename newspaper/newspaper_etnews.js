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

        etnewsUrlList = [ process.env.ETNEWS_02_URL, process.env.ETNEWS_03_URL, process.env.ETNEWS_20_URL ];

        // etnewsUrlList.forEach( async function(URL) {
        for( let i=0; i<etnewsUrlList.length; i++) {
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


            let URL = etnewsUrlList[i];
            let screenShotName = URL.replace("https://", "").replace("http://", "").replace(/\//g, ".",);
            console.log(screenShotName);

            await page.goto(URL);

            // util.writeFile('output_dongait.txt', '', 'w');

            //page.on('console', util.logRequest);
            await util.wait(page, '//div[@class=\'list_wrap\']/ul[@class=\'list_news\']/li[1]//a');
            await page.screenshot({path: screenShotName + '-start.png'});
            try {
                // for (let pageNum = 1; pageNum <= 1684; pageNum++) {
                for (let pageNum = 1; pageNum <= 195; pageNum++) {
                    await page.goto(URL + '&page=' + pageNum);

                    let date = await util.getText(page, '//div[@class=\'list_wrap\']/ul[@class=\'list_news\']/li[1]//dd[@class=\'date\']/span[2]');
                    if (date.toString().split(" ")[0] !== util.getYesterdayDate()) {
                        // console.log(URL.indexOf('?id1=02'));
                        //if( URL.indexOf('?id1=20') <= 0 ) break;
                        break;
                    }

                    for (let index = 1; index <= 15; index++) {

                        if (index < 5 || index > 9) {

                            console.log(pageNum + "-" + index);

                            let date = await util.getText(page, '//div[@class=\'list_wrap\']/ul[@class=\'list_news\']/li[' + index + ']//dd[@class=\'date\']/span[2]');
                            if (date.toString().split(" ")[0] !== util.getYesterdayDate()) {
                                // console.log(URL.indexOf('?id1=02'));
                                //if( URL.indexOf('?id1=20') <= 0 ) break;
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


    }
)();
