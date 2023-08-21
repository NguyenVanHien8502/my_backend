const jwt = require("jsonwebtoken");

const generateRefreshToken = (id) => {
  const refreshToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "3d" });
  return refreshToken;
};

module.exports = generateRefreshToken;
