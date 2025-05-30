const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");

router.get("/list", UserController.getAllUsers); 
router.get("/:userId", UserController.getUserById, async (req, res) => {
    return res.json(req.user); 
}); 

module.exports = router;
