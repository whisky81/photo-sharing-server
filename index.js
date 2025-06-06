const express = require("express");
const app = express();
const cors = require("cors");
const cookie = require("cookie-parser");
const path = require("path");
const fs = require('fs');

const dbConnect = require("./db/dbConnect");
const UserRouter = require("./routes/UserRouter");
const PhotoRouter = require("./routes/PhotoRouter");
const CommentRouter = require("./routes/CommentRouter");
const authMiddleware = require("./middlewares/authMiddleware");
const { login, logout } = require("./controllers/UserController");

const Photo = require("./db/photoModel");
const User = require("./db/userModel");

dbConnect();

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true 
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookie()); 
app.use(authMiddleware); 
app.use("/api/user", UserRouter);
app.use("/api/photo", PhotoRouter);
app.use("/api/comment", CommentRouter); 

app.get("/", (req, res) => {
  res.send({ 
    "/": "Guide",
    "user": {
      "/api/user/list": "Get All Users",
      "/api/user/:userId": "Get User By ID",
    },
    "photo": {
      "/api/photo/list": "Get All Photos",
      "/api/photo/:photoId": "Get Photo By ID",
      "/api/photo/user/:userId": "Get Photos By User ID"
    },
    "comment": {
      "/api/comment/user/:userId": "Get Comments By User ID"
    }
  });
});

// auth
app.post("/admin/login", login);
app.post("/admin/logout", logout);

// comment 
app.post("/commentsOfPhoto/:photo_id", async (req, res) => {
  const { comment } = req.body; 
  const { photo_id } = req.params; 
  const userId = req.currentUser._id; 

  if (!comment) {
    return res.status(400).json({
      message: "Comment must not be empty"
    });
  }

  const photo = await Photo.findById(photo_id); 
  photo.comments.push({
    comment: comment,
    user: userId 
  });
  await photo.save();

  return res.status(201).json({
      message: "success"
    });
})

app.post("/photos/new", async (req, res) => {
  const { data, name } = req.body; 
  if (!data || !name) {
    return res.status(400).json({
      message: 'Missing required image'
    });
  }

  const matches = data.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    return res.status(400).json({ message: 'Invalid Format' });
  } 
  
  const uploadDir = path.join('../fe/public/images'); 
  const buffer = Buffer.from(matches[2], 'base64');
  const savePath = path.join(uploadDir, name);

  fs.writeFile(savePath, buffer, (err) => {
      if (err) return res.status(500).json({ message: (err?.message || 'Save Error') });
  });
  const newPhoto = await Photo.create({
    user_id: req.currentUser._id,
    file_name: name
  });

  return res.status(201).json(newPhoto); 
})

app.get("/stats", async (req, res) => {
  const photos = await Photo.find({ user_id: req.currentUser._id });
  const tmp = await Photo.find({ "comments.user": req.currentUser._id }); 
  let comment = 0;
  for (const photo of tmp) {
    for (const cm of photo.comments) {
      if (cm.user.toString() == req.currentUser._id ) {
        comment++;
      }
    }
  }
  return res.json({
    photo: photos.length,
    comment: comment 
  });
})

app.post("/user", async (req, res) => {
  const { login_name, password, first_name, last_name, location, description, occupation } = req.body; 
  const existingUser = await User.find({ login_name }); 
  if (existingUser.length !== 0) {
    return res.status(400).json({
      message: "Login name already exists"
    });
  }

  if (!first_name || !last_name || !password) {
    return res.status(400).json({
      message: "first_name, last_name, password must not be empty"
    });
  }

  const user = await User.create({
    first_name, last_name, location, description, occupation, login_name, password
  });

  return res.status(201).json({
    _id: user._id,
    login_name: user.login_name    
  });
});

app.listen(8081, () => {
  console.log("server listening on port 8081");
});
