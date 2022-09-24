const express = require("express");
const router = express.Router();
const { DirectMessages } = require("../models");
const { validation } = require("../middlewares/AuthMiddleware");

router.get("/", async (req, res) => {
    const messages = await DirectMessages.findAll();
    res.json(messages);
});

router.post("/", validation, async (req, res) => {
    const data = req.body;
    const postObj = {
        text: data.text,
        UserId: req.user.id,
    };
    const directMessages = await DirectMessages.create(postObj);
    res.json(directMessages);
});

module.exports = router;
