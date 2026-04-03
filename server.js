 // server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const customerRoutes = require('./routes/customers');
const riderRoutes = require('./routes/riders');
const businessRoutes = require('./routes/businesses');

app.use('/api/customers', customerRoutes);
app.use('/api/riders', riderRoutes);
app.use('/api/businesses', businessRoutes);

// Connect to MongoDB (Mongoose v7+)
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.log('❌ MongoDB connection error:', err));

// Test route
app.get('/', (req, res) => res.send('Server is running'));

// Start server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));