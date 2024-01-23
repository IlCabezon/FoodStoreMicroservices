const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const amqplib = require("amqplib");
const { v4: uuidv4 } = require("uuid");

const {
  APP_SECRET,
  MESSAGE_BROKER_URL,
  QUEUE_NAME,
  EXCHANGE_NAME,
  SHOPPING_BINDING_KEY,
} = require("../config");

let amqplibConnection = null;

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
  try {
    return await jwt.sign(payload, APP_SECRET, { expiresIn: "30d" });
  } catch (error) {
    console.log(error);
    return error;
  }
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
*/

// Message Broker
const getChannel = async () => {
  if (amqplibConnection === null) {
    amqplibConnection = await amqplib.connect(MESSAGE_BROKER_URL);
  }

  return await amqplibConnection.createChannel();
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
module.exports.PublishMessage = async (channel, service, message) => {
  try {
    await channel.publish(EXCHANGE_NAME, service, Buffer.from(message));
    console.log("Sent: ", message);
  } catch (err) {
    throw err;
  }
};

// subscribe messages
module.exports.SubscribeMessage = async (channel, service) => {
  try {
    await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
    const q = await channel.assertQueue("", { exclusive: true });
    console.log(`Waiting for messages in queue: ${q.queue}`);

    channel.bindQueue(q.queue, EXCHANGE_NAME, SHOPPING_BINDING_KEY);

    channel.consume(
      q.queue,
      (msg) => {
        if (msg.content) {
          console.log(`The message is: ${msg.content.toString()}`);
          service.SubscribeEvents(msg.content.toString());
        }
        console.log("[X] received");
      },
      {
        noAck: true,
      }
    );
  } catch (err) {
    throw err;
  }
};

const requestData = async (RPC_QUEUE_NAME, requestPayload, uuid) => {
  try {
    const channel = await getChannel();

    const q = await channel.assertQueue("", { exclusive: true });

    channel.sendToQueue(
      RPC_QUEUE_NAME,
      Buffer.from(JSON.stringify(requestPayload)),
      {
        replyTo: q.queue,
        correlationId: uuid,
      }
    );

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        channel.close();
        resolve("API could not fulfill the request!");
      }, 8000);
      channel.consume(
        q.queue,
        (msg) => {
          if (msg.properties.correlationId === uuid) {
            resolve(JSON.parse(msg.content.toString()));
            clearTimeout(timeout);
          } else {
            reject("Data not found!");
          }
        },
        {
          noAck: true,
        }
      );
    });
  } catch (err) {
    console.log(err);
    return "error";
  }
};

module.exports.RPCRequest = async (RPC_QUEUE_NAME, requestPayload) => {
  const uuid = uuidv4(); // correlationId
  return await requestData(RPC_QUEUE_NAME, requestPayload, uuid);
};

