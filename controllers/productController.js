const Product = require('../models/product');

// Add a product (only logged-in business)
exports.addProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const businessId = req.user.id; // comes from token

    const product = new Product({ name, price, category, businessId });
    await product.save();

    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all products (public)
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};