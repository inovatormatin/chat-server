const router = require("express").Router();
const { protect } = require("../controllers/auth");
const { getUsers, updateMe, getFriends } = require("../controllers/user");

router.patch("/update-me", protect, updateMe);
router.get("/get-users", protect, getUsers);
router.get("/get-friends", protect, getFriends);
router.get("/get-friends-request", protect, getFriendsRequest);

module.exports = router;
