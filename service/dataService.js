let tmpConfigService = require('./tmpConfigService.js');
let config = require('../common/config.js');
let bent = require('bent');
let fs = require('fs');
let db = require('../service/mongodbService.js');
let shell = require('../common/shellHelper.js');
var compressing = require('compressing');
const post = bent(config.serverPath, 'POST', 'json', 200);
const getBuffer = bent('buffer')
let mongo = config.mongo;
let a, b, c, d; //避免方法重复执行状态控制

async function runSubmit(tmpConfig, startTime) {
    if (!db.state()) return;
    if (a) return;
    a = true;
    console.log('开始提交处理。。。');
    if (!startTime) {
        //查询数据库最后一条数据的时间
        let last = await db.last('statements');
        startTime = last ? last.stored.getTime() : '';
    }
    let endTime = Date.now();
    const res = await post('/bak/submit', {startTime, endTime});
    console.log('请求结果：', res);
    if (res.code === 0) {
        console.log('提交任务成功。');
        tmpConfig.uuid = res.uuid;
        tmpConfig.time = endTime;
        tmpConfig.state = 'submit';
        tmpConfigService.saveConfig();
    }
    a = false;
}

async function runDownload(tmpConfig) {
    if (b) return;
    b = true;
    console.log('检测服务端任务状态。。。', tmpConfig.uuid);
    const res = await post('/bak/check', {uuid: tmpConfig.uuid});
    console.log('请求结果：', res);
    if (res.code === 0 && res.path) {
        console.log('服务端任务完成，准备下载。。。');
        let buffer = await getBuffer(config.serverPath + res.path);
        fs.writeFileSync('./datas/' + tmpConfig.uuid + ".zip", buffer);
        console.log('下载成功，写入文件成功。');
        tmpConfig.state = 'download';
        tmpConfigService.saveConfig();
    }
    b = false;
}

async function runImport(tmpConfig) {
    if (c) return 0;
    c = true;
    console.log('开始处理并导入数据。。。', tmpConfig.uuid);
    //解压
    let zipFilename = './datas/' + tmpConfig.uuid + ".zip";
    await compressing.zip.uncompress(zipFilename, './datas');
    console.log('解压数据包成功，读取数据包。。。');
    let pkgConfigJson = fs.readFileSync('./datas/tmp/config.json', 'utf-8');
    console.log(pkgConfigJson);
    let pakConfig = JSON.parse(pkgConfigJson);
    console.log('开始导入。。。');
    for (let i = 0, ci; ci = pakConfig.data[i]; i++) {
        console.log('正在导入：', ci.table, '，数量', ci.count);
        let args = [
            '--host', mongo.host,
            '-d', mongo.database,
            '-c', ci.table,
            '--file', "./datas/tmp/data/" + ci.files[0],
        ];
        if (mongo.username) {
            args.push('-u')
            args.push(mongo.username)
        }
        if (mongo.password) {
            args.push('-p')
            args.push(mongo.password)
        }
        await shell.run('mongoimport', args)
    }
    //导入成功
    tmpConfig.state = 'import';
    tmpConfigService.saveConfig();
    c = false;
}

async function runDone(tmpConfig) {
    if (d) return;
    d = true;
    console.log('开始提交完成状态。。。', tmpConfig.uuid);
    const res = await post('/bak/clean', {uuid: tmpConfig.uuid});
    console.log('请求结果：', res);
    if (res.code === 0) {
        console.log('服务端状态处理完成。');
        tmpConfig.state = 'wait';
        tmpConfigService.saveConfig();
    }
    d = false;
}

module.exports = {
    run: async function () {
        try {
            let tmpConfig = tmpConfigService.getConfig();
            if (!tmpConfig) tmpConfig = tmpConfigService.genDefault();
            if (tmpConfig.state === 'wait') {
                if (!tmpConfig.time || (Date.now() - tmpConfig.time) >= config.interval) {
                    await runSubmit(tmpConfig, tmpConfig.time);
                }
            } else if (tmpConfig.state === 'submit') {
                await runDownload(tmpConfig);
            } else if (tmpConfig.state === 'download') {
                await runImport(tmpConfig);
            } else if (tmpConfig.state === 'import') {
                await runDone(tmpConfig);
            }
        } catch (err) {
            a = b = c = d = false;
            console.error(err);
        }
    }
}
