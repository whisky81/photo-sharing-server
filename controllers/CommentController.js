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

module.exports = {
  getCommentsByUserId,
};
