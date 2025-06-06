const mongoose = require("mongoose");
const User = require("../db/userModel");
const Photo = require("../db/photoModel");
const jwt = require("../utils/jwt");

async function getUserById(req, res, next) {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        message: `Invalid user ID: ${userId}`,
      });
    }

    const user = await User.findById(userId).select("-__v");

    if (!user) {
      return res.status(404).json({
        message: `User with ID ${id} not found`,
      });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await User.find({}).select("-__v");

    let photos = await Photo.find({}, "user_id comments.user");
    photos = JSON.parse(JSON.stringify(photos));
    console.log(photos[0].comments);
    const photoStats = {};
    const commentStats = {};
    for (const photo of photos) {
      if (!photoStats[photo.user_id]) {
        photoStats[photo.user_id] = 1;
      } else {
        photoStats[photo.user_id]++;
      }

      for (const comment of photo.comments) {
        if (!commentStats[comment.user]) {
          commentStats[comment.user] = 1;
        } else {
          commentStats[comment.user]++;
        }
      }
    }

    return res.status(200).json({
      users,
      photoStats,
      commentStats,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
}

async function login(req, res) {
  try {
    const { login_name, password } = req.body;
    const user = await User.find({
      login_name, password  
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Login name is incorrect" });
    }

    const payload = {
      _id: user[0]._id.toString(),
      first_name: user[0].first_name,
       login_name: user[0].login_name 
    };

    const token = await jwt.generateJwtToken(payload);
    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: false, // true
      maxAge: 30 * 60 * 1000,
      sameSite: "Lax",
      path: "/",
    });

    return res.status(200).json({
      _id: user[0]._id.toString(),
      first_name: user[0].first_name 
    });
  } catch (error) {
    return res.status(500).json({
      message: error?.message,
    });
  }
}

function logout(req, res) {
  res.clearCookie("accessToken");
  res.status(200).send({ message: "Logged out successfully" });
}

async function updateProfile(req, res) {
  // const { ... } = req.body; 

  const user = await User.findById(req.currentUser._id); 


  // user.first_name = ...

  // const updatedUser = await user.save(); 
  
}

module.exports = {
  getUserById,
  getAllUsers,
  login,
  logout,
  updateProfile
};
