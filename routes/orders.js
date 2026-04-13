 const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");


// ==========================
// CREATE ORDER (CUSTOMER)
// ==========================
router.post("/create", authMiddleware, async (req, res) => {
  try {
    const newOrder = new Order({
      ...req.body,
      customerId: req.user.id,
      status: "pending",
      riderId: null,
    });

    await newOrder.save();

    res.status(201).json({
      message: "Order created successfully",
      order: newOrder,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==========================
// GET CUSTOMER ORDERS
// ==========================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.user.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==========================
// ASSIGN RIDER (ADMIN/BUSINESS)
// ==========================
router.patch("/assign-rider", authMiddleware, async (req, res) => {
  try {
    const { orderId, riderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.riderId = riderId;
    order.status = "accepted";

    await order.save();

    res.json({
      message: "Rider assigned successfully",
      order,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==========================
// RIDER: GET MY ORDERS
// ==========================
router.get("/rider", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ riderId: req.user.id });
    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==========================
// RIDER ACCEPT ORDER
// ==========================
router.patch("/rider/accept", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.riderId = req.user.id;
    order.status = "accepted";

    await order.save();

    res.json({
      message: "Order accepted",
      order,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==========================
// RIDER MARK PICKED
// ==========================
router.patch("/rider/picked", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.riderId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your order" });
    }

    order.status = "picked";

    await order.save();

    res.json({
      message: "Order picked up",
      order,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ==========================
// RIDER MARK DELIVERED
// ==========================
router.patch("/rider/delivered", authMiddleware, async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (order.riderId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not your order" });
    }

    order.status = "delivered";

    await order.save();

    res.json({
      message: "Order delivered",
      order,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;