const app = require("./app");

const http = require("http");

// created the server
const server = http.createServer(app);

// listen method
const port = process.env.PORT || 8000;

server.listen(port, () => {
  console.log(`App is running on port: ${port}`);
});
