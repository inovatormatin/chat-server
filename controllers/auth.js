const jwt = require("jsonwebtoken");
const otpGenerator = require("otp-generator");
const crypto = require("crypto");
const { filterObject } = require("../utils/filterObj");
const User = require("../models/userModels");
const { promisify } = require("util");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET);

// Signup => register -> sendOTP -> verifyOTP

// register new user
exports.register = async (req, res, next) => {
  // validation Check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: errors.array()[0].msg,
    });
  }
  const { firstName, lastName, password, email } = req.body;
  const filteredBody = filterObject(
    {
      firstName,
      lastName,
      email,
      password: await bcrypt.hash(password, 12), // Hash the Password at cost of 12.
    },
    "firstName",
    "lastName",
    "email",
    "password"
  );

  // checking wether user already exists.
  const existing_user = await User.findOne({ email: req.body.email });

  if (existing_user && existing_user.verified) {
    res.status(400).json({
      status: "error",
      message: "Email is already in use, please login.",
    });
    return;
  } else if (existing_user) {
    await User.findOneAndUpdate({ email: req.body.email }, filteredBody, {
      new: true,
      validateModifiedOnly: true,
    });
    // generate OTP send email to user
    req.userId = existing_user._id;
    next(); // here next is the middleware we are going to recieve from parameters of function

    // Explanatio for findOneAndUpdate(
    // {} -> conditon by we found the doc.
    // {} -> keys that we want to update.
    // {new : true/false, validateModifiedOnly: true/false} ->
    // new will help to return new updated doc not the previous doc before update.
    // validateModifiedOnly will help to run validation only on those keys whose data is modified.
    // )
  } else {
    // If no user found in DB
    const new_user = await User.create(filteredBody);

    // generate OTP send email to user
    req.userId = new_user._id;
    next();
  }
};

// user login
exports.login = async (req, res, next) => {
  // validation Check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: errors.array()[0].msg,
    });
  }

  const { email, password } = req.body;

  // Find the user
  const userDoc = await User.findOne({ email: email }).select("+password");
  // No user found
  if (!userDoc) {
    res.status(400).json({
      status: "error",
      message: "Email is incorrect.",
    });
    return;
  }
  // wrong password
  if (!(await userDoc.correctPassword(password, userDoc.password))) {
    res.status(400).json({
      status: "error",
      message: "Password is incorrect.",
    });
    return;
  }
  // User found and password also matched
  const token = signToken(userDoc._id);
  res.status(200).json({
    status: "success",
    message: "Login successfully.",
    token: token,
  });
  return;
};

// Send OTP
exports.sendOTP = async (req, res, next) => {
  // validation Check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: errors.array()[0].msg,
    });
  }
  const { userId } = req;
  const new_otp = otpGenerator.generate(6, {
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });

  console.log(new_otp)
  const otp_expiry_time = Date.now() + 3 * 60 * 1000; // 3 minutes expiry time

  const userDoc = await User.findByIdAndUpdate(userId, {
    otp: await bcrypt.hash(new_otp, 12), // Hash the OTP at cost of 12.
    otp_expiry_time: otp_expiry_time,
  });

  // TODO - Send Email

  if (userDoc) {
    res.status(200).json({
      status: "success",
      message: "OTP sent successfully !",
    });
    return;
  } else {
    res.status(400).json({
      status: "error",
      message: "Something went wrong !",
    });
    return;
  }
};

// Verify the OTP
exports.verifyOTP = async (req, res, next) => {
  // validation Check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: errors.array()[0].msg,
    });
  }
  
  const { email, otp } = req.body;

  const userDoc = await User.findOne({
    email,
    otp_expiry_time: { $gt: Date.now() },
  });

  //
  if (!userDoc) {
    res.status(400).json({
      status: "error",
      message: "Email is envalid or OTP is expired.",
    });
    return;
  }

  // For inccorect OTP

  if (!(await bcrypt.compare(otp.toString(), userDoc.otp))) {
    res.status(400).json({
      status: "error",
      message: "Incorrect OTP.",
    });
    return;
  }

  // OTP is verified.
  userDoc.verified = true;
  userDoc.otp = undefined;

  // saving doc after making changes.
  await userDoc.save({ new: true, validateModifiedOnly: true });

  const token = signToken(userDoc._id);
  res.status(200).json({
    status: "success",
    message: "OTP verified.",
    token: token,
  });
  return;
};

