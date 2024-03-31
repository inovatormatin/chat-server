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
    unique: true,
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
    required: [true, "Password is required"],
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
    type: String,
  },
  otp_expiry_time: {
    type: Date,
  },
  socket_id: {
    type: String,
  },
  friends: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  status: {
    type: String,
    enum: ["Online", "Offline"],
  },
});

// methods are basically function which can access property from the provided schema.

// -> compair password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = new mongoose.model("User", userSchema);
module.exports = User;
