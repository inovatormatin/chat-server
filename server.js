const app = require("./app");
const http = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const { Server } = require("socket.io");
const User = require("./models/userModels");

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
  //  this will run whenever client side try to connect with our server.
  const user_id = socket.handshake.query["user_id"]; // we can receive many data in query
  const socket_id = socket.id;
  console.log(`User connected ${socket_id}`);
  if (user_id) {
    await User.findByIdAndUpdate(user_id, { socket_id });
  }
  // Socket event listeners.
  socket.on("friend_request", async (data) => {
    console.log(data.to);
    // here data : {to : "user id to whom i want to send the friend request."}
    const to = await User.findById(data.to); // taking out that user from DB to whom i want to send request.
    // TODO => Create Friend request
    io.to(to.socket_id).emit("new_friend_request", {

    });
  });
});

// listen method
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.close(() => {
    process.exit(1); // exit the node process
  }); // we are going to close our server after getting un handled rejection.
});
