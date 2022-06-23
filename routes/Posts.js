const express = require("express");
const router = express.Router();
const {Posts, Likes} = require("../models");
const { validation } = require("../middlewares/AuthMiddleware");

router.get("/", validation, async (req, res) => {
    // SELECT * FROM Posts;
    // Postsだけでなくその中のLikesオブジェクトの配列も取得
    const listOfPosts = await Posts.findAll({ include: [Likes] });
    // 自分がいいねしたPostだけを抜き出す
    const likedPosts = await Likes.findAll({ where: { UserId: req.user.id } });
    res.json({ listOfPosts: listOfPosts, likedPosts: likedPosts });
});

router.get("/byId/:id", async (req, res) => {
    const id = req.params.id;
    // "SELECT * FROM Posts WHERE id = ?"
    const post = await Posts.findByPk(id);
    res.json(post);
});

router.post("/", async (req, res) => {
    const post = req.body;
    // INSERT INTO Posts (title, postText, username) VALUES (?, ?, ?)
    await Posts.create(post);
    res.json(post);
});

module.exports = router;