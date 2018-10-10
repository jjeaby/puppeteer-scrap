'use strict';


const sleep = async function (milliseconds) {
    let start = new Date().getTime();
    for (let i = 0; i < 1e7; i++) {
        console.log(i);
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
};

const xPathToCss = function (xpath) {
    return xpath
        .replace(/\[(\d+?)\]/g, function(s,m1){ return '['+(m1-1)+']'; })
        .replace(/\/{2}/g, '')
        .replace(/\/+/g, ' > ')
        .replace(/@/g, '')
        .replace(/\[(\d+)\]/g, ':eq($1)')
        .replace(/^\s+/, '');
}

module.exports = {
    sleep,
    xPathToCss,

};
