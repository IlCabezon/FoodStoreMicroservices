const express = require("express");
const { PORT } = require("./config");
const { databaseConnection } = require("./database");
const expressApp = require("./express-app");
const { CreateChannel } = require("./utils");
const HandleErrors = require("./utils/error-handler");

const StartServer = async () => {
  const app = express();

  await databaseConnection();

  const channel = await CreateChannel();

  await expressApp(app, channel);

  // error handling
  app.use(HandleErrors);

  app
    .listen(PORT, () => {
      console.log(`listening to port ${PORT}`);
    })
    .on("error", (err) => {
      console.log(err);
      process.exit();
    });
};

StartServer();
