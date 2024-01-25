const express = require("express");
const { PORT } = require("./config");
const { databaseConnection } = require("./database");
const expressApp = require("./express-app");
const { CreateChannel } = require("./utils");

const StartServer = async () => {
  const app = express();

  await databaseConnection();

  const channel = await CreateChannel();

  await expressApp(app, channel);

  // catch all err and format and report to logger
  app.use((err, req, res, next) => {
    const statuscode = err.statuscode || 500;
    const data = err.data || err.message;
    return res.status(statuscode).json(data)
  });

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
