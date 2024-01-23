const mongoose = require("mongoose");

const WishlistSchema = new mongoose.Schema({
  customerId: { type: String },
  products: [
    {
      _id: { type: String, required: true },
    },
  ],
});

module.exports = mongoose.model("wishlist", WishlistSchema);
