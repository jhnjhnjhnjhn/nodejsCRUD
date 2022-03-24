const express = require('express');
const moment = require('moment-timezone');
const db = require('./../modules/db_connect2');

const router = express.Router();


router.get('/', async (req, res)=>{
    res.locals.pageName = 'product-list';

    const perPage = 5; // 每頁有幾筆
    let rows = []; // 該頁的資料, 預設為空陣列

    let page = req.query.page ? parseInt(req.query.page) : 1;

    // 處理 page 超出範圍
    if(page<1 || !page){
        return res.redirect('?page=1');
    }

    const [rs1] = await db.query(`SELECT COUNT(1) num FROM products`);
    const totalRows = rs1[0].num; // 總筆數

    let totalPages = 0; // 總頁數預設值
    if(totalRows) {
        totalPages = Math.ceil(totalRows/perPage); // 計算總頁數

        // 處理 page 超出範圍
        if(page > totalPages){
            return res.redirect('?page='+totalPages);
        }


        const sql = `SELECT * FROM products ORDER BY sid DESC LIMIT ${(page-1)*perPage}, ${perPage}`;

        [rows] = await db.query(sql);
    }

    const output = {
        perPage,
        page,
        totalRows,
        totalPages,
        rows,
    };

    if(req.session.admin){
        res.render('product-list', output);  
    } else {
        res.render('product-list-no-admin', output);
    }

    
});

module.exports = router;
