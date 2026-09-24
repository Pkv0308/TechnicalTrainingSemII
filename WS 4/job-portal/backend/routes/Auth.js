const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Routes will go here


// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });
        
        // Compare the provided password with the hashed password in the DB
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
        
        // Generate the JWT
        const payload = { userId: user._id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ token, userId: user._id, email: user.email });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });
        
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Save the new user
        user = new User({ email, password: hashedPassword });
        await user.save();
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;