let config = require('../common/config.js');
var MongoClient = require('mongodb').MongoClient;
var mongo = config.mongo;
var url = (mongo.username && mongo.password) ? `mongodb://${mongo.username}:${mongo.password}@${mongo.host}/${mongo.database}${mongo.option}` :
    `mongodb://${mongo.host}/${mongo.database}${mongo.option}`;console.log(url);
var db = null;
async function initConn(){
    try {
        let conn = await MongoClient.connect(url);
        console.log('数据库连接成功');
        db = conn.db();
    }
    catch (err){
        console.error(err);
    }
}
initConn();

module.exports={
    count:function (collection,condition){
        return db.collection(collection).find(condition).count();
    },
    last:async function (collection){
         let rs = await db.collection(collection).find({}).limit(1).sort({_id:-1}).toArray();
         return rs[0];
    },
    //返回true表示数据库连接已就绪
    state:function (){
        return !!db;
    }
}
