const express = require("express");
const router = express.Router();
const CommentController = require("../controllers/CommentController");
const UserController = require("../controllers/UserController");

router.get("/user/:userId", UserController.getUserById, CommentController.getCommentsByUserId);
router.delete("/", CommentController.deleteCommentById); 

module.exports = router; 