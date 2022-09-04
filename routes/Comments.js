const express = require("express");
const router = express.Router();
const { Comments } = require("../models");
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
    // validationミドルウェアでログイン後にtokenを復号したusernameとpasswordをreq.userに代入したobjectを使う
    const username = req.user.username;
    // INSERT INTO Comments (commentBody, PostId) VALUES (?, ?)
    // Commentsカラムのusernameへ代入
    comment.username = username;
    await Comments.create(comment);
    res.json(comment);
});

router.delete("/:commentId", validation, async (req, res) => {
    const commentdId = req.params.commentId;
    // DELETE FROM Comments WHERE id=?;
    await Comments.destroy({
        where: {
            id: commentdId,
        },
    });

    // フロント側で.then()内の処理を実行するためにどうでもいい内容のレスポンスをあえて作ってる
    res.json("DELETE SUCCESSFULLY");
});

module.exports = router;
