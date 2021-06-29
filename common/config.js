let config = {
    interval:3*24*60*60*1000, //3天执行一次
    serverPath:"http://localhost:3333",
    mongo: {
        host: '127.0.0.1:27017',
        username: '',
        password: '',
        database: 'db',
        option:''
    },
}
 
if(process.env.NODE_ENV==='prod'){
    config={
   
    }
}
module.exports=config;
