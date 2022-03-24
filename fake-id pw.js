const db = require('./modules/db_connect2');
const moment = require('moment-timezone');


(async ()=>{
    const sql = "INSERT INTO `admins` SET ?";

    for(i=0; i<100; i++){
        
        const account = 'a'+ Math.floor(Math.random()*10000000);
        const pass_hash = '000000'

        const obj = {
            account,
            pass_hash,
            created_at: new Date(),  //若資料庫表格不能為空值 需加此行
        };

        const [results] = await db.query(sql, [ obj ]);

    }
    console.log('ok');
    process.exit();
})();

