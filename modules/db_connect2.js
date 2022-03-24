const mysql = require('mysql2');

// 設定連線相關資料 host、權限、資料庫名稱、密碼
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '222323030',
    database: 'aien16',
    waitForConnections: true,
    connectionLimit: 10 ,
    queueLimit: 0 
});


module.exports = pool.promise();