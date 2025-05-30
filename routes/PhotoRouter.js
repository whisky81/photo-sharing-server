const express = require("express");
const router = express.Router();
const PhotoController = require("../controllers/PhotoController"); 
const UserController = require("../controllers/UserController");

router.get("/list", PhotoController.allOfPhotos);
router.get("/:photoId", PhotoController.getPhotoById);
router.get("/user/:userId", UserController.getUserById, PhotoController.getPhotosByUserId); 

module.exports = router;
