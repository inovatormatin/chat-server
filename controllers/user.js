const User = require("../models/userModels");
const FriendRequest = require("../models/friendRequest");
const { filterObject } = require("../utils/filterObj");

// to update user info
exports.updateMe = async (req, res, next) => {
  const { userDoc } = req; // this will come from protect middleware
  const filteredBody = filterObject(
    req.body,
    "firstName",
    "lastName",
    "about",
    "avatar"
  );
  const updated_user = await User.findByIdAndUpdate(userDoc._id, filteredBody, {
    new: true,
    validateModifiedOnly: true,
  }); // find user by Id and update data.

  res.status(200).json({
    status: "success",
    data: updated_user,
    message: "Profile updated successfuly.",
  });
};

//
exports.getUsers = async (req, res, next) => {
  const all_users = await User.find({ verified: true }).select(
    "firstName lastName _id"
  ); // taking all all verified user.
  const this_user = req.userDoc; // user who made the request
  const remaining_users = all_users.filter(
    (user) =>
      !this_user.friends.includes(user._id) &&
      user._id.toString() !== this_user._id.toString()
  ); // filtering users who are not in friend list. And make sure to exclude requested user.

  if (!remaining_users) {
    res.status(400).json({
      status: "error",
      message: "Internal server error.",
    });
    return;
  } // incase something went wrong.

  res.status(200).json({
    status: "success",
    message: "List of users those are not in friend list.",
    data: remaining_users,
  });
};

// Get friends list
exports.getFriends = async (req, res, next) => {
  const {userDoc} = req; // user who made the request.
  const this_user = await User.findById(userDoc._id).populate(
    "friends",
    "_id firstName lastName"
  ); // Getting friend list and taking out only required data.
  

  if (!this_user) {
    res.status(400).json({
      status: "error",
      message: "Internal server error.",
    });
    return;
  } // incase something went wrong.

  res.status(200).json({
    status: "success",
    message: "Users friend list.",
    data: this_user.friends,
  });
};

// Get friend requests
exports.getFriendsRequest = async (req, res, next) => {
  const user = req.userDoc; // user who made the request.
  const friend_request = await FriendRequest.find({ recipient: user._id }).populate(
    "sender",
    "firstName lastName _id"
  ); // finding friend req corresponding to the user.

  if (!friend_request) {
    res.status(400).json({
      status: "error",
      message: "Internal server error.",
    });
    return;
  } // incase something went wrong.

  res.status(200).json({
    status: "success",
    message: "Users friend's request.",
    data: friend_request,
  });
};
