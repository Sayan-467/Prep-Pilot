const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const chatController = require("../controllers/chatController");

router.use(auth);
router.post("/", chatController.handleChat);

module.exports = router;