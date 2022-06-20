const express = require("express");
const router = express.Router();
const { Users } = require("../models");
const bcrypt = require("bcrypt");

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
            { username: username, password: password },
            "importantsecret"
        );
        // フロントのstorageに保存
        res.json(accessToken);
    });
});

module.exports = router;