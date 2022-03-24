//取得資料庫資料 並render到ab-list
const { compile } = require('ejs');
const express = require('express');
const db = require('./../modules/db_connect2');
const router = express.Router(); //連結至index.js中
// const moment = require('moment-timezone')

//登入/出權限設定
router.use((req,res,next)=>{       //平時沒用到next() 可省略不寫
    const whitelist = ['/'];           //白名單
    const path = req.url.split('?')[0];
    // console.log(path)
    
    if(!req.session.admin){       //如果沒登入 
        
        if(! whitelist.includes(path)){     //如果也沒有在白名單內
            // 讀取從哪裡來
            req.session.come_from = req.originalUrl;
            console.log('come_from:req.originalUrl:', req.originalUrl);
            return res.redirect('/login')   //轉向登入頁面
        }
    }
    next();  //當使用middlewares(.use) 加next() 才能繼續執行下面程式
});


//新增的頁面路由設定
// router.get('/add',async(req,res)=>{ // get:進入網頁要資料  get res:該網頁表單新增的內容
//     res.locals.pageName='ab-add';  //製作連結active特效(前端)用
       
//     res.render('ab-add');           //將 ab-add 傳送給navbar.ejs
// });

// router.post('/add', async (req, res)=>{  //post:把前端送來資料打包 準備送資料庫 
//     const output = {
//         success: false,
//         error: '',
//         results: null,
//         body: req.body, 
//     }
   
//     //在後端 進行欄位資料檢查
//     const sql = "INSERT INTO `address_book`(`name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES (?,?,?,?,?,NOW())";
//     const [results] = await db.query(sql,[
//         req.body.name,
//         req.body.email,
//         req.body.mobile,
//         req.body.birthday,
//         req.body.address,
//     ]);

//     /*
//     chrome 成功新增一筆資料後 console的資訊(編寫程式參考)
//     results = {
//     affectedRows: 1
//     fieldCount: 0
//     info: ""
//     insertId: 31  資料庫PKey
//     serverStatus: 2
//     warningStatus: 0
// }
// */ 
    
//     output.results =  results;

//     if(results.affectedRows){
//         output.success=true;
//         output.insertID= results.insertID
//     }
    
//     res.json(output);


//     // res.json(req.body)                   //測試用 將新增的表單(req.body)打包成json 當作res 顯示出來 
// });



//刪除資料
router.get('/del/:sid',async(req,res)=>{   // :sid 表示把sid變成參數 之後接收到 /del/數字 的路由 即可以放行
    const sid = parseInt(req.params.sid) 
    if(!sid){
        return res.redirect(req.baseUrl);  //轉向
    }
    
    const sql = "DELETE FROM address_book WHERE sid=?"  //delete 如果沒給WHERE 整個database皆會被刪除
    const [results] = await db.query(sql,[sid]);

    // res.json(results); //測試是否刪除成功
    
    // return res.send(req.get('Referer')); //測試轉向前的網頁為何  req.get('Referer')表示 請求方的位置
    const referer = req.get('Referer')
    if(referer){
        res.redirect(referer);
    }else{
        res.redirect(req.baseUrl)
    }
   
})


//修改資料
//當按下修改紐時 獲得該筆資料資訊
router.get('/edit/:sid',async(req,res)=>{   
    const sid = parseInt(req.params.sid) 
    if(!sid){
        return res.redirect(req.baseUrl);  //轉向
    }
    const sql = "SELECT * FROM address_book WHERE sid=?";
    const [rs] = await db.query(sql,[sid]);
    if(! rs.length){
        return res.redirect(req.baseUrl);
    }

    // return res.json(rs[0]);  //測試是否有抓到值
    
    rs[0].referer = req.get('Referer') || ''; // 人從哪裡來 但有可能沒提供referer

    res.render('ab-edit', rs[0]);
});

//修改完成後 上傳至資料庫
router.post('/edit/:sid',async(req,res)=>{
    const output= {
        success : false,
        error: '',
    };

    //除錯
    const sid = parseInt(req.params.sid);
    if(!sid){
        output.error = '編號錯誤';
        output.code = 410;
        return res.json(output)
    }
    
    const sql = "SELECT * FROM address_book WHERE sid=?";
    const [rs] = await db.query(sql,[sid]);
    if(! rs.length){
        output.error = '編號錯誤';
        output.code = 420;
        return res.json(output)
    }

    const sql2 = "UPDATE `address_book` SET ? WHERE sid=?";
    const [results] = await db.query(sql2,[req.body,sid])

    //測試時 按下修改後 chrome中 results 的 response內容
    /*
    res.json(results)
    affectedRows: 1 有找到的資料筆數
    changedRows: 1  真正有修改的資料筆數
    fieldCount: 0
    info: "Rows matched: 1  Changed: 1  Warnings: 0"
    insertId: 0
    serverStatus: 2
    warningStatus: 0
    */

    output.results = results;

    if(results.changedRows){
        output.success = true;
    } else {
        output.error = '資料沒有修改';
    }

    

    res.json(output);

});


//分頁設定
router.get('/', async (req, res)=>{
    res.locals.pageName='ab-list';
    //分頁功能
    const perPage = 10; //每頁有幾筆
    let rows = []; //該頁的資料 預設為空陣列

    let page = req.query.page ? parseInt(req.query.page) : 1;    //ex: let a='16'  +a=16 等同 paresInt(a)=16 取其數值用
    
    //處理page超出範圍
    if(page<1 || !page ){
        return res.redirect('?page=1');
    }

    const [rs1] = await db.query(`SELECT count(*) num FROM address_book`);
    const totalRows = rs1[0].num  //總筆數

    // return res.json({totalRows});  //測試用

    let totalPages = 0; //總頁數
    if(totalRows){
        totalPages = Math.ceil(totalRows/perPage)  //計算總頁數 無條件進位
        //處理page超出範圍
        if(page> totalPages ){
            return res.redirect('?page='+totalPages);
        }
        
        const sql = `SELECT a.*, b.account from address_book a join admins b where a.sid = b.sid ORDER BY a.sid DESC LIMIT ${(page-1)*perPage} , ${perPage}`;
        // return res.send(sql) 測試用
        [rows] = await db.query(sql);  //db.query:執行sql指令時使用
    
    
    }
   
    const output = {
        perPage,
        page,
        totalPages,
        totalRows,
        rows,
    }
    
   
    // return res.json(output); // 測試
    // 登入/出 可看到的資料庫 頁面不一樣
    if(req.session.admin){
        res.render('ab-list', output);  
    } else {
        res.render('ab-list-no-admin', output);
    }
});




module.exports = router;  //傳送至index.js
