const { ProductRepository } = require("../database");
const { FormateData } = require("../utils");
const { NotFoundError } = require("../utils/app-errors");

// All Business logic will be here
class ProductService {
  constructor() {
    this.repository = new ProductRepository();
  }

  async CreateProduct(productInputs) {
    return this.repository.CreateProduct(productInputs);
  }

  async GetProducts() {
    const products = await this.repository.Products();
    if (!products || !products.length)
      throw new NotFoundError("products not found!");

    let categories = {};

    products.map(({ type }) => {
      categories[type] = type;
    });

    return {
      products,
      categories: Object.keys(categories),
    };
  }

  async GetProductDescription(productId) {
    return await this.repository.FindById(productId);
  }

  async GetProductsByCategory(category) {
    return await this.repository.FindByCategory(category);
  }

  async GetSelectedProducts(selectedIds) {
    return this.repository.FindSelectedProducts(selectedIds);
  }

  async GetProductById(productId) {
    return this.repository.FindById(productId);
  }

  // RPC response
  async serveRPCRequest(payload) {
    const { type, data } = payload;
    switch (type) {
      case "VIEW_PRODUCT":
        return this.repository.FindById(data);
      case "VIEW_PRODUCTS":
        return this.repository.FindSelectedProducts(data);
      default:
        break;
    }
  }
}

module.exports = ProductService;
