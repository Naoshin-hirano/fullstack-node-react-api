const express = require("express");
const router = express.Router();
const { Relationships } = require("../models");
const { validation } = require("../middlewares/AuthMiddleware");

// PostsでRelationshipsもgetしているので、当ファイルでgetは不要
router.post("/", validation, async (req, res) => {
    // リクエストでaxiosから送信するfollowedのid
    const { followedId } = req.body;
    const UserId = req.user.id; 
    // 自分のIDがある状況: follwingに自分のIDがあるのをすべて抽出→ その中からfollowerが対象のUserIdであるのを1つ抽出したもの
    const found = await Relationships.findOne({ where: { following: UserId, followed: followedId } });
    // 自分のIDがない状況: 上の変数に!つける
    if (!found) {
        // 追加: 自分のidがfollingしてるとこにいく。フォローした対象のidがfollowerにいく
        await Relationships.create({ following: UserId, followed: followedId });
        // following: 1増える
        res.json({ following: true });
    } else {
        // 削除: 
        await Relationships.destroy({ where: { following: UserId, followed: followedId } });
        res.json({ following: false });
    }
});

module.exports = router;