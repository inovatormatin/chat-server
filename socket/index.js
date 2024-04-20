const User = require("../models/userModels");
const { connect_io } = require("./middleware/connectSocket");
const registerUserHandlers = require("./handlers/userHandlers");

const onConnection = async (socket, io) => {
  //  this will run whenever client side try to connect with our server.
  const user_id = socket.handshake.query["user_id"]; // we can receive many data in query
  const socket_id = socket.id;
  console.log(`New user connected socket_id: ${socket_id}`);

  // user going online
  if (Boolean(user_id)) {
    const userDoc = await User.findById(user_id);
    userDoc.socket_id = socket_id;
    userDoc.status = "Online";
    setTimeout(() => {
      socket.broadcast.emit("user:online", {
        user_id: user_id,
        online: true,
        message: `${userDoc.firstName} is online.`,
      });
    }, 2000);
    // Save the changes
    await userDoc.save({ new: true, validateModifiedOnly: true });
    // broadcast user_disconnect -> server console.
    console.log(`${userDoc.firstName} is online.`);
  }

  // Socket Evenet listners.

  // <=== user events ===>
  registerUserHandlers(socket, io, user_id);

  // -> closing the connection for this particular scoket
  socket.on("disconnect", async (data) => {
    // user going offline
    if (Boolean(user_id)) {
      const userDoc = await User.findById(user_id);
      userDoc.status = "Offline";
      socket.broadcast.emit("user:offline", {
        user_id: user_id,
        online: false,
        message: `${userDoc.firstName} went offline.`,
      });
      // Save the changes
      await userDoc.save({ new: true, validateModifiedOnly: true });
      // broadcast user_disconnect -> server console.
      console.log(`${userDoc.firstName} went offline.`);
    }
    socket.disconnect(0);
    console.log(`Connection broken socket_id: ${socket_id}`);
  });
};

module.exports = {
  connect_io,
  onConnection,
};

// const onConnection = async (socket) => {
//   //  this will run whenever client side try to connect with our server.
//   const user_id = socket.handshake.query["user_id"]; // we can receive many data in query
//   const socket_id = socket.id;
//   console.log(`User connected ${socket_id}`);

//   if (Boolean(user_id)) {
//     await User.findByIdAndUpdate(user_id, { socket_id, status: "Online" });
//   }
//   // Socket event listeners.

//   // -> on sending friend request
//   socket.on("friend_request", async (data) => {
//     // here data : {
//     //  to : "user id to whom we want to send the friend request.",
//     //  from : "user id from whom we got the friend request"
//     // }
//     const to_user = await User.findById(data.to).select("socket_id");
//     const from_user = await User.findById(data.from).select("socket_id"); // taking out user socket ID .
//     await FriendRequest.create({
//       sender: from_user,
//       recipient: to_user,
//     }); // Create Friend request

//     // => Emiting the events
//     io.to(to_user.socket_id).emit("new_friend_request", {
//       message: "New friend request recieved.",
//     }); // emit event => new_friend_request
//     io.to(from_user.socket_id).emit("request_sent", {
//       message: "Friend request sent.",
//     }); // emit event => request_sent
//   });

//   // -> on accepting friend request
//   socket.on("accept_request", async (data) => {
//     // here data : {
//     //  request_id : "Getting friend request id to get sender and reciever."
//     // }

//     const request_doc = await FriendRequest.findById(data.request_id); // request doc
//     const sender = await User.findById(request_doc.sender); // Sender doc
//     const reciever = await User.findById(request_doc.recipient); // Receiver doc

//     // Adding both of them in their friend list
//     sender.friends.push(reciever);
//     reciever.friends.push(sender);

//     // Saving Document in DB
//     await sender.save({ new: true, validateModifiedOnly: true });
//     await reciever.save({ new: true, validateModifiedOnly: true });

//     // Remove the request from DB
//     await FriendRequest.findByIdAndDelete(data.request_id);

//     // => Emiting events
//     io.to(sender.socket_id).emit("request_accepted", {
//       message: "Friend request accepted",
//     });
//     io.to(reciever.socket_id).emit("request_accepted", {
//       message: "Friend request accepted",
//     });
//   });

//   // -> to get all user to whom client chatted.
//   socket.on("get_direct_conversations", async ({ user_id }, callback) => {
//     const exisiting_conversation = await OneToOneMessage.find({
//       participants: { $all: [user_id] },
//     }).populate("participants", "firstName, lastName, _id email status");

//     // there will be callback function we will get back from frontend
//     callback(exisiting_conversation);
//   });

//   // -> start new convesation
//   socket.on("start_conversation", async (data) => {
//     // data: { to, from } ;
//     const { to, from } = data;
//     // check if there is an existing convesation between from and to
//     const exisiting_conversation = await OneToOneMessage.find({
//       participants: { $size: 2, $all: [to, from] },
//       // condition = where participants have
//       // only two ids, and they must be
//       // to and from
//     }).populate("participants", "firstName lastName _id email status");

//     // if there is no exisiting conversation
//     if (exisiting_conversation.length === 0) {
//       let new_chat = await OneToOneMessage.create({
//         participants: [to, from],
//       });

//       new_chat = await OneToOneMessage.findById(new_chat._id).populate(
//         "participants",
//         "firstName lastName _id email status"
//       );

//       socket.emit("start_chat", new_chat);
//     }
//     // if there is exisiting conversation
//     else {
//       socket.emit("start_chat", exisiting_conversation[0]);
//     }
//   });

//   // -> to get all messages inside the chat.
//   socket.on("get_messages", async (data, callback) => {
//     const { messages } = await OneToOneMessage.findById(
//       data.conversation_id
//     ).select("messages");
//     callback(messages);
//   });

//   // -> Handle text/link message
//   socket.on("text_message", async (data) => {
//     // data: {to, from, text, conversation_id, type}
//     const { to, from, message, conversation_id, type } = data;
//     const to_user = await User.findById(to);
//     const from_user = await User.findById(from);
//     // create new conversation  if it doesn't exist yet or add new message to message list.
//     const new_message = {
//       to,
//       from,
//       type,
//       text: message,
//       created_at: Date.now(),
//     };
//     const chat = await OneToOneMessage.findById(conversation_id);
//     chat.messages.push(new_message);

//     // will be saving that data to DB
//     await chat.save({});

//     // emit event new_message -> to user
//     io.to(to_user.socket_id).emit("new_message", {
//       conversation_id,
//       message: new_message,
//     });
//     // emit event new_message -> from user
//     io.to(from_user.socket_id).emit("new_message", {
//       conversation_id,
//       message: new_message,
//     });
//   });

//   // -> Handle media/document message
//   socket.on("file_message", async (data) => {
//     // data: {to, from, text, file}

//     // get the file extension
//     const fileExtension = path.extname(data.file.name);

//     // generate a unique name
//     const fileName = `${Date.now()}_${Math.floor(
//       Math.random() * 10000
//     )}${fileExtension}`;

//     // Upload file to AWS s3

//     // create new conversation  if it doesn't exist yet or add new message to message list.

//     // will be saving that data to DB

//     // emit event incoming_message -> to user
//     // emit event outgoing_message -> from user
//   });

// };
