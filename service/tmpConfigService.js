var fs = require('fs');
let tmpConfig = null;
let configPath = process.cwd() + '/runconfig.json';//数据目录
//初始化加载配置
var init = function () {
    //判断文件是否存在
    if (fs.existsSync(configPath)) {
        var cj = fs.readFileSync(configPath, 'UTF-8');
        if (cj) {
            tmpConfig = JSON.parse(cj);
        }
    }
}
init();
//临时文件夹配置文件管理（不是系统配置）
module.exports = {
    getConfig: function () {
        return tmpConfig;
    },
    saveConfig: function (cfg) {
        tmpConfig = cfg || tmpConfig;
        fs.writeFileSync(configPath, JSON.stringify(tmpConfig, null, 2));
    },
    //生成默认的配置文件
    genDefault: function () {
        tmpConfig = {
            state: 'wait',
            time: null,
            uuid: ''
        }
        return tmpConfig;
    }
}
