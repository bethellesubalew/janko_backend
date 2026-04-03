const express = require('express');
const router = express.Router();
const Customer = require('../models/customers');

// Register
router.post('/register', async (req, res) => {
    try {
        const newCustomer = new Customer(req.body);
        await newCustomer.save();
        res.status(201).json(newCustomer);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const customer = await Customer.findOne({ email: req.body.email, password: req.body.password });
        if (!customer) return res.status(404).json({ error: 'Customer not found' });
        res.json(customer);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all
router.get('/', async (req, res) => {
    const customers = await Customer.find();
    res.json(customers);
});

module.exports = router;