const jwt = require("../utils/jwt");
const allowed = {
  GET: new Set(["/api/photo/list", "/"]),
  POST: new Set(["/admin/login", "/user"]),
};

const authMiddleware = async (req, res, next) => {
  if (allowed[req.method].has(req.path)) {
    return next();
  }
  try {
    const token = req.cookies?.accessToken;
    if (!token) {
      throw new Error("Missing accessToken");
    }
    const decoded = await jwt.decodeJwtToken(token);
    if (!decoded._id || !decoded.first_name || !decoded.login_name) {
      throw new Error("Invalid Token");
    }
    req.currentUser = decoded;
    return next();
  } catch (error) {
    return res.status(400).json({
      message: error.message,
    });
  }
};

module.exports = authMiddleware;
