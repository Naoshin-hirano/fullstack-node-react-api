const express = require("express");
const router = express.Router();
const {Comments} = require("../models");

router.get("/:postId", async (req, res) => {
    const postId = req.params.postId;
    // SELECT * FROM Comments WHERE PostId = ?
    const comments = await Comments.findAll({ where: { PostId: postId } });
    res.json(comments);
});

router.post("/", (req, res) => {
    const comment = req.body;
    // INSERT INTO Comments (commentBody, PostId) VALUES (?, ?)
    Comments.create(comment);
    res.json(comment);
});

module.exports = router;