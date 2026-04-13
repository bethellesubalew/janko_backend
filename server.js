 const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require("./routes/auth");
const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

// routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/riders', require('./routes/riders'));
app.use('/api/businesses', require('./routes/businesses'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// test route
app.get('/', (req, res) => res.send('Server is running'));

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.log(err));

// start
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});