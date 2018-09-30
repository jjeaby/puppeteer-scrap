const puppeteer = require('puppeteer');
const fs = require('fs');

// const lngDetector = new (require('languagedetect'));


const VIEWPORT = {width: 1028, height: 800, deviceScaleFactor: 2};


function mkdirSync(dirPath) {
    try {
        fs.mkdirSync(dirPath);
    } catch (err) {
        if (err.code !== 'EEXIST') {
            throw err;
        }

    }
}

function makeOutputFile(fileName) {
    fs.writeFileSync(fileName, '', (err) => {
        if (err) throw err;
        console.log(`The ${fileName} file has been saved!`);
    });
}

function isHangulCheck(text) {
    textLength = text.length;
    hangulCount = 0;

    text.split('').forEach(function (char) {
        c = char.charCodeAt(0);
        if (0x1100 <= c && c <= 0x11FF) hangulCount++;
        if (0x3130 <= c && c <= 0x318F) hangulCount++;
        if (0xAC00 <= c && c <= 0xD7A3) hangulCount++;

    })

    return hangulCount >= textLength / 2;


}


isHangulCheck("asdfadsf")

async function xpath(page, path) {
    const resultsHandle = await page.evaluateHandle(path => {
        let results = [];
        let query = document.evaluate(path, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (let i = 0, length = query.snapshotLength; i < length; ++i) {
            results.push(query.snapshotItem(i));
        }
        return results;
    }, path);
    const properties = await resultsHandle.getProperties();
    const result = [];
    const releasePromises = [];
    for (const property of properties.values()) {
        const element = property.asElement();
        if (element)
            result.push(element);
        else
            releasePromises.push(property.dispose());
    }
    await Promise.all(releasePromises);
    return result;
}

async function wordlistSplit(raw_text) {
    const wordListTextArray = []
    raw_text.split('\n').forEach(function (element) {
        element = element.replace(/\t/g, '').trim()
        if (element.length > 1) {
            wordListTextArray.push(element)
        }
    });
    return wordListTextArray;
}


async function wordSplit(raw_word) {
    const wordTextArray = [];
    raw_word.forEach(function (element) {
        element.split(/ |\(|\)/g).forEach(function (element) {
                element = element.trim();
                if (element.length > 1) {
                    wordTextArray.push(element);
                }
            }
        )

    });
    return wordTextArray;
}


async function run() {
    const browser = await puppeteer.launch({
        headless: true
    });
    const page = await browser.newPage();
    await page.setDefaultNavigationTimeout(3000)
    await page.setViewport(VIEWPORT);

    await page.tracing.start({path: 'trace.json', categories: ['devtools.timeline']})
    page.goto('https://terms.tta.or.kr/mobile/searchFirstList.do');


    // const categorys = ['ㄱ', 'ㄴ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ', '0']
    const categorys = ['0']

    for (index = 0; index < categorys.length; index++) {

        await page.waitForXPath('//a[@class=\'btn_intro\']')
        await page.evaluate(`javascript:fn_firstWord('${categorys[index]}')`);
        await page.waitForXPath('//a[@class=\'btn_intro\']')

        for (pageNum = 1; pageNum <= 293; pageNum++) {
            await page.evaluate(`javascript:fnNavigate(${pageNum});`);
            // await page.once('load', () => console.log('Page loaded!'));
            await page.waitForXPath('//a[@class=\'btn_intro\']')

            const handle = await xpath(page, '//ul[@class=\'word_list\']');
            const wordListText = await page.evaluate(e => e.textContent, handle[0]);

            const wordListTextArray = await wordlistSplit(wordListText);
            await wordSplit(wordListTextArray)
                .then(Array => `${Array.forEach(function (element) {
                    // console.log(element,isHangulCheck(element))
                    // console.log([isHangulCheck(element) ? "KO" : "EN", element])
                    if (element.length < 2) {
                        return;
                    }
                    element = element.replace(",", "");
                    if (isHangulCheck(element)) {
                        fs.appendFileSync('ttaDict/ttaDict_KO.txt', element + '\n', (err) => {
                            if (err) throw err;
                            console.log('The ttaDict/ttaDict_KO.txt file has been saved!');
                        });
                    } else {
                        fs.appendFileSync('ttaDict/ttaDict_EN.txt', element + '\n', (err) => {
                            if (err) throw err;
                            console.log('The ttaDict/ttaDict_EN.txt file has been saved!');
                        });
                    }
                })}`)
            // await page.screenshot({path: `screenshots/terms.tta.${pageNum}.png`});


        }

    }
    ;


    await page.tracing.stop();


    browser.close();
}

mkdirSync('screenshots');
mkdirSync('ttaDict');

makeOutputFile('ttaDict/ttaDict_KO.txt');
makeOutputFile('ttaDict/ttaDict_EN.txt');

run();

// console.log(lngDetector.detect('this is notebook',1))