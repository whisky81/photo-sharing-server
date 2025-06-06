const Photo = require("../db/photoModel");
const mongoose = require("mongoose");
async function getCommentsByUserId(req, res) {
  try {
    const userId = req.user._id;

    const comments = await Photo.aggregate([
      {
        $match: {
          "comments.user": userId,
        },
      },
      {
        $project: {
          _id: 1,
          file_name: 1,
          comments: {
            $filter: {
              input: "$comments",
              as: "comment",
              cond: { $eq: ["$$comment.user", userId] },
            },
          },
        },
      },
    ]);

    return res.status(200).json({
      comments,
      owner: req.user 
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function deleteCommentById(req, res) {
  const { photoId, commentId } = req.body; 
  const currentUserId = req.currentUser._id; 

  if (!photoId || !commentId || !currentUserId) {
    return res.status(400).json({
      message: "Missing photoId, commentId, or user information."
    });
  }

  try {
    const updatedPhoto = await Photo.findOneAndUpdate(
      {
        _id: photoId,
        "comments._id": commentId,
        "comments.user": currentUserId 
      },
      {
        $pull: {
          comments: { _id: commentId } 
        }
      },
      { new: true } 
    );

    if (!updatedPhoto) {
      return res.status(403).json({ 
        message: "Comment not found or you are not authorized to delete this comment."
      });
    }

    return res.status(200).json({ 
      updatedPhoto
    });

  } catch (error) {
    return res.status(500).json({
      message: error?.message || "Server error while deleting comment.",
    });
  }
}

module.exports = {
  getCommentsByUserId,
  deleteCommentById
};
