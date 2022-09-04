const express = require("express");
const { Op } = require("sequelize");
const multer = require("multer");
const router = express.Router();
const { Posts, Likes, Tags, PostTag } = require("../models");
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
    const listOfPosts = await Posts.findAll({
        where: { UserId: uid },
        include: [Likes, Tags],
    });
    res.json(listOfPosts);
});

// タグで絞り込んだPost一覧
router.get("/byhashtag/:id", validation, async (req, res) => {
    const posts = await Posts.findAll({ include: [Tags, Likes] });
    const tagName = req.params.id;

    // Post一覧をループして、その中のTag一覧をさらにループして、リクエストのあったtag_nameと一致する名前のTagを持つPost一覧を取得
    const tagPosts = [];
    for (let i = 0; i < posts.length; i++) {
        for (let f = 0; f < posts[i].Tags.length; f++) {
            if (posts[i].Tags[f].tag_name != tagName) continue;
            tagPosts.push(posts[i]);
        }
    }

    // 自分がいいねしたPostだけを抜き出す
    const likedPosts = await Likes.findAll({ where: { UserId: req.user.id } });

    res.json({ tagPosts: tagPosts, likedPosts: likedPosts });
});

// 検索ワードで絞り込んだPost一覧
router.get("/search/:id", validation, async (req, res) => {
    const keyword = req.params.id;
    // 自分がいいねしたPostだけを抜き出す
    const likedPosts = await Likes.findAll({ where: { UserId: req.user.id } });
    // 検索ワードを含むPost一覧
    const posts = await Posts.findAll({
        where: {
            [Op.or]: [
                { title: { [Op.like]: `%${keyword}%` } },
                { postText: { [Op.like]: `%${keyword}%` } },
                { username: { [Op.like]: `%${keyword}%` } },
            ],
        },
        include: [Likes, Tags],
    });

    res.json({ searchPosts: posts, likedPosts: likedPosts });
});

// 検索窓でのオートサジェスト一覧
router.get("/suggests", async (req, res) => {
    const posts = await Posts.findAll({
        attributes: ["title", "postText", "username"],
    });

    // Post各キーの要素を入れた配列生成
    const titleArray = [];
    const textArray = [];
    const userArray = [];
    posts.map((post) => {
        titleArray.push(post.title);
        textArray.push(post.postText);
        userArray.push(post.username);
    });
    // 3つの配列を結合してtitle/postText/usernameキーの要素が入った配列生成
    const titleAndTextArr = titleArray.concat(textArray);
    let duplicatedSuggests = titleAndTextArr.concat(userArray);
    // 配列から重複した要素を削除
    let set = new Set(duplicatedSuggests);
    let suggestions = Array.from(set);

    res.json(suggestions);
});

// multerで画像ファイルアップロード
const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        // 画像ファイルを保存するディレクトリPath
        callback(null, "../client/public/images");
    },
    filename: (req, file, callback) => {
        // どういうファイル名で保存するか
        callback(null, Date.now() + "--" + file.originalname);
    },
});
const upload = multer({
    storage: storage,
});

router.post("/", validation, upload.single("file"), async (req, res) => {
    // title, postText
    const data = req.body;
    // JSON.stringifyで文字列へ変換した配列を通常の配列に戻す
    const tags = JSON.parse(data.checked);

    if (!req.file) {
        return res.json({ error: "ファイルのアップロードがされていません" });
    }

    const post = {
        title: data.title,
        postText: data.postText,
        username: req.user.username,
        UserId: req.user.id,
        imageName: `images/${req.file.filename}`,
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
    }

    // 既存タグをこの投稿に追加した場合
    if (tags.length > 0) {
        tags.forEach(async (tag) => {
            const foundPost = await Posts.findOne({
                where: { title: data.title },
            });
            const foundTag = await Tags.findOne({ where: { tag_name: tag } });
            PostTag.create({ PostId: foundPost.id, TagId: foundTag.id });
        });
    }

    res.json(post);
});

router.put("/title", validation, async (req, res) => {
    const { newTitle, id } = req.body;
    // UPDATE Posts SET title=newTitle WHERE id=id;
    await Posts.update({ title: newTitle }, { where: { id: id } });
    res.json(newTitle);
});

router.put("/postText", validation, async (req, res) => {
    const { newPostText, id } = req.body;
    // UPDATE Posts SET title=newPostText WHERE id=id;
    await Posts.update({ postText: newPostText }, { where: { id: id } });
    res.json(newPostText);
});

router.delete("/:postId", validation, async (req, res) => {
    const postId = req.params.postId;
    // DELETE FROM Comments WHERE id=?;
    await Posts.destroy({
        where: {
            id: postId,
        },
    });

    // フロント側で.then()内の処理を実行するためにどうでもいい内容のレスポンスをあえて作ってる
    res.json("DELETE SUCCESSFULLY");
});

module.exports = router;
