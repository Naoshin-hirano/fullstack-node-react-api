const express = require("express");
const router = express.Router();
const { Users, Relationships } = require("../models");
const bcrypt = require("bcryptjs");
const cloudinary = require("../utils/cloudinary");
const upload = require("../utils/multer");
const { validation } = require("../middlewares/AuthMiddleware");
const { sign } = require("jsonwebtoken");

// Guest
router.get("/guest", async (req, res) => {
    bcrypt.hash("Guest1120!", 10).then(async (hash) => {
        await Users.update(
            {
                password: hash,
            },
            { where: { username: "GuestUser" } }
        );
        return res.json("ユーザー更新完了しました");
    });
});

// Registration
router.post("/", async (req, res) => {
    const { username, password } = req.body;
    bcrypt.hash(password, 10).then((hash) => {
        Users.create({
            username: username,
            password: hash,
            imageName:
                "https://res.cloudinary.com/dq8na8c7e/image/upload/v1671264511/98D3B03A-54B3-4976-818A-81F24F0BDD27_dm5vid.jpg",
        });
        return res.json("ユーザー新規登録完了しました");
    });
});

// Login
router.post("/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await Users.findOne({ where: { username: username } });
    if (!user) return res.json({ error: "Userが存在しません" });

    bcrypt.compare(password, user.password).then((match) => {
        if (!match)
            return res.json({ error: "UsernameとPasswordが合致しません" });
        // "importantsecret"という秘密鍵でJWTを発行
        const accessToken = sign(
            { username: username, password: password, id: user.id },
            "importantsecret"
        );
        // フロントのstorageにtoken保存
        res.json({
            token: accessToken,
            username: username,
            id: user.id,
            imageName: user.imageName,
        });
    });
});

// useEffectでログインできているかの確認
router.get("/auth", validation, async (req, res) => {
    const user = await Users.findOne({
        where: { username: req.user.username },
    });
    res.json(user);
});

router.get("/basicInfo/:id", async (req, res) => {
    const id = req.params.id;
    // 画面Userのpassword意外のカラム
    // 画面UserがフォローしているUser一覧
    const basicInfo = await Users.findByPk(id, {
        attributes: { exclude: ["password"] },
        include: {
            model: Relationships,
        },
    });

    // 画面のUserをフォローしているUser一覧
    const followingUsers = await Users.findAll({
        include: {
            model: Relationships,
            where: {
                followed: id,
            },
        },
    });

    res.json({ basicInfo: basicInfo, following: followingUsers });
});

// DMのUser情報を取得
router.get("/dmUser/:id", async (req, res) => {
    const id = req.params.id;
    const dmUserInfo = await Users.findByPk(id);
    res.json(dmUserInfo);
});

router.put("/changepassword", validation, async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const user = await Users.findOne({
        where: { username: req.user.username },
    });
    // oldPasswordと指定UserのDBにあるpasswordを比較
    bcrypt.compare(oldPassword, user.password).then(async (match) => {
        if (!match) res.json({ error: "パスワードが間違ってます" });
        // newPasswordをハッシュ化してUsersのパスワードへ更新
        bcrypt.hash(newPassword, 10).then((hash) => {
            // Users.updateの次の処理にUsersを使った処理ないのでasync/await不要
            Users.update(
                { password: hash },
                { where: { username: req.user.username } }
            );
            res.json("SUCCESS");
        });
    });
});

router.put(
    "/changeavatar",
    validation,
    upload.single("file"),
    async (req, res) => {
        // Upload image to cloudinary
        console.log("file", res.file);
        const result = await cloudinary.uploader.upload(req.file.path);
        console.log(req);
        if (!req.file) {
            return res.json({
                error: "ファイルのアップロードがされていません",
            });
        }
        await Users.update(
            { imageName: result.secure_url },
            { where: { id: req.user.id } }
        );

        res.json({ imageName: result.secure_url });
    }
);

module.exports = router;
