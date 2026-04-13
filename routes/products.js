 const express = require("express");
const router = express.Router();

// TEST ROUTE (temporary fix)
router.post("/", (req, res) => {
  res.json({ message: "Product route working" });
});

module.exports = router;