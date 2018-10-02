require('dotenv').config()
const puppeteer = require('puppeteer');
const fs = require('fs');


const execSync = require('child_process').execSync;
const uname = execSync('uname -a');
const armCheck = uname.indexOf("arm");

let chromeBrowserPath;
let headlessFlag = false;

const startUrl = "https://transliterator.herokuapp.com/"
const screenShotName = startUrl.replace("https://", "").replace("/", ".",);


let ReadArray = fs.readFileSync('input.txt').toString().split("\n");
let writeStream = fs.createWriteStream('output.txt');


console.log(screenShotName);

const VIEWPORT = {width: 1280, height: 1024, deviceScaleFactor: 2};


if (armCheck > -1) {
    chromeBrowserPath = process.env.RASPI_CHROME_BROWSER_PATH;
    headlessFlag = true;

} else {
    chromeBrowserPath = process.env.X86_CHROME_BROWSER_PATH;
    headlessFlag = false;
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds){
            break;
        }
    }
}

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
    await page.goto(startUrl);
    await page.screenshot({path: screenShotName + '.png'});
    await page.waitForSelector('#user-input');



    fs.writeFileSync('output.txt')

    for (i in ReadArray) {

        await page.focus('#user-input');
        await page.keyboard.type(ReadArray[i]);

        await page.click('html body div.container.col-md-6.col-md-offset-3 div.row form#form.col-sm-6 div.form-group input.btn.btn-primary.btn-block');
        await page.waitForFunction('document.querySelector("#user-input").textContent.length == 0');
        const text = await page.evaluate(() => document.querySelector('#output').textContent);

        const flag = await page.evaluate(() => document.querySelector('#input > small'));

        if( flag === null && text.length > 1 ) {
            writeStream.write(text + "\n");
        }
        sleep(4000);

    }
    writeStream.end();
    ReadArray.end();

    await browser.close();
})();
