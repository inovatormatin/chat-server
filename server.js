const app = require("./app");
const http = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const User = require("./models/userModels");
const FriendRequest = require("./models/friendRequest");
const path = require("path");
const OneToOneMessage = require("./models/OneToOneMessage");
const { connect_io, onConnection } = require("./socket");

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
const io = connect_io(server);

// Listen for socket.io connection
io.on("connection", (socket) => {
  onConnection(socket, io);
});

// listen method
const port = process.env.PORT || 8000;
server.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});

process.on("unhandledRejection", async (err) => {
  console.log(err);
});
