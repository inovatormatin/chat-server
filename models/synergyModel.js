const mongoose = require("mongoose");

const synergySchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  recipient: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  synergy_status: {
    type: String,
    enum: ["unknown", "pending", "friend", "blocked"],
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Synergy = new mongoose.model("Synergy", synergySchema);
module.exports = Synergy;
