 const Order = require('../models/order');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { businessId, products, totalPrice } = req.body;
    const customerId = req.user.id; // from JWT

    const order = new Order({ customerId, businessId, products, totalPrice });
    await order.save();

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all orders for a user (customer, business, or rider)
exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({
      $or: [
        { customerId: userId },
        { businessId: userId }
      ]
    }).populate('products.productId', 'name price');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};