// Forgot password
exports.forgotPassword = async (req, res, next) => {
  // validation Check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: errors.array()[0].msg,
    });
  }
  // 1. Get user email
  const { email } = req.body;
  // find the user
  const userDoc = await User.findOne({ email: email });
  // check wether account exist or not
  if (!userDoc) {
    res.status(400).json({
      status: "error",
      message: "No user found with this email.",
    });
    return;
  }

  // 2. After finding the user generate the random reset code

  const reset_token = await crypto.randomBytes(32).toString("hex"); // -> Create reset password token.
  userDoc.passwordResetToken = crypto
    .createHash("sha256")
    .update(reset_token)
    .digest("hex");
  userDoc.passwordResetExpires = Date.now() + 3 * 60 * 1000; // 3 minutes expiry time;

  const resetURL = `https://tawk.com/auth/reset-password/?code=${reset_token}`;

  await userDoc.save({ new: true, validateModifiedOnly: true });

  console.log(`code=${reset_token}`);

  try {
    // TODO => send email with reset URL
    res.status(200).json({
      status: "success",
      message: "Reset password link send to your email address.",
    });
    return;
  } catch (error) {
    userDoc.passwordResetToken = undefined;
    userDoc.passwordResetExpires = undefined;

    await userDoc.save({ validateBeforeSave: false });

    res.status(500).json({
      status: "error",
      message: "There is an error while sending email, please try again later.",
    });
    return;
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  // validation Check
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: "error",
      message: errors.array()[0].msg,
    });
  }

  const { newPassword, confirmPassword, resetToken } = req.body;

  // 1. Password Same validation
  if (newPassword !== confirmPassword) {
    res.status(400).json({
      status: "error",
      message: "Confirm Password didn't matched.",
    });
    return;
  }

  // 2. Find the user based on token
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const userDoc = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  // 3. If token is expired or token is incorrect.
  if (!userDoc) {
    res.status(400).json({
      status: "error",
      message: "Token is invalid or expired.",
    });
    return;
  }

  // 4. If all thing good - update keys.
  (userDoc.password = await bcrypt.hash(newPassword, 12)), // Hash the Password at cost of 12;
    (userDoc.passwordConfirm = await bcrypt.hash(confirmPassword, 12)); // Hash the C-Password at cost of 12
  userDoc.passwordResetToken = undefined;
  userDoc.passwordResetExpires = undefined;
  userDoc.passwordChangedAt = Date.now();

  // Save the changes
  await userDoc.save({ new: true, validateModifiedOnly: true });

  // 5. Send a notification via user email.
  // TODO -> send email

  // 6. Send the response to user
  const token = signToken(userDoc._id);
  res.status(200).json({
    status: "success",
    message: "Password changed successfully.",
    token,
  });
  return;
};

// Protect our end points, so that only registered user can make the request to our end points.
exports.protect = async (req, res, next) => {
  let token;
  // 1. Check wether there is a token provided by user or not.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else {
    res.status(400).json({
      status: "error",
      message: "Please login to get access.",
    });
    return;
  }

  // 2. Verification of token
  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3. Check wether user exist or not.
  const userDoc = await User.findById(decode.userId);
  if (!userDoc) {
    res.status(400).json({
      status: "error",
      message: "The user doesn't exist.",
    });
    return;
  }

  // TODO -> add a expiry time on tokken.

  // 4. Check if user changed thier password after token was issued.
  if (userDoc.changedPasswordAfter(decode.iat)) {
    res.status(400).json({
      status: "error",
      message: "User recently updated password, Please login again.",
    });
    return;
  }

  // If everything is fine - pass to next middleware
  req.userDoc = userDoc;
  next();
};
