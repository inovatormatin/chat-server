const User = require("../models/userModels");
const { connect_io } = require("./middleware/connectSocket");
const registerUserHandlers = require("./handlers/userHandlers");
const registerOTOchatHandlers = require("./handlers/oneToOneChatHandlers");

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
  registerUserHandlers(socket, io, user_id); // <=== user events ===>
  registerOTOchatHandlers(socket, io, user_id); // <=== one to one chat events ===>

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
