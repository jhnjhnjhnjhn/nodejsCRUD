require('dotenv').config(); //抓.env(預設位置)的設定檔

const express = require('express');
const bcrypt = require('bcrypt');  //將密碼進行雜湊加密
const multer = require('multer')
// const upload = multer({dest:'tmp_uploads/'}); // 設定上傳暫存資料夾
const upload = require('./modules/upload-module'); 
const { use } = require('./routes/admin2');
const session = require('express-session');
const MysqlStore = require('express-mysql-session')(session) //for cookie資訊存入 db  須加在session後面

const moment = require('moment-timezone')
const db = require('./modules/db_connect2')
const sessionStore = new MysqlStore({},db);

process.env.MODE = process.env.MODE || 'development';  //若package.json(start)沒設定 就以'development'為env.MODE
console.log('process.env.MODE:', process.env.MODE);

const app = express();

app.set('view engine','ejs');   //放所以路由前面 使用ejs樣板引擎


//TOP LEVEL middlewares 皆會設定到每個路由
app.use(require('cors')()); //可以取得跨網域存取權限(後端) 的套件(前提是對方沒設限制)
//設定session
app.use(session({
    // 新用戶沒有使用到session 物件時不會建立session 和發送cookie
    saveUninitialized: false,
    resave: false,   // 沒變更內容是否強制回存
    secret: 'sdfgdsf456456456YIOIUOIUOf',  //加密用的字串
    // store: sessionStore,  //將cookie資訊存入 db
    cookie: {
        maxAge: 1200000,  // 20分鐘，單位毫秒
    }
}));


//USE表所有http方法皆可(GET、POST等) 
app.use(express.urlencoded({extended: false })); //此為Middleware  false 表使用內建方式解析處裡
app.use(express.static('public'));  //靜態資料夾設定 public資料夾內皆可被讀取
app.use(express.json()); 
app.use((req,res, next)=>{
    res.locals.title = '我的網站';
    res.locals.members = req.session.members || {};
    res.locals.admin = req.session.admin || '';

    res.locals.pageName=''; //預測值 怕其他路由沒設定發生錯誤
    
    res.locals.toDateString = d =>moment(d).format('YYYY-MM-DD');    //一行程式=> 不需要{} 而且會自動return
    res.locals.toDatetimeString = d =>moment(d).format('YYYY-MM-DD HH:mm:ss');
    // console.log(res.locals);
    next()
});
// -----------以上為middlewares----------------



app.get('/', (req, res)=>{
    res.locals.pageName='home';

    res.locals.title = res.locals.title ? ('首頁 - ' + res.locals.title) : '首頁';   //如果不給 首頁-我的網站 則會使用 首頁 為title
    res.render('home', { cls:'班級-AIEN16',name:'學員-鍾凱賀'});  //render 將後面參數傳送至ejs 中
});

app.get('/json-sales', (req, res)=>{
    res.locals.pageName='json-sales';

    res.locals.title = res.locals.title ? ('表格 - ' + res.locals.title) : '表格';
    const sales = require('./data/sales');
    // console.log(sales);

    res.render('json-sales', {sales} );    
});

app.get('/json-sales',(req,res) => {
    const sales = require('./data/sales');
    
    // console.log(sales);

    // res.send(sales);  //如果是array格式 會自動轉成json 上傳至html

    res.render('json-sales', {sales} );  //將json檔傳送至json-sales.ejs 做表格呈現(render for ejs)
});



//設定session
app.get('/try-session', (req, res)=>{
    req.session.my_var = req.session.my_var || 0;
    req.session.my_var ++;

    res.json({
        my_var: req.session.my_var,
        session: req.session
    })
});

//設定login
app.get('/login', (req, res)=>{
    res.locals.pageName='login';
    console.log('come_from:', req.session.come_from);
    res.render("login")
});

app.post('/login', async (req, res)=>{
    const output = {
        success : false,
        error: '帳號或密碼錯誤',
    };
    if(!req.body.account || !req.body.password){
        output.error = '沒有帳號或密碼';
        return res.json(output);
    }
    const sql = "SELECT * FROM admins WHERE account=?";
    const [rs] = await db.query(sql, [req.body.account]);
    if(! rs.length){
        return res.json(output);
    }

    
    const pr = await bcrypt.compare(req.body.password, rs[0].pass_hash);  //比對輸入資料是否與資料庫一致
    
    // console.log(req.body.password);
    // console.log(rs[0].pass_hash);
    // console.log(pr);
   
    if(pr){
        output.success = true;
        output.error = '';
        req.session.admin = req.body.account;
    }
    res.json(output);
});

//設定logout
app.get('/logout',(req, res)=>{
    // delete req.session.admin;   //只刪除admin session還會存在一段時間
    req.session.destroy(() => {  //將session完全砍掉
        res.redirect('/')           // 頁面轉向
       })  
    });



//上課舉例
/* 
app.post('/login', (req, res)=>{
    const members ={
        green:{
            pw:"123456789",
            nickname:"臭小路"
        },
        ting:{
            pw:"987654321",
            nickname:"臭小婷" 
        }
    };
    const output= {
        success: false,
        error: "帳號或密碼錯誤",
    };

    // console.log(req.body);
    const item = members[req.body.account];
    if(item) {
        if(req.body.password === item.pw){
            output.success = true;
            output.error='';
            req.session.members = {
                account : req.body.account,
                nickname : item.nickname
            };
        }
    }

    res.json(output)
}); 
*/

//設定logout
app.get('/logout', (req, res)=>{
    delete req.session.members;
    res.redirect('/');  //在後端設定 當登出時 路由轉到根目錄網頁
});

//時間格式
app.get("/try-date",(req, res)=>{
    const fm = 'YYYY-MM-DD HH:mm:ss';
    let str = '<div>';
    const now = new Date;
     
    str += moment().format(fm) + '<br>';  //轉換成字串
    str += moment(now).tz('Europe/London').format(fm) + '<br>';
    str += moment( req.session.cookie.expires ).format(fm) + '<br>';
    str += moment( '2022-02-30' ).format(fm) + '<br>';
    
    str += '</div>';


    res.send(str);
});

//讀取資料庫
/*
app.get('/try-db',(req, res)=>{
    db.query(`SELECT * FROM address_book LIMIT 3`)
    .then( r=>{
        res.json(r[0]);   //[0]為資料庫內容 其他為資料庫參數(沒啥用)
    })
});
*/


//address-book路由 額外建立新的檔案
app.use('/address-book', require('./routes/address-book'));

//資料庫分類練習
app.use('/cate', require('./routes/cate'));

//購物車練習
app.use('/product-list', require('./routes/product-list'));
app.use('/cart', require('./routes/cart'));

//註冊
app.use('/register', require('./routes/register'));



//需放所有設定路徑(路由)的程式碼後面  
app.use((req,res) => {
    res.status(404).send('<h2>找無頁面</h2>')
});

app.listen(3000,()=>{
    console.log('server started', new Date().toString());
})
