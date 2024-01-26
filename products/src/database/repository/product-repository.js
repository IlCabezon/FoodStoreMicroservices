const { ProductModel } = require("../models");
const { APIError } = require("../../utils/app-errors");

//Dealing with data base operations
class ProductRepository {
  async CreateProduct({
    name,
    desc,
    type,
    unit,
    price,
    available,
    suplier,
    banner,
  }) {
    try {
      const product = new ProductModel({
        name,
        desc,
        type,
        unit,
        price,
        available,
        suplier,
        banner,
      });

      const productResult = await product.save();
      return productResult;
    } catch (err) {
      throw new APIError(err.message)
    }
  }

  async Products() {
    return ProductModel.find();
  }

  async FindById(id) {
    return ProductModel.findById(id);
  }

  async FindByCategory(category) {
    return ProductModel.find({ type: category });
  }

  async FindSelectedProducts(selectedIds) {
    return ProductModel.find()
      .where("_id")
      .in(selectedIds.map((_id) => _id))
      .exec();
  }
}

module.exports = ProductRepository;
