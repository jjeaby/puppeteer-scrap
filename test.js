const puppeteer = require('puppeteer');

(async () => {
//  const browser = await puppeteer.launch();
        const browser = await puppeteer.launch({executablePath: '/usr/bin/chromium-browser'});

  const page = await browser.newPage();
  await page.goto('https://clien.net');

  const textContent = await page.evaluate(() => document.querySelector('#div_content > div.contents_main > div.section_list.recommended').textContent);
  const innerText = await page.evaluate(() => document.querySelector('#div_content > div.contents_main > div.section_list.recommended').innerText);

  console.log(textContent);
  console.log(innerText);

  browser.close();
})();
