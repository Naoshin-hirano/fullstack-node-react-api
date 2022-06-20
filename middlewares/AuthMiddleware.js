const { verify } = require("jsonwebtoken");

// ログインしているかチェック
const validation = (req, res, next) => {
    // header: commentをpostするときにaxiosから送るheaderオブジェクト
    const accessToken = req.header("accessToken")

    if (!accessToken) return res.json({ error: "ユーザーはログインしてません" });

    try {
        // accessTokenを"importantsecret"という秘密鍵で復号
        const validToken = verify(accessToken, "importantsecret");
        if (validToken) {
            return next();
        }
    } catch (err) {
        return res.json({ error: err });
    }
};

module.exports = { validation };