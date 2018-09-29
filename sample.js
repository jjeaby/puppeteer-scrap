require('dotenv').config()
var chromeBrowserPath =""

const execSync = require('child_process').execSync;
const uname = execSync('uname -a');
const armCheck = uname.indexOf("arm");

if( armCheck > -1 ) {
        chromeBrowserPath = process.env.RASPI_CHROME_BROWSER_PATH       
} else {
        chromeBrowserPath = process.env.X86_CHROME_BROWSER_PATH; 
}

console.log(armCheck, chromeBrowserPath)

const puppeteer = require('puppeteer');
(async () => {
        const browser = await puppeteer.launch({executablePath: chromeBrowserPath});
        const page = await browser.newPage();
        await page.goto('https://google.com');
        await page.screenshot({path: 'google.png'});
        await browser.close();
})();
