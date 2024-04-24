const OneToOneMessage = require("../../models/OneToOneMessage");
const User = require("../../models/userModels");

module.exports = (socket, io, user_id) => {
  // -> to get all user to whom client chatted.
  const getAllConversation = async ({ user_id }, callback) => {
    const exisiting_conversation = await OneToOneMessage.find(
      {
        participants: { $all: [user_id] },
      },
      { lastMessage: 1, participants: 1, pinned: 1, _id: 1 }
    ).populate("participants", "firstName lastName _id email status");
    callback(exisiting_conversation); // return data to client.
  };
  socket.on("chat:get_all_conversation", getAllConversation);
  // -------------------------------------------------------------------- //

  // -> to get one to one chat room id.
  const getOTOroomid = async ({ client_id, friend_id }, callback) => {
    const exisiting_conversation = await OneToOneMessage.findOne({
      participants: { $all: [client_id, friend_id] },
    }).populate("participants", "firstName lastName _id email status");

    if (!exisiting_conversation) {
      const new_conversation = await OneToOneMessage.create({
        participants: [client_id, friend_id],
        messages: [],
      });
      callback(new_conversation);
    } else {
      callback(exisiting_conversation);
    }
  };
  socket.on("chat:get_OTO_room_id", getOTOroomid);
  // -------------------------------------------------------------------- //

  // -> to get one to one chat history.
  const getOTOchatHistory = async ({ client_id, room_id }, callback) => {
    const conversation_history = await OneToOneMessage.findById(
      room_id
    ).populate("participants", "firstName lastName _id email status");

    const friend = conversation_history.participants.find(
      (user) => user._id.toString() !== client_id.toString()
    );
    const conversation = conversation_history.messages;
    callback({
      friend,
      conversation,
    });
  };
  socket.on("chat:get_OTO_chat_history", getOTOchatHistory);
  // -------------------------------------------------------------------- //

  // -> to get one to one chat history.
  const sendOTOmsg = async ({ client_id, room_id, msg }) => {
    // msg: -> can have
    // {
    //   to: "",
    //   from: "",
    //   type:  ["Text", "Media", "Document", "Link"],
    //   text: "",
    //   attachment: "",
    // }

    const conversation_history = await OneToOneMessage.findById(room_id);
    conversation_history.lastMessage = {
      text: msg.text,
      seen: false,
      createdAt: Date.now(),
    };
    conversation_history.messages.push(msg);

    // saving doc after making changes.
    await conversation_history.save({ new: true, validateModifiedOnly: true });
    let reciever_id = await conversation_history.participants.find(
      (id) => id.toString() !== client_id.toString()
    );
    const sender = await User.findById(client_id);
    const reciever = await User.findById(reciever_id);

    // sending information to both users.
    io.to(reciever.socket_id).emit("chat:new_OTO_msg_recieved", {
      room_id,
      status: "done",
      msg: {
        ...msg,
        from: {
          _id: reciever._id,
          firstName: reciever.firstName,
          lastName: reciever.lastName,
          status: reciever.status,
        },
      },
    });
    io.to(sender.socket_id).emit("chat:new_OTO_msg_sent", {
      room_id,
      status: "done",
      msg,
    });
  };
  socket.on("chat:send_OTO_msg", sendOTOmsg);
  // -------------------------------------------------------------------- //
};
