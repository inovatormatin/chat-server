const jwt = require("jsonwebtoken");

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

// User model
const User = require("../models/userModels");

// register new user
exports.register = async (req, res, next) => {
  const { firstName, lastName, eamil, password } = req.body;
};

// user login
exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  //   checking we get both inputs.
  if (!email || !password) {
    res.status(400).json({
      status: "error",
      message: "Both email and password are required.",
    });
  }

  // Find the user
  const userDoc = await User.findOne({ email: email }).select("+password");
  // No user found
  if (!userDoc) {
    res.status(400).json({
      status: "error",
      message: "Email is incorrect.",
    });
  }
  // wrong password
  if (!(await userDoc.correctPassword(password, userDoc.password))) {
    res.status(400).json({
      status: "error",
      message: "Password is incorrect.",
    });
  }
  // User found and password also matched
  const token = signToken(userDoc._id);
  res.status(200).json({
    status: "success",
    message: "Login successfully.",
    token: token,
  });
};
