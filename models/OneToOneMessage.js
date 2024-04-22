const mongoose = require("mongoose");

const OneToOneMessageSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  ],
  messages: [
    {
      to: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      from: {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
      type: {
        type: String,
        enum: ["Text", "Media", "Document", "Link"],
      },
      createdAt: {
        type: Date,
        default: Date.now(),
      },
      text: {
        type: String,
      },
      attachment: {
        type: String,
      },
    },
  ],
  pinned: {
    type: Boolean,
    default: false,
  },
  lastMessage: {
    text: { type: String, default: "" },
    seen: { type: Boolean, default: false },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
});

const OneToOneMessage = new mongoose.model(
  "OneToOneMessage",
  OneToOneMessageSchema
);
module.exports = OneToOneMessage;
