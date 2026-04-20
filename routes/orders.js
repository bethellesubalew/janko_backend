 const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const authMiddleware = require("../middleware/authMiddleware");

const requireRole = require("../middleware/roleMiddleware");
// ==========================
// CREATE ORDER (CUSTOMER)
// ==========================
router.post("/create", authMiddleware,requireRole("customer"), async (req, res) => {
  try {
    const lastOrder = await Order.findOne({
      customerId: req.user.id,
    }).sort({ createdAt: -1 });

    if (lastOrder) {
      const timeDiff = Date.now() - new Date(lastOrder.createdAt).getTime();

      if (timeDiff < 5000) {
        return res.status(429).json({
          message: "Too many requests - slow down"
        });
      }
    }
     const newOrder = new Order({
  customerId: req.user.id,
  businessId: req.body.businessId,
  products: req.body.products,
  totalPrice: req.body.totalPrice,
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
// BUSINESS: GET ALL ORDERS
// ==========================
router.get("/business/all" , async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// ASSIGN RIDER (ADMIN/BUSINESS)
// ==========================
 router.patch("/assign-rider", async (req, res) => {
  try {
    const { orderId, riderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

     order.status = "ready_for_delivery";
    order.riderId = riderId;

    await order.save();

    res.json({
      message: "ready_for_delivery",
      order,
    });

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
 
 // ==========================
// GET CUSTOMER ORDERS (AUTH)
// ==========================
 router.get("/customer", authMiddleware,requireRole("customer"), async (req, res) => {
  try {
    console.log("🔥 FULL USER OBJECT:", req.user);

    const orders = await Order.find({
      customerId: req.user.id,
    });

    console.log("🔥 FOUND ORDERS:", orders.length);

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// RIDER: GET MY ORDERS
// ==========================
 

router.get("/rider/orders", authMiddleware, async (req, res) => {
  try {
    console.log("🔥 RIDER REQUEST:", req.user);

 const orders = await Order.find({
  riderId: null,
  status: "accepted"
});

    console.log("🔥 FOUND RIDER ORDERS:", orders.length);

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// ⛔ MUST STAY LAST
module.exports = router;