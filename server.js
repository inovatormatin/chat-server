const app = require("./app");
const http = require("http");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

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
