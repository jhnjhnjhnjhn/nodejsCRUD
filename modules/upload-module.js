const multer = require('multer')
const {v4: uuidv4} = require('uuid')  //uuid 自動生產id的套件

const extMap = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
};

const storage = multer.diskStorage({
    destination : (req, file, cb)=>{          //cb表callback func.的名稱
        cb(null, __dirname + '/../public/img')  //路徑   錯誤時給null(空值),後面為路徑
        },
        filename: (req, file, cb)=>{          //檔名             
        cb(null, uuidv4() + extMap[file.mimetype])   //把mimetype作檔案副檔名的要求
        }
        
    });

    const fileFilter = (req, file, cb)=>{
        cb(null, !!extMap[file.mimetype]);   //!!: 雙重否定 單存轉換成布林值
}

module.exports = multer({storage, fileFilter});

