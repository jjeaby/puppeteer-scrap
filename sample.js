require('dotenv').config()
var chromeBrowserPath =""
const exec = require("child_process").exec
exec("uname -a | grep 'armv'", (error, stdout, stderr) => {
 //do whatever here
        if( stdout != "") {
                chromeBrowserPath = process.env.RASPI_CHROME_BROWSER_PATH;
        } else {                 
                chromeBrowserPath = process.env.X86_CHROME_BROWSER_PATH; 

        }
})

 

const puppeteer = require('puppeteer');
(async () => {
        const browser = await puppeteer.launch({executablePath: chromeBrowserPath});
        const page = await browser.newPage();
        await page.goto('https://google.com');
        await page.screenshot({path: 'google.png'});
        await browser.close();
})();
