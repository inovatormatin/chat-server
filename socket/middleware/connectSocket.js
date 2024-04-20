const { Server } = require("socket.io");
const dotenv = require("dotenv");

// get app configuration
dotenv.config({
  path: "./config.env",
});

// socket.io config.
exports.connect_io = (server) => {
  return new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ["GET", "POST"],
    }, // allowing to connect the origin.
  });
};
