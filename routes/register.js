const { compile } = require('ejs');
const express = require('express');
const db = require('./../modules/db_connect2');
const router = express.Router(); //連結至index.js中
const bcrypt = require('bcrypt');  //將密碼進行雜湊加密
// const moment = require('moment-timezone')


//註冊頁面路由設定
router.get('/',async(req,res)=>{ // get:進入網頁要資料  get res:該網頁表單新增的內容  
    res.locals.pageName='register';  //製作連結active特效(前端)用
       
    res.render('register');           
});

router.post('/', async (req, res)=>{  //post:把前端送來資料打包 準備送資料庫 
    const output = {
        success: false,
        error: '',
        results: null,
        body: req.body, 
    }
   
    //在後端 進行欄位資料檢查
    const sql = "INSERT INTO `admins`(`account`, `pass_hash`, `created_at`) VALUES (?,?,NOW())";
    const salt = bcrypt.genSaltSync(10);  //雜湊做10次
    const hash = bcrypt.hashSync(req.body.password1, salt);
    
    const [results] = await db.query(sql,[        
        req.body.account,
        hash,       
    ]);
 
    output.results =  results;

    if(results.affectedRows){
        output.success=true;
        output.insertID= results.insertID
    }
    
    res.json(output);;

});




router.get('/register2',async(req,res)=>{ // get:進入網頁要資料  get res:該網頁表單新增的內容  
    res.locals.pageName='register';  //製作連結active特效(前端)用
       
    res.render('register2');           
});


router.post('/register2', async (req, res)=>{  //post:把前端送來資料打包 準備送資料庫 
    const output = {
        success: false,
        error: '',
        results: null,
        body: req.body, 
    }
   
    //在後端 進行欄位資料檢查
    const sql = "INSERT INTO `address_book`(`name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES (?,?,?,?,?,NOW())";
    const [results] = await db.query(sql,[
        req.body.name,
        req.body.email,
        req.body.mobile,
        req.body.birthday,
        req.body.address,
    ]);

    /*
    chrome 成功新增一筆資料後 console的資訊(編寫程式參考)
    results = {
    affectedRows: 1
    fieldCount: 0
    info: ""
    insertId: 31  資料庫PKey
    serverStatus: 2
    warningStatus: 0
}
*/ 
    
    output.results =  results;

    if(results.affectedRows){
        output.success=true;
        output.insertID= results.insertID
    }
    
    res.json(output);;


    // res.json(req.body)                   //測試用 將新增的表單(req.body)打包成json 當作res 顯示出來 
});




module.exports = router;  //傳送至index.js
