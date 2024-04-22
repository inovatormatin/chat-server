const OneToOneMessage = require("../../models/OneToOneMessage");
const Synergy = require("../../models/synergyModel");
const User = require("../../models/userModels");

module.exports = (socket, io, user_id) => {
  // -> to send friend request
  const sendFriendRequest = async ({ sender_id, receiver_id }) => {
    const sender = await User.findById(sender_id);
    const receiver = await User.findById(receiver_id);
    // validation check
    let validation = await Synergy.findOne({
      sender: sender_id,
      recipient: receiver_id,
    });
    if (validation === null) {
      // create new friend request in DB
      await Synergy.create({
        sender: sender_id,
        recipient: receiver_id,
        synergy_status: "pending",
      });
      // sending information to both users.
      io.to(receiver.socket_id).emit("app:new_friend_request_received", {
        msg: `${sender.firstName} wants to be your friend.`,
      });
      io.to(sender.socket_id).emit("app:new_friend_request_sent", {
        receiver_id,
        msg: `Friend request sent to ${receiver.firstName} ${receiver.lastName}`,
      });
    } else {
      io.to(sender.socket_id).emit("app:new_friend_request_sent", {
        receiver_id,
        msg: `You already sent request to ${receiver.firstName} ${receiver.lastName}`,
      });
    }
  };
  socket.on("user:send_friend_request", sendFriendRequest);
  // -------------------------------------------------------------------- //

  // -> to withdraw friend request
  const withdrawFriendRequest = async ({ sender_id, receiver_id }) => {
    const sender = await User.findById(sender_id);
    const receiver = await User.findById(receiver_id);
    // validation check
    let friend_request = await Synergy.findOneAndDelete({
      sender: sender_id,
      recipient: receiver_id,
      synergy_status: "pending",
    });
    // sending information to both user.
    io.to(receiver.socket_id).emit("app:friend_request_witdrawn", {
      msg: `Friend request withdrawn`,
    });
    io.to(sender.socket_id).emit("user:revoked_friend_request", {
      msg: `Friend request withdrawn from ${receiver.firstName} ${receiver.lastName}`,
    });
  };
  socket.on("user:withdraw_friend_request", withdrawFriendRequest);
  // -------------------------------------------------------------------- //

  // -> to accept friend request
  const acceptFriendRequest = async ({ receiver_id, sender_id }) => {
    const sender = await User.findById(sender_id);
    const receiver = await User.findById(receiver_id);
    // validation check
    let friend_request = await Synergy.findOne({
      recipient: sender_id,
      sender: receiver_id,
      synergy_status: "pending",
    }); // find friend request in DB
    if (friend_request) {
      // update synergy status
      friend_request.synergy_status = "friend";
      await friend_request.save({ new: true, validateModifiedOnly: true });
      // sending information to both users.
      io.to(receiver.socket_id).emit("user:accept_friend_request", {
        msg: `${sender.firstName} ${sender.lastName} accepted your friend request.`,
      });
      io.to(sender.socket_id).emit("app:friend_request_approved", {
        msg: `${receiver.firstName} ${receiver.lastName} added to your friend list.`,
      });
    }
  };
  socket.on("user:accept_friend_request", acceptFriendRequest);
  // -------------------------------------------------------------------- //

  // -> to decline friend request
  const declineFriendRequest = async ({ receiver_id, sender_id }) => {
    const receiver = await User.findById(receiver_id);
    const sender = await User.findById(sender_id);
    // validation check
    let friend_request = await Synergy.findOneAndDelete({
      recipient: sender_id,
      sender: receiver_id,
      synergy_status: "pending",
    });
    // sending information to both user.
    io.to(sender.socket_id).emit("user:declined_friend_request", {
      msg: `Friend request declined`,
    });
    io.to(receiver.socket_id).emit("app:friend_request_rejected", {
      msg: `Friend request declined by ${receiver.firstName} ${receiver.lastName}`,
    });
  };
  socket.on("user:decline_friend_request", declineFriendRequest);
  // -------------------------------------------------------------------- //
};
