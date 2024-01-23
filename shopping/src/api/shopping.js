const ShoppingService = require("../services/shopping-service");
const { SubscribeMessage } = require("../utils");
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

  // Wishlist
  app.get("/wishlist", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const data = await service.GetWishlist(_id);
    return res.status(200).json(data);
  });

  app.post("/wishlist", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { product_id } = req.body;

    const data = await service.AddToWishlist(_id, product_id);
    return res.status(200).json(data);
  });

  app.delete("/wishlist/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { id: product_id } = req.params;

    const data = await service.RemoveFromWishlist(_id, product_id);
    return res.status(200).json(data);
  });

  // Orders

  app.get("/orders", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try {
      const data = await service.GetOrders(_id);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/order/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { id: orderId } = req.params;

    const data = await service.GetOrder(_id, orderId);
    res.status(200).json(data);
  });

  app.post("/order", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { txnNumber } = req.body;

    try {
      const data = await service.CreateOrder(_id, txnNumber);

      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });
};
