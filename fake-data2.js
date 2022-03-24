const db = require('./modules/db_connect2');
const moment = require('moment-timezone');

const lasts = ['林','陳', '李', '吳'];
const firsts = ['小明','大華', '小新', '小安'];


(async ()=>{
    const sql = "INSERT INTO `address_book` SET ?";

    for(i=0; i<100; i++){
        const name = lasts[Math.floor(Math.random()*lasts.length)] + firsts[Math.floor(Math.random()*firsts.length)];

        const email = 'a'+ Math.floor(Math.random()*100000) + '@test.com';
        const mobile = '09' + (10000000 + Math.floor(Math.random()*10000000));
        const birthday = moment(new Date(315532800000+Math.random()*631152000000)).format('YYYY-MM-DD');
        const address = '台北市';

        const obj = {
            name,
            email,
            mobile,
            birthday,
            address,
            created_at: new Date(),  //若資料庫表格不能為空值 需加此行
        };

        const [results] = await db.query(sql, [ obj ]);

    }
    console.log('ok');
    process.exit();
})();

