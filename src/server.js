import app from "./app.js";
import config from "./config/config.js";

let server;

const startServer = async () => {
  //access port
  const port = config.PORT || 1100;
  //Database connection
  
    
  //server listening
  server = app.listen(port, () => {
    console.log(`Server listening on port: http://localhost:${port}`);
  });
};

//catch unhandled error
process.on("unhandledRejection", (reason) => {
  console.log(`Unhandled Rejection at: ${reason}`);
  shutdownServer();
});

process.on("uncaughtException", (error) => {
  console.log(`Uncaught Exception at: ${error}`);
  shutdownServer();
})

//Server shutdown
function shutdownServer() {
  if (server) {
    server.close(() => {
      console.log("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
}

startServer();