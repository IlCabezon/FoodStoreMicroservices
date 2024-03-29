const { OrderModel, CartModel, WishlistModel } = require("../models");
const { v4: uuidv4 } = require("uuid");
const {
  APIError,
  BadRequestError,
  STATUS_CODES,
} = require("../../utils/app-errors");
const _ = require("lodash");

//Dealing with data base operations
class ShoppingRepository {
  // payment

  // Cart
  async Cart(customerId) {
    try {
      return CartModel.findOne({
        customerId,
      });
    } catch (err) {
      throw new APIError(err);
    }
  }

  async ManageCart(customerId, product, qty, isRemove = false) {
    try {
      const cart = await CartModel.findOne({ customerId });
      if (cart) {
        if (isRemove) {
          // handle remove
          const cartItems = _.filter(
            cart.items,
            (item) => item.product._id !== product.id
          );

          cart.items = cartItems;
        } else {
          const cartIndex = _.findIndex(cart.items, {
            product: { _id: product._id },
          });
          if (cartIndex > -1) {
            cart.items[cartIndex].unit = qty;
          } else {
            cart.items.push({ product: { ...product }, unit: qty });
          }
        }
        return await cart.save();
      } else {
        // create a new one
        return await CartModel.create({
          customerId,
          items: [{ product: { ...product }, unit: qty }],
        });
      }
    } catch (err) {
      throw new APIError(err);
    }
  }

  // Wishlist
  async Wishlist(customerId) {
    try {
      return WishlistModel.findOne({
        customerId,
      });
    } catch (err) {
      throw new APIError(err);
    }
  }

  async ManageWishlist(customerId, product_Id, isRemove = false) {
    try {
      const wishlist = await WishlistModel.findOne({ customerId });
      if (wishlist) {
        if (isRemove) {
          const wishlistProducts = _.filter(
            wishlist.products,
            (products) => products._id !== product_Id
          );
          wishlist.products = wishlistProducts;
        } else {
          const wishlistIndex = _.findIndex(wishlist.products, {
            _id: product_Id,
          });
          if (wishlistIndex < 0) {
            wishlist.products.push({ _id: product_Id });
          }
        }
        return wishlist.save();
      } else {
        // create new one
        return await WishlistModel.create({
          customerId,
          products: [{ _id: product_Id }],
        });
      }
    } catch (err) {
      throw new APIError(err);
    }
  }

  // Order
  async Orders(customerId, orderId) {
    try {
      if (orderId) {
        return OrderModel.findOne({ orderId });
      } else {
        return OrderModel.find({ customerId });
      }
    } catch (err) {
      throw new APIError(err);
    }
  }

  async CreateNewOrder(customerId, txnId) {
    //check transaction for payment Status

    try {
      const cart = await CartModel.findOne({ customerId });

      if (cart) {
        let amount = 0;

        let cartItems = cart.items;

        if (cartItems.length > 0) {
          //process Order
          cartItems.map((item) => {
            amount += parseInt(item.product.price) * parseInt(item.unit);
          });

          const orderId = uuidv4();

          const order = new OrderModel({
            orderId,
            customerId,
            amount,
            txnId,
            status: "received",
            items: cartItems,
          });

          cart.items = [];

          const orderResult = await order.save();
          await cart.save();

          return orderResult;
        }
      }

      return {};
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Category"
      );
    }
  }

  async DeleteProfileData(customerId) {
    try {
      return Promise.all([
        CartModel.findOneAndDelete({ customerId }),
        WishlistModel.findOneAndDelete({ customerId }),
      ]);
    } catch (err) {
      throw new APIError(err);
    }
  }
}

module.exports = ShoppingRepository;
