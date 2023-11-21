const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  const token = jwt.sign(
    { userId: user._id, email: user.email },
    process.env.TOKEN_SECRET,
    { expiresIn: "1h" }
  );

  return token;
};

module.exports = generateToken;
