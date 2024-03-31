const app = require("./app");
const http = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const User = require("./models/userModels");
const FriendRequest = require("./models/friendRequest");

// configure
dotenv.config({
  path: "./config.env",
});

// handle uncaught exception.
process.on("uncaughtException", (err) => {
  console.log(err);
  process.exit(1); // this means we shutted down our server currently because of an application failure.
}); // process.on() is kind of an event listner

// Database URL
// const DB = process.env.DB_URI.replace("<PASSWORD>", process.env.DB_PASSWORD);
const DB = "mongodb://localhost:27017/chat_server"; // loacal DB

// Connecting mongoDB.
mongoose
  .connect(DB)
  .then(() => {
    console.log("DB connected successfully.");
  })
  .catch((err) => {
    console.log("Something went wrong while connecting DB.", err);
  });

// created the server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  }, // allowing to connect the origin.
});

// Listen for socket.io connection
io.on("connection", async (socket) => {
  // console.log(JSON.stringify(socket.handshake.query())); // to see what kind of data we are getting.
  //  this will run whenever client side try to connect with our server.
  const user_id = socket.handshake.query["user_id"]; // we can receive many data in query
  const socket_id = socket.id;
  console.log(`User connected ${socket_id}`);
  if (Boolean(user_id)) {
    await User.findByIdAndUpdate(user_id, { socket_id, status: "Online" });
  }
  // Socket event listeners.

  // -> on sending friend request
  socket.on("friend_request", async (data) => {
    // console.log(data.to);
    // here data : {
    //  to : "user id to whom we want to send the friend request.",
    //  from : "user id from whom we got the friend request"
    // }
    const to_user = await User.findById(data.to).select("socket_id");
    const from_user = await User.findById(data.from).select("socket_id"); // taking out user socket ID .
    await FriendRequest.create({
      sender: from_user,
      recipient: to_user,
    }); // Create Friend request

    // => Emiting the events
    io.to(to_user.socket_id).emit("new_friend_request", {
      message: "New friend request recieved.",
    }); // emit event => new_friend_request
    io.to(from_user.socket_id).emit("request_sent", {
      message: "Friend request sent.",
    }); // emit event => request_sent
  });

  // -> on accepting friend request
  socket.on("accept_request", async (data) => {
    // console.log(data);
    // here data : {
    //  request_id : "Getting friend request id to get sender and reciever."
    // }

    const request_doc = await FriendRequest.findById(data.request_id); // request doc
    const sender = await User.findById(request_doc.sender); // Sender doc
    const reciever = await User.findById(request_doc.recipient); // Receiver doc

    // Adding both of them in their friend list
    sender.friends.push(reciever);
    reciever.friends.push(sender);

    // Saving Document in DB
    await sender.save({ new: true, validateModifiedOnly: true });
    await reciever.save({ new: true, validateModifiedOnly: true });

    // Remove the request from DB
    await FriendRequest.findByIdAndDelete(data.request_id);

    // => Emiting events
    io.to(sender.socket_id).emit("request_accepted", {
      message: "Friend request accepted",
    });
    io.to(reciever.socket_id).emit("request_accepted", {
      message: "Friend request accepted",
    });
  });

  // -> closing the connection for this particular scoket
  socket.on("end", async (data) => {
    if (data.user_id) {
      await User.findByIdAndUpdate(data.user_id, { status: "Offline" });
    }
    console.log("Closing connection");
    socket.disconnect(0);
  });
});

// listen method
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});

process.on("unhandledRejection", async (err) => {
  console.log(err);
  process.close(() => {
    process.exit(1); // exit the node process
  }); // we are going to close our server after getting un handled rejection.
});
