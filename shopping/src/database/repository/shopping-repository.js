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
    return CartModel.findOne({
      customerId,
    });
  }

  async ManageCart(customerId, product, qty, isRemove = false) {
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
  }

  // Wishlist
  async Wishlist(customerId) {
    return WishlistModel.findOne({
      customerId,
    });
  }

  async ManageWishlist(customerId, product_Id, isRemove = false) {
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
  }

  // Order
  async Orders(customerId, orderId) {
    if (orderId) {
      return OrderModel.findOne({ orderId });
    } else {
      return OrderModel.find({ customerId });
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
    return Promise.all([
      CartModel.findOneAndDelete({ customerId }),
      WishlistModel.findOneAndDelete({ customerId }),
    ]);
  }
}

module.exports = ShoppingRepository;
