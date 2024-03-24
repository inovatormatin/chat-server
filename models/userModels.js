const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, "firstName is required."],
  },
  lastName: {
    type: String,
    required: [true, "lastName is required."],
  },
  avatar: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "email is required."],
    validate: {
      validator: function (email) {
        return String(email)
          .toLowerCase()
          .match(
            /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
          );
      },
      message: (props) => `Email (${props.value}) is invalid.`,
    },
  },
  password: {
    type: String,
  },
  passwordConfirm: {
    type: String,
  },
  // whenever user change their password and logged in into multiple devices. It will help to logged out from all those devices.
  passwordChangedAt: {
    type: Date,
  },
  // we will use this token when user wants to reset the password.
  passwordResetToken: {
    type: String,
  },
  passwordResetExpires: {
    type: Date,
  },
  careatedAt: {
    type: Date,
  },
  updatedAt: {
    type: Date,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  otp: {
    type: Number,
  },
  otp_expiry_time: {
    type: Date,
  },
});

// Mongoose Hooks
userSchema.pre("save", function (next) {
  // Run this condition when there is change in OTP other wise pass to next controller.
  if (!this.isModified("otp")) return next();
  // Hash the OTP at cost of 12.
  this.otp = bcrypt.hash(this.otp, 12);
  next();
}); // bcrypt OTP.

userSchema.pre("save", function (next) {
  // Run this condition when there is change in password other wise pass to next controller.
  if (!this.isModified("password")) return next();
  // Hash the password at cost of 12.
  this.password = bcrypt.hash(this.password, 12);
  next();
}); // bcrypt password.

// methods are basically function which can access property from the provided schema.

// -> compair password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// -> compair otp
userSchema.methods.correctOtp = async function (candidateOtp, userOtp) {
  return await bcrypt.compare(candidateOtp, userOtp);
};

// -> Create reset password token.
userSchema.methods.createResetToken = async function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.passwordResetExpires = Date.now() + 3 * 60 * 1000; // 3 minutes expiry time
  return resetToken;
};

// -> Check if user updated password after issuing the token.
userSchema.methods.changedPasswordAfter = async function (timeStamp) {
  return timeStamp < this.passwordChangedAt;
};

const User = new mongoose.model("User", userSchema);
module.exports = User;
