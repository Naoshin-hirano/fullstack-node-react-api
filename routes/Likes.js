const express = require("express");
const router = express.Router();
const {Likes} = require("../models");
const { validation } = require("../middlewares/AuthMiddleware");

// PostsでLikesもgetしているので、当ファイルでgetは不要
router.post("/", validation, async (req, res) => {
    const { PostId } = req.body;
    // validationにて認証確認できたらtokenを復号してreq.userに代入したuser情報を使う
    const UserId = req.user.id;

    const found = await Likes.findOne({ where : { PostId: PostId, UserId: UserId }});
    if (!found) {
        await Likes.create({ PostId: PostId, UserId: UserId });
        res.json({liked: true});
    } else {
        await Likes.destroy({ where: { PostId: PostId, UserId: UserId }});
        res.json({liked: false});
    }

});

module.exports = router;