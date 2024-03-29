const router = require("express").Router();
const {
  login,
  forgotPassword,
  register,
  sendOTP,
  verifyOTP,
  resetPassword,
} = require("../controllers/auth");
const { body } = require("express-validator");

// Login
router.post(
  "/login",
  body("email", "Email is required.").exists(),
  body("email", "Invalid email.").isEmail(),
  body("password", "Password is required.").exists(),
  login
);

// Sign up
router.post(
  "/register",
  body("firstName", "First Name is required.").exists(),
  body("lastName", "Last Name is required.").exists(),
  body("email", "Email is required.").exists(),
  body("email", "Invalid email.").isEmail(),
  body("password", "Password is required.").exists(),
  body("password", "Password can't be less then 5 character").isLength({
    min: 5,
  }),
  register,
  sendOTP
);

// router.post("/send-otp", sendOTP); <- NOT IN USE

// verify OTP
router.post(
  "/verify-otp",
  body("email", "Email is required").exists(),
  body("otp", "OTP is required").exists(),
  verifyOTP
);

// Forgot Password
router.post(
  "/forgot-password",
  body("email", "Email is required.").exists(),
  forgotPassword
);

// Reset Password
router.post(
  "/reset-password",
  body("newPassword", "New Password is required.").exists(),
  body("confirmPassword", "Confirm Password is required.").exists(),
  body("newPassword", "Password can't be less then 5 character").isLength({
    min: 5,
  }),
  body("resetToken", "Reset token is required.").exists(),
  resetPassword
);

module.exports = router;
