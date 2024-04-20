const OneToOneMessage = require("../../models/OneToOneMessage");
const FriendRequest = require("../../models/friendRequest");
const Synergy = require("../../models/synergyModel");
const User = require("../../models/userModels");

module.exports = (socket, io, user_id) => {
  // -> to get all user to whom client chatted.
  const getAllConversation = async ({ user_id }, callback) => {
    const exisiting_conversation = await OneToOneMessage.find({
      participants: { $all: [user_id] },
    }).populate("participants", "firstName, lastName, _id email status");
    callback(exisiting_conversation); // return data to client.
  };
  socket.on("user:get_all_conversation", getAllConversation);
  // -------------------------------------------------------------------- //

  // -> to send friend request
  const sendFriendRequest = async ({ sender_id, receiver_id }) => {
    const sender = await User.findById(sender_id);
    const receiver = await User.findById(receiver_id);
    // create new friend request in DB
    await Synergy.create({
      sender: sender_id,
      recipient: receiver_id,
      synergy_status: "pending",
    });
    // sending information to both users.
    io.to(receiver.socket_id).emit("app:new_friend_request_received", {
      msg: `${receiver.firstName} wants to be your friend.`,
    });
    io.to(sender.socket_id).emit("app:new_friend_request_sent", {
      receiver_id,
      msg: `Friend request sent to ${receiver.firstName} ${receiver.lastName}`,
    });
  };
  socket.on("user:send_friend_request", sendFriendRequest);
  // -------------------------------------------------------------------- //
};
