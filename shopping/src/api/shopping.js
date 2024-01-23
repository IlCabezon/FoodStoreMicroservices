const ShoppingService = require("../services/shopping-service");
const { PublishMessage, SubscribeMessage } = require("../utils");
const UserAuth = require("./middlewares/auth");
const { SHOPPING_BINDING_KEY, CUSTOMER_BINDING_KEY } = require("../config");

module.exports = (app, channel) => {
  const service = new ShoppingService();

  SubscribeMessage(channel, service, SHOPPING_BINDING_KEY);

  // Cart

  app.get("/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    try {
      const data = await service.GetCart({ _id });
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { product_id, qty } = req.body;

    const data = await service.AddCartItem(_id, product_id, qty);

    return res.status(200).json(data);
  });

  app.delete("/cart/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { id: product_id } = req.params;

    const { data } = await service.RemoveCartItem(_id, product_id);

    return res.status(200).json(data);
  });

  // Orders

  app.post("/order", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { txnNumber } = req.body;

    try {
      const { data } = await service.PlaceOrder({ _id, txnNumber });

      const payload = await service.GetOrderPayload(_id, data, "CREATE_ORDER");
      // PublishCustomerEvent(payload);
      PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(payload));

      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/orders", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try {
      const { data } = await service.GetOrders(_id);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });
};
