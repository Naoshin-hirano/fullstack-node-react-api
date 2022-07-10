const express = require("express");
const router = express.Router();
const {Posts, Likes, Tags, PostTag} = require("../models");
const { validation } = require("../middlewares/AuthMiddleware");

router.get("/", validation, async (req, res) => {
    // SELECT * FROM Posts;
    // Postsだけでなくその中のLikesオブジェクトの配列も取得
    const listOfPosts = await Posts.findAll({ include: [Likes, Tags] });
    // 自分がいいねしたPostだけを抜き出す
    const likedPosts = await Likes.findAll({ where: { UserId: req.user.id } });
    res.json({ listOfPosts: listOfPosts, likedPosts: likedPosts });
});

router.get("/byId/:id", async (req, res) => {
    const id = req.params.id;
    // "SELECT * FROM Posts WHERE id = ?"
    const post = await Posts.findByPk(id, { include: Tags });
    res.json(post);
});

// Profile画面のUserが投稿したPost一覧
router.get("/byuserId/:id", async (req, res) => {
    const uid = req.params.id;
    const listOfPosts = await Posts.findAll({ where: { UserId: uid }, include: [Likes, Tags] });
    res.json(listOfPosts);
});

router.post("/", validation, async (req, res) => {
    // title, postText
    const data = req.body;
    const tags = data.checked;
    const post = {
        title: data.title,
        postText: data.postText,
        username: req.user.username,
        UserId: req.user.id
    };
    
    // 新規タグを追加した場合
    // 新規タグのtagNameが既存タグのtagNameと被っていないか
    const existTag = await Tags.findOne({ where: { tag_name: data.tagName } });
    if (!existTag) {
        // INSERT INTO Posts (title, postText, username) VALUES (?, ?, ?)
        const insertPost = await Posts.create(post);
        // INSERT INTO Tags (tag_name) VALUES ?
        const insertTag = await Tags.create({ tag_name: data.tagName });
        // INSERT INTO PostTag (PostId, TagId) VALUES (?, ?)
        await PostTag.create({ PostId: insertPost.id, TagId: insertTag.id });
    } else {
       return res.json({ error: "NewTag名がすでに存在しているタグ名です" });
    };

    // 既存タグをこの投稿に追加した場合
    if (tags.length > 0) {
        tags.forEach( async (tag) => {
            const foundPost = await Posts.findOne({ where: { title: data.title } });
            const foundTag = await Tags.findOne({ where: { tag_name: tag } });
            PostTag.create({ PostId: foundPost.id, TagId: foundTag.id });
        });
    };

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