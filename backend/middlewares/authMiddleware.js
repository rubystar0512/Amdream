const User = require("../models/user");
const jwt = require("jsonwebtoken");
const key = require("../configs/key");

exports.authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    jwt.verify(token, key.jwt.secret);
    if (token == "") {
      res.status(401).json({ msg: "No Token! Please Login Again!" });
      return;
    }

    const user = await User.findOne({ where: { token } });
    if (!user) {
      res.status(401).json({ msg: "No Vailed Token! Please Login Again!" });
      return;
    }
    req.email = user.email;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ msg: "Token Expired! Please Login Again!" });
    }
    return res.status(401).json({ msg: "Invalid Token! Please Login Again!" });
  }
};
