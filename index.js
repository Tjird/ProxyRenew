const request = require("request-promise");
const cron = require('node-cron');
const pool = require("./functions/rethinkdb");
const r = require("rethinkdb");
const roptions = require("./config.json").roptions;

cron.schedule('30 * * * *', () => {
    var today = new Date();
    var date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;
    console.log(dateTime);
    init(roptions);
})

async function init(a) {
    await clearTable();
    const data = await getProxyList(a);
    await insertProxies(data);
}

async function getProxyList(roptions) {
    var data = await request(roptions);
    data = data.split("\n");
    return data;
}

async function insertProxies(proxyList) {
    for (i = 0; i < proxyList.length; i++) {
        var length = proxyList[i].length - 3;
        pool.run(r.table("proxies").insert({ address: `${proxyList[i].substring(0, length)}` }));
    }
}

async function clearTable() {
    return await pool.run(r.table("proxies").delete());
}