const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcryptjs");
const { validation } = require("../middlewares/AuthMiddleware");
const { sign } = require("jsonwebtoken");

// Registration
router.post("/", async (req, res) => {
    const { username, password } = req.body;
    bcrypt.hash(password, 10).then((hash) => {
        Users.create({
            username: username,
            password: hash
        });
        res.json("SUCCESS");
    });
});

// Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await Users.findOne({ where: { username: username }});
    if (!user) res.json({ error: "Userが存在しません" }); 
    
    bcrypt.compare(password, user.password).then((match) => {
        if (!match) res.json({ error: "UsernameとPasswordが合致しません" });
        // "importantsecret"という秘密鍵でJWTを発行
        const accessToken = sign(
            { username: username, password: password, id: user.id },
            "importantsecret"
        );
        // フロントのstorageにtoken保存
        res.json({ token: accessToken, username: username, id: user.id });
    });
});

// useEffectでログインできているかの確認
router.get("/auth", validation, (req, res) => {
    res.json(req.user);
});

router.get("/basicInfo/:id", async (req, res) => {
    const id = req.params.id;
    // Usersのpassword意外のカラムを取得
    const basicInfo = await Users.findByPk(id, {
        attributes: { exclude: ["password"] },
    });

    res.json(basicInfo);
});

router.put("/changepassword", validation, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await Users.findOne({ where: { username: req.user.username }});
    // oldPasswordと指定UserのDBにあるpasswordを比較
    bcrypt.compare(oldPassword, user.password).then(async (match) => {
        if (!match) res.json({ error: "パスワードが間違ってます" });
        // newPasswordをハッシュ化してUsersのパスワードへ更新
        bcrypt.hash(newPassword, 10).then((hash) => {
            // Users.updateの次の処理にUsersを使った処理ないのでasync/await不要
            Users.update({password: hash }, {where: { username: req.user.username }});
            res.json("SUCCESS");
        });
    });
});

module.exports = router;