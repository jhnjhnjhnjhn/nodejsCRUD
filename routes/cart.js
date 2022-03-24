const express = require('express');
const { redirect } = require('express/lib/response');
const db = require('./../modules/db_connect2');

const router = express.Router();

router.get('/list', async (req, res)=>{
    res.locals.pageName = 'cart-list';
    const pks = [];

    if(!req.session.cart || !req.session.cart.length){
        // 如果購物車內沒有商品, 則離開
        return res.redirect('/product-list');
    }

    for(let i of req.session.cart) {
        pks.push(i.sid);
    }
    const sql = `SELECT * FROM products WHERE sid IN (${pks.join(',')})`;
    const [rs] = await db.query(sql);
    const dict = {};
    for(let i of rs){
        dict[i.sid] = i;
    }
    for(let i of req.session.cart) {
        dict[i.sid].quantity = i.qty;
    }

    res.render('cart-list',{
        dict,
        cart: req.session.cart,
    });

});

router.post('/add', async (req, res)=>{
    req.session.cart = req.session.cart || [];
    // req.body.sid // 產品的 PK
    // req.body.qty // 數量

    const {sid, qty} = req.body;
    // TODO: 檢查有沒有這個產品
    
    // 先判斷之前有沒有加過
    let addedBefore = false;
    req.session.cart.forEach(item=>{
        if(item.sid==sid){
            addedBefore = true;
            item.qty += +qty;
        }
    });
    if(!addedBefore){
        req.session.cart.push({ sid: +sid, qty: +qty})
    }

    res.json(req.session.cart);

});

router.post('/set', async (req, res)=>{
    req.session.cart = req.session.cart || [];
    // req.body.sid // 產品的 PK
    // req.body.qty // 數量

    const {sid, qty} = req.body;
    // TODO: 檢查有沒有這個產品
    
    // 先判斷之前有沒有加過
    let addedBefore = false;
    req.session.cart.forEach(item=>{
        if(item.sid==sid){
            addedBefore = true;
            item.qty = +qty;
        }
    });
    if(!addedBefore){
        req.session.cart.push({ sid: +sid, qty: +qty})
    }

    res.json(req.session.cart);

});

router.post('/del', async (req, res)=>{
    req.session.cart = req.session.cart || [];
    // req.body.sid // 產品的 PK


    const {sid} = req.body;
    
    const ar = [...req.session.cart];
    // 把項目裡 sid 和傳入的 sid 相同時,代表是不要的項目
    req.session.cart = ar.filter(el=> el.sid!=sid );

    res.json(req.session.cart);

});

// 清空購物車
router.get('/clear',  (req, res)=>{
    req.session.cart =  [];
    res.json(req.session.cart);
});


module.exports = router;
