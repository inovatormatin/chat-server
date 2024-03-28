const express = require("express"); // web framework for Node.js
const morgan = require("morgan"); // HTTP request logger middleware for Node.js

// security
const rateLimit = require("express-rate-limit"); // rate limiting the no. of request
const helmet = require("helmet");

const mongosanatize = require("express-mongo-sanitize"); // sanitize user data
const xss = require("xss"); // sanitize untrusted HTML we might get as input in request.

const bodyParser = require("body-parser"); // to convert data received from user into json.
const cors = require("cors"); // allow cors origin

const routes = require("./routes"); // routes

const app = express();

//
app.use(
  cors({
    origin: "*",
    methods: ["GET", "PATCH", "POST", "DELETE", "PUT"],
    credentials: true,
  })
);
app.use(mongosanatize());
// app.use(xss());
app.use(express.json({ limit: "10kb" })); // limit the amount of data that we can recieive from user.
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json()); // return the json data.
app.use(bodyParser.urlencoded({ extended: true }));
app.use(helmet());

// http logger - it will not run on production mode.
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// to add limit to prevent server from crassing by any bot.
const limiter = rateLimit({
  max: 3000,
  windowMs: 60 * 60 * 1000, // in one hour.
  message: "Too many request from this IP, Please try again in an hour",
});

// Routes
app.use("/chat_app", limiter);
app.use(routes);

module.exports = app;
