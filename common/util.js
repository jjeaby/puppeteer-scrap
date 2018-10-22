'use strict';
const xPathToCss = require('xpath-to-css');
const fs = require('fs');

const sleep = async function (milliseconds) {
    let start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
};

const getDate = function () {

    let date = new Date,
        year = date.getFullYear(),
        month = (date.getMonth() + 1).toString(),
        formatedMonth = (month.length === 1) ? ("0" + month) : month,
        day = date.getDate().toString(),
        formatedDay = (day.length === 1) ? ("0" + day) : day;
    return year + "." + formatedMonth + "." + formatedDay;

};

const getYesterdayDate = function () {
    let date = new Date();
    date.setDate(date.getDate() - 1);

    let year = date.getFullYear();
    let month = (date.getMonth() + 1).toString();
    let formatedMonth = (month.length === 1) ? ("0" + month) : month;
    let day = date.getDate().toString();
    let formatedDay = (day.length === 1) ? ("0" + day) : day;

    return year + "." + formatedMonth + "." + formatedDay;

};

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
};



// const xPathToCss = function (xpath) {
//     return xpath
//         .replace(/\[(\d+?)\]/g, function (s, m1) {
//             return '[' + (m1 - 1) + ']';
//         })
//         .replace(/\/{2}/g, '')
//         .replace(/\/+/g, ' > ')
//         .replace(/@/g, '')
//         .replace(/\[(\d+)\]/g, ':eq($1)')
//         .replace(/^\s+/, '');
// };

const click = async function (page, xpath) {
    let element = await this.wait(page, xpath);
    await page.click(element);
};

const wait = async function (page, xpath) {
    const selector = xPathToCss(xpath);
    console.log(selector);
    await page.waitForSelector(selector, {timeout: 100000});
    return selector;
};

const getText = async function (page, xpath) {
    const element = await this.wait(page, xpath);
    console.log(element);
    const text = await page.evaluate((element) => document.querySelector(element).textContent, element);
    return text;

};

const writeFile = function (filename, text, mode) {
    let wstream = fs.createWriteStream(filename, {encoding: 'utf-8', 'flags': mode});
    wstream.write(text + '\n');
    //console.log(text);
    wstream.end();


};

// -------------------------------------------------------------
const getElementByXpath = async function (page, xpath) {

    await page.evaluate((target) => {

        const results = [];
        const query = document.evaluate(
            target, document, null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null,
        );

        for (let i = 0; i < query.snapshotLength; i += 1) {
            try {
                const el = query.snapshotItem(i);
                // Visable check
                const rect = el.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.left >= 0) {
                    results.push(el)
                }
            } catch (error) {
                console.log(error.toString())
            }
        }
        console.log("ASB:" + results[0]);
    }, xpath);
};


function logRequest(interceptedRequest) {
    let interceptedRequestData = interceptedRequest._text.split(':');
    console.log(interceptedRequestData[1]);
}

module.exports = {
    sleep,
    xPathToCss,
    click,
    wait,
    getText,
    writeFile,
    getRandomInt,
    getDate,
    getYesterdayDate,
    getElementByXpath,
    logRequest

};
