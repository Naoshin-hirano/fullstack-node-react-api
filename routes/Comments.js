const express = require("express");
const router = express.Router();
const {Comments} = require("../models");
const { validation } = require("../middlewares/AuthMiddleware");

router.get("/:postId", async (req, res) => {
    const postId = req.params.postId;
    // SELECT * FROM Comments WHERE PostId = ?
    const comments = await Comments.findAll({ where: { PostId: postId } });
    res.json(comments);
});

// validationをパスしたらcomment追加処理実行
router.post("/", validation, async (req, res) => {
    const comment = req.body;
    // INSERT INTO Comments (commentBody, PostId) VALUES (?, ?)
    await Comments.create(comment);
    res.json(comment);
});

module.exports = router;