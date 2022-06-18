const express = require("express");
const router = express.Router();
const {Posts} = require("../models");

router.get("/", async (req, res) => {
    // SELECT * FROM Posts;
    const listOfPosts = await Posts.findAll()
    res.json(listOfPosts);
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