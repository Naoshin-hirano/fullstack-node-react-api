const { verify } = require("jsonwebtoken");

// ログインしているかチェック
const validation = (req, res, next) => {
    // header: commentをpostするときにaxiosから送るheaderオブジェクト
    const accessToken = req.header("accessToken")

    if (!accessToken) return res.json({ error: "ユーザーはログインしてません" });

    try {
        // accessTokenを"importantsecret"という秘密鍵で復号
        const validToken = verify(accessToken, "importantsecret");
        // 復号したtoken(usernameとpassword)をreq.userオブジェクトに代入
        req.user = validToken;
        if (validToken) {
            return next();
        }
    } catch (err) {
        return res.json({ error: err });
    }
};

module.exports = { validation };