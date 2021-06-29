function rand0or1() {
    return parseInt(Math.random() * 10) % 2;
}

const startBuyMoney = 100;
let yy = 1000000000;
let oldBuyNum = 0;
let curBuyMoney = 0;
let count = 0;
let maxCount = 0;
let maxYy = yy;
function run() {
    count++;
    console.log("[NO：" + count + "]");
    let open = rand0or1();
    console.log('open:', open, 'buy:', oldBuyNum, 'mon:', curBuyMoney);
    if (count > maxCount) maxCount = count;
    if (open === oldBuyNum) {
        yy += (curBuyMoney * 2);
        console.log('get:', curBuyMoney * 2, 'yy:', yy);
        oldBuyNum = rand0or1();
        count = 0;
        buyMoney(startBuyMoney);
    } else {
        buyMoney(curBuyMoney * 2);
    }
    if(yy>maxYy) maxYy = yy;
}

function buyMoney(val) {
    curBuyMoney = val;
    yy -= val;
    console.log('buy:', val, 'yy:', yy);
}

buyMoney(startBuyMoney);

// setInterval(function (){
//     run();
// },10)
let allCount = 0;
while (true) {
    allCount++;
    run();
    console.log('max:', maxCount);
    if(yy<=0) {
        console.log('over:',allCount);
        console.log('maxyy:',maxYy);
        break;
    }
}
