const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const app = express();
const db = require("./models");

app.use(
    cors({
        origin: "*",
        methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
        preflightContinue: true,
        optionsSuccessStatus: 204,
    })
);
// クライアントから送信されたデータを、 req.body 経由で会得、操作できる。Body-Parser を基にExpressに組み込まれた機能、
app.use(express.json());
// Content-Type が application/x-www-form-urlencoded である POST リクエストのボディ部を解析し、 リクエストオブジェクトの body プロパティにフォームデータの内容を表すオブジェクトをセット
app.use(bodyParser.urlencoded({ extended: true }));

const postRouter = require("./routes/Posts");
app.use("/posts", postRouter);

const commentsRouter = require("./routes/Comments");
app.use("/comments", commentsRouter);

const usersRouter = require("./routes/Users");
app.use("/auth", usersRouter);

const likesRouter = require("./routes/Likes");
app.use("/likes", likesRouter);

const Relationships = require("./routes/Relationships");
app.use("/relationships", Relationships);

const Tags = require("./routes/Tags");
app.use("/tags", Tags);

const DirectMessages = require("./routes/DirectMessages");
app.use("/directmessages", DirectMessages);

db.sequelize.sync().then(() => {
    app.listen(process.env.PORT || 3001, () => {
        console.log("running on port 3001");
    });
});
