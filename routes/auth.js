const router = require("express").Router();
const {
  login,
  forgotPassword,
  register,
  sendOTP,
  verifyOTP,
  resetPassword,
} = require("../controllers/auth");

router.post("/login", login);
router.post("/register", register, sendOTP);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
