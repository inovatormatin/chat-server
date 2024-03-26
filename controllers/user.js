const User = require("../models/userModels");
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
