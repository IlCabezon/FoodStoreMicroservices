const ProductService = require("../services/product-service");

module.exports = (app) => {
  app.use("/app-events", (req, res, next) => {
    try {
      const { payload } = req.body;

      console.log("========= Product service receaved Event");
      return res.status(200).json(payload);
    } catch (err) {
      next(err);
    }
  });
};
