const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require('mysql');

const app = express();

// データベース接続情報
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Naoyakun1!',
    database: 'fullstack_app'
  });

app.use(cors());

// クライアントから送信されたデータを、 req.body 経由で会得、操作できる。Body-Parser を基にExpressに組み込まれた機能、
app.use(express.json());
// Content-Type が application/x-www-form-urlencoded である POST リクエストのボディ部を解析し、 リクエストオブジェクトの body プロパティにフォームデータの内容を表すオブジェクトをセット
app.use(bodyParser.urlencoded({extended: true}));

// データベースに接続できたらコンソールにConnectedを表示
db.getConnection(function(err) {
    if (err) throw err;
    console.log('Connected');
  });

app.listen(3001, ()=> {
    console.log("running on port 3001");
});

