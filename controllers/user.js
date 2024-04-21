const User = require("../models/userModels");
const Synergy = require("../models/synergyModel");
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

// get all user for explore section.
exports.getUsers = async (req, res, next) => {
  const this_user = req.userDoc; // user who made the request

  let user_friends_list = await Synergy.find({
    $or: [{ sender: this_user._id }, { recipient: this_user._id }],
    synergy_status: "friend",
  })
    .select("recipient sender -_id")
    .lean();

  user_friends_list = await user_friends_list.reduce((acc, obj) => {
    if (obj.sender.toString() !== this_user._id.toString()) {
      acc.push(obj.sender);
    } else if (obj.recipient.toString() !== this_user._id.toString()) {
      acc.push(obj.recipient);
    }
    return acc;
  }, []);

  const user_friends_request_sent = await Synergy.find({
    sender: this_user._id,
    synergy_status: "pending",
  })
    .distinct("recipient")
    .lean(); // get pending friend req.

  const user_friends_request_received = await Synergy.find({
    recipient: this_user._id,
    synergy_status: "pending",
  })
    .distinct("sender")
    .lean(); // get received friend req.

  const user_blocked_list = await Synergy.find({
    sender: this_user._id,
    synergy_status: "blocked",
  })
    .distinct("recipient")
    .lean(); // get blocked user.

  const dont_include = [
    this_user._id,
    ...user_friends_list,
    ...user_blocked_list,
  ]; // combine array of user id to filter out.

  const users_list = await User.aggregate([
    {
      $match: { verified: true, _id: { $nin: dont_include } }, // Match verified users and Exclude users in pendingUsers list
    },
    {
      $project: { firstName: 1, lastName: 1, status: 1, _id: 1 }, // Project only necessary fields
    },
    {
      $addFields: {
        synergy_status: {
          $switch: {
            branches: [
              {
                case: { $in: ["$_id", user_friends_request_sent] },
                then: "sent",
              },
              {
                case: { $in: ["$_id", user_friends_request_received] },
                then: "received",
              },
            ],
            default: "unknown", // Default value if none of the conditions match
          },
        },
      },
    },
  ]);

  if (!users_list) {
    res.status(400).json({
      status: "error",
      message: "Internal server error.",
    });
    return;
  } // incase something went wrong.

  res.status(200).json({
    status: "success",
    message: "List of users those are not in friend list.",
    data: users_list,
  });
};

// Get friends list.
exports.getFriends = async (req, res, next) => {
  const this_user = req.userDoc; // user who made the request.
  const user_friends_list = await Synergy.aggregate([
    {
      $match: {
        $or: [{ sender: this_user._id }, { recipient: this_user._id }],
        synergy_status: "friend",
      },
    },
    {
      $addFields: {
        friendData: {
          $cond: {
            if: { $eq: ["$sender", this_user._id] },
            then: "$recipient",
            else: "$sender",
          },
        },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "friendData",
        foreignField: "_id",
        as: "friendDetails",
      },
    },
    {
      $unwind: "$friendDetails",
    },
    {
      $project: {
        _id: "$friendDetails._id",
        firstName: "$friendDetails.firstName",
        lastName: "$friendDetails.lastName",
        status: "$friendDetails.status",
      },
    },
  ]);

  if (!user_friends_list) {
    res.status(400).json({
      status: "error",
      message: "Internal server error.",
    });
    return;
  } // incase something went wrong.

  res.status(200).json({
    status: "success",
    message: "Users friend list.",
    data: user_friends_list,
  });
};

// Get friend requests.
exports.getFriendsRequest = async (req, res, next) => {
  const this_user = req.userDoc; // user who made the request.
  const user_friends_request = await Synergy.aggregate([
    {
      $match: {
        recipient: this_user._id,
        synergy_status: "pending",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "sender",
        foreignField: "_id",
        as: "sender",
      },
    },
    {
      $unwind: "$sender",
    },
    {
      $project: {
        _id: "$sender._id",
        firstName: "$sender.firstName",
        lastName: "$sender.lastName",
        status: "$sender.status",
      },
    },
  ]);

  if (!user_friends_request) {
    res.status(400).json({
      status: "error",
      message: "Internal server error.",
    });
    return;
  } // incase something went wrong.

  res.status(200).json({
    status: "success",
    message: "Users friend's request.",
    data: user_friends_request,
  });
};
