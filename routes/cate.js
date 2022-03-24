const express = require('express');
const db = require('./../modules/db_connect2');

const router = express.Router();

//TODO: 改善效能
let cateCache;  //作暫存用 不需要一直去資料庫抓資料
let lastQuery;  //上次查詢DB的時間

async function getCate() {
    const sql = "SELECT * FROM categories ORDER BY sequence";

    const [rs] = await db.query(sql);

    const dict ={};
    const cate = [];

    for(let i of rs) {
        dict[i.sid] = i; // 編成字典

        // 只拿第一層
        if(! i.parent_sid){
            cate.push(i);
        }
    }

    for(let i of rs) {
        if(i.parent_sid) {
            const p = dict[i.parent_sid]; // 父層
            p.nodes = p.nodes || [];
            p.nodes.push(i);
        }
    }
    return cate;
}


router.get('/tree1', async (req, res)=>{
    const sql = "SELECT * FROM categories ORDER BY sequence";

    const [rs] = await db.query(sql);

    const cate = [];

    for(let i of rs){
        if(i.parent_sid===0){
            cate.push(i);
        }
    }

    for(let i of cate) {
        for(let k of rs){
            if(k.parent_sid===i.sid){
                i.nodes = i.nodes || [];
                i.nodes.push(k);
            }
        }
    }

    res.json(cate);
});

router.get('/navbar', async (req, res)=>{
    const cate = await getCate();

     //res.json(cate);
     res.render('cate-navbar', {cate});
});

router.get('/combos', async (req, res)=>{
    const cate = await getCate();

    //res.json(cate);
    res.render('cate-combos', {cate});
});

router.get('/combos2', async (req, res)=>{
    const cate = await getCate();
    
    res.render('cate-combos2', {cate, lv1:2, lv2:16});  //從後端丟初值至前端
});

router.get('/combos3', async (req, res)=>{
    const cate = await getCate();
    
    res.render('cate-combos3', {cate, lv1:1});  
});

//checkbox
const data1 = {
    2: "游泳",
    6: "吃飯",
    7: "睡覺",
    8: "打東東",
    9: "慢跑",
    12: "重訓",    
}

router.get('/checkbox', async (req, res)=>{
   res.render('cate-checkbox', {data1});  
});
router.post('/checkbox', async (req, res)=>{  //接收前端 使用POST方法過來的資料
   //進行資料格式統一 (一個時為字串 多個為array)
   let hobby = [];
   if (req.body.hobby){
        if(req.body.hobby instanceof Array){    //判斷是否為array
            hobby = [ ...req.body.hobby ];      //...表示 將array資料展開 再放到 hobby = [] 中         
        }  else {
            hobby.push(req.body.hobby);      //如果為字串 就放到 hobby = [] 中
        }            
   }
   req.body.hobby=hobby
   res.json(req.body);  
});


router.get('/checkbox2', async (req, res)=>{
    const defaultVals = ['6','7','8'];
    res.render('cate-checkbox2', {data1,defaultVals});  
 });

module.exports = router;
