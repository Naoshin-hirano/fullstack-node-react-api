const express = require("express");
const router = express.Router();
const {Posts} = require("../models");

router.get("/", async (req, res) => {
    // SELECT * from Posts;
    const listOfPosts = await Posts.findAll()
    res.json(listOfPosts);
});

router.post("/", async (req, res) => {
    const post = req.body;
    // INSERT INTO Posts (title, postText, username) VALUES (?, ?, ?)
    await Posts.create(post);
    res.json(post);
});

module.exports = router;