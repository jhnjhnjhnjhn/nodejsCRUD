
const db = require('./modules/db_connect2');
const moment = require('moment-timezone');

const lasts = ['鍾','郭','陳','李'];
const firsts = ['大安','曉華','小滴','噗噗'];


(async ()=>{
    const sql = "INSERT INTO `address_book`(`name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES (?,?,?,?,?,NOW())";

    for (i=0;i<100;i++){
        const name = lasts[Math.floor(Math.random()*lasts.length)]+ firsts[Math.floor(Math.random()*firsts.length)];
                                //floor 無條件捨去
        const email = 'a'+ Math.floor(Math.random()*100000) + '@test.com';
        const mobile = '09' + (10000000 + Math.floor(Math.random()*10000000));
        const birthday =moment( new Date(315532800000 + Math.random()*631152000000)).format('YYYY-MM-DD');
        const address = '大安區';

               
        const [results] = await db.query(sql, [
            name,
            email,
            mobile,
            birthday,
            address,
        ]);
/*
        console.log({
            name,
            email,
            mobile,
            birthday,
            address,
        });

        break;
        */
    }
    console.log('ok');
    process.exit();
})();

//上面是 當宣告匿名函數為async後 直接執行 的寫法 
//亦可寫成: async function a(){};
//         a()   >>>執行函式