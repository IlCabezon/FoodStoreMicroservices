const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");
const { v4: uuidv4 } = require("uuid");

const { APP_SECRET, MESSAGE_BROKER_URL, EXCHANGE_NAME } = require("../config");
let ampqlibConnection = null;

//Utility functions
module.exports.GenerateSalt = async () => {
  return await bcrypt.genSalt();
};

module.exports.GeneratePassword = async (password, salt) => {
  return await bcrypt.hash(password, salt);
};

module.exports.ValidatePassword = async (
  enteredPassword,
  savedPassword,
  salt
) => {
  return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
};

module.exports.GenerateSignature = async (payload) => {
  return jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
};

module.exports.ValidateSignature = async (req) => {
  try {
    const signature = req.get("Authorization");
    console.log(signature);
    const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
    req.user = payload;
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

module.exports.FormateData = (data) => {
  if (data) {
    return { data };
  } else {
    throw new Error("Data Not found!");
  }
};

/* module.exports.PublishCustomerEvent = async (payload) => {
  const payloadJSON = JSON.stringify({ payload });

  fetch("http://localhost:8000/customer/app-events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payloadJSON,
  });
};

module.exports.PublishShoppingEvent = async (payload) => {
  const payloadJSON = JSON.stringify({ payload });

  fetch("http://localhost:8000/shopping/app-events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payloadJSON,
  });
};  */

// message broker
const getChannel = async () => {
  if (ampqlibConnection === null) {
    ampqlibConnection = await amqplib.connect(MESSAGE_BROKER_URL);
  }

  return await ampqlibConnection.createChannel();
};

// create a channel
module.exports.CreateChannel = async () => {
  try {
    const channel = await getChannel();
    await channel.assertExchange(EXCHANGE_NAME, "direct", false);
    return channel;
  } catch (err) {
    throw err;
  }
};

// publish messages
module.exports.PublishMessage = async (channel, binding_key, message) => {
  try {
    await channel.publish(EXCHANGE_NAME, binding_key, Buffer.from(message));
    console.log("Sent: ", message);
  } catch (err) {
    throw err;
  }
};

// // subscribe messages
// module.exports.SubscribeMessage = async (channel, service, binding_key) => {
//   try {
//     const appQueue = await channel.assertQueue(QUEUE_NAME);

//     channel.bindQueue(appQueue.queue, EXCHANGE_NAME, binding_key);
//     channel.consume(appQueue.queue, (data) => {
//       console.log("Recieved data");
//       console.log(data.content.toString());
//       channel.ack(data);
//     });
//   } catch (err) {
//     throw err;
//   }
// };

module.exports.RPCObserver = async (RPC_QUEUE_NAME, service) => {
  const channel = await getChannel();
  await channel.assertQueue(RPC_QUEUE_NAME, {
    durable: false,
  });

  channel.prefetch(1);
  channel.consume(
    RPC_QUEUE_NAME,
    async (msg) => {
      if (msg.content) {
        // DB operation
        const payload = JSON.parse(msg.content.toString());
        const response = await service.serveRPCRequest(payload);

        channel.sendToQueue(
          msg.properties.replyTo,
          Buffer.from(JSON.stringify(response)),
          {
            correlationId: msg.properties.correlationId,
          }
        );
        channel.ack(msg);
      }
    },
    {
      noAck: false,
    }
  );
};
