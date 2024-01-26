const { ShoppingRepository } = require("../database");
const { RPCRequest } = require("../utils");
const { NotFoundError } = require("../utils/app-errors");

// All Business logic will be here
class ShoppingService {
  constructor() {
    this.repository = new ShoppingRepository();
  }

  // cart info
  async AddCartItem(customerId, product_id, qty) {
    // grab product info from product service trough RPC
    const productResponse = await RPCRequest("PRODUCT_RPC", {
      type: "VIEW_PRODUCT",
      data: product_id,
    });
    if (productResponse && productResponse._id) {
      const data = await this.repository.ManageCart(
        customerId,
        productResponse,
        qty
      );

      return data;
    }

    throw new NotFoundError("Product data not found!");
  }

  async RemoveCartItem(customerId, product_id) {
    return await this.repository.ManageCart(
      customerId,
      { _id: product_id },
      0,
      true
    );
  }

  async GetCart({ _id }) {
    return this.repository.Cart(_id);
  }

  // Wishlist
  async GetWishlist(customerId) {
    const wishlist = await this.repository.Wishlist(customerId);
    const products = wishlist?.products ?? [];

    const ids = products.map((product) => product._id);

    // RPC call
    const productResponse = await RPCRequest("PRODUCT_RPC", {
      type: "VIEW_PRODUCTS",
      data: ids,
    });

    return productResponse || {};
  }

  async AddToWishlist(_id, product_id) {
    const result = await this.repository.ManageWishlist(_id, product_id);

    return result;
  }

  async RemoveFromWishlist(_id, product_id) {
    const result = await this.repository.ManageWishlist(_id, product_id, true);

    return result;
  }

  // Orders
  async CreateOrder(customerId, txnNumber) {
    return await this.repository.CreateNewOrder(customerId, txnNumber);
  }

  async GetOrder(customerId, orderId) {
    return this.repository.Orders(customerId, orderId);
  }

  async GetOrders(customerId) {
    return this.repository.Orders(customerId);
  }

  async SubscribeEvents(payload) {
    payload = JSON.parse(payload);

    const { event, data } = payload;

    const { userId, product, qty } = data;

    switch (event) {
      case "ADD_TO_CART":
        this.ManageCart(userId, product, qty, false);
        break;
      case "REMOVE_FROM_CART":
        this.ManageCart(userId, product, qty, true);
        break;
      default:
        break;
    }
  }

  async DeleteProfileData(customerId) {
    return this.repository.DeleteProfileData(customerId);
  }

  async SubscribeEvents(payload) {
    const parsedPayload = JSON.parse(payload);
    const { event, data } = parsedPayload;
    switch (event) {
      case "DELETE_PROFILE":
        await this.DeleteProfileData(data.userId);
        break;
      default:
        break;
    }
  }

  // async GetOrderPayload(userId, order, event) {
  //   if (order) {
  //     const payload = {
  //       event,
  //       data: {
  //         userId,
  //         order,
  //       },
  //     };
  //     return payload;
  //   } else {
  //     return FormateData({ error: "No Order available" });
  //   }
  // }
}

module.exports = ShoppingService;
