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

// Profile画面のUserが投稿したPost一覧
router.get("/byuserId/:id", async (req, res) => {
    const uid = req.params.id;
    const listOfPosts = await Posts.findAll({ where: { UserId: uid }, include: [Likes] });
    res.json(listOfPosts);
});

router.post("/", validation, async (req, res) => {
    // title, postText
    const post = req.body;
    post.username = req.user.username;
    post.UserId = req.user.id;
    // INSERT INTO Posts (title, postText, username) VALUES (?, ?, ?)
    await Posts.create(post);
    res.json(post);
});

router.put("/title", validation, async (req, res) => {
    const { newTitle, id } = req.body;
    // UPDATE Posts SET title=newTitle WHERE id=id;
    await Posts.update({ title: newTitle }, { where: { id: id }});
    res.json(newTitle);
});

router.put("/postText", validation, async (req, res) => {
    const { newPostText, id } = req.body;
    // UPDATE Posts SET title=newPostText WHERE id=id;
    await Posts.update({ postText: newPostText }, { where: { id: id }});
    res.json(newPostText);
});

router.delete("/:postId", validation, async (req, res) => {
    const postId = req.params.postId;
    // DELETE FROM Comments WHERE id=?;
    await Posts.destroy({
        where: {
            id: postId
        }
    });

    // フロント側で.then()内の処理を実行するためにどうでもいい内容のレスポンスをあえて作ってる
    res.json("DELETE SUCCESSFULLY");
});

module.exports = router;