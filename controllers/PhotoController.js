const mongoose = require("mongoose");
const Photo = require("../db/photoModel");

async function allOfPhotos(req, res) {
  try {
    const photos = await Photo.find({})
      .select("-__v")
      .populate({
        path: "user_id",
        select: {
          _id: true,
          first_name: true,
          last_name: true,
        },
      })
      .populate({
        path: "comments.user",
        select: { _id: true, first_name: true, last_name: true },
      });
    return res.json(photos);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getPhotoById(req, res) {
  try {
    const { photoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return res.status(400).json({
        message: "Invalid Photo ID",
      });
    }

    const photo = await Photo.findById(photoId)
      .select("-__v")
      .populate({
        path: "user_id",
        select: {
          _id: true,
          first_name: true,
          last_name: true,
        },
      })
      .populate({
        path: "comments.user",
        select: {
          _id: true,
          first_name: true,
          last_name: true,
        },
      });

    return res.json(photo);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getPhotosByUserId(req, res) {
  try {
    const userId = req.user._id; 

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: "Invalid User ID",
      });
    }

    const photos = await Photo.find({ user_id: userId })
      .select("-__v -user_id")
      .populate({
        path: "comments.user",
        select: { _id: true, first_name: true, last_name: true },
      });

    return res.status(200).json({
      photos,
      owner: req.user 
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function deletePhotoById(req, res) {
  try {
    const { photoId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(photoId)) {
      return res.status(400).json({
        message: `Invalid PhotoId ${photoId}`
      });
    }

    const photo = await Photo.findById(photoId); 
    if (req.currentUser._id.toString() !== photo.user_id.toString()) {
      return res.status(400).json({
        message: "You are not owner"
      });
    }

    const deletedPhoto = await Photo.findByIdAndDelete(photoId); 

    return res.status(200).json({
      message: "Delete Successfully",
      deletedPhoto
    });

  } catch (e) {
    return res.status(500).json({
      message: e?.message || "Delete Failed"
    });
  }
}

module.exports = {
  allOfPhotos,
  getPhotoById,
  getPhotosByUserId,
  deletePhotoById
};
