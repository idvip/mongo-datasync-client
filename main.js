let dataService = require('./service/dataService.js');
setInterval(function () {
    dataService.run();
}, 5 * 1000);
console.log('系统已启动并开启定时任务');
dataService.run();


