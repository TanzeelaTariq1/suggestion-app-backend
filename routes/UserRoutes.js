import express from 'express';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import {protect} from '../middleware/authMiddleware.js';

const router = express.Router(); // Make sure this line is exactly like this

// @routes POST /api/users/register
// @desc Register a new user
// @access Public
router.post('/register', async (req, res) => {
    const { name, phoneno, password, address } = req.body;
    try {
        // Check if user already exists
        let user = await User.findOne({ phoneno });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Create a new user
        user = new User({ name, phoneno, password, address });
        await user.save();

        // Create a JWT payload
        const payload = { 
            user: { 
                id: user._id, 
                role: user.role 
            } 
        };
        
        // Sign and send the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '10h' },
            (err, token) => {
                if (err) {
                    console.error('JWT Error:', err);
                    return res.status(500).json({ message: 'Error generating token' });
                }
                
                res.status(201).json({
                    token,
                    user: { 
                        _id: user._id, 
                        name: user.name, 
                        phoneno: user.phoneno, 
                        address: user.address, 
                        role: user.role 
                    },
                    message: 'User registered successfully'
                });
            }
        );
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @routes POST /api/users/login
// @desc Authenticate user
// @access Public
router.post('/login', async (req, res) => {
    console.log('Login attempt:', req.body);
    const { phoneno, password } = req.body;
    
    try {
        // Find the user by phone number
        let user = await User.findOne({ phoneno });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Check if the password is correct
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Create a JWT payload
        const payload = { 
            user: { 
                id: user._id, 
                role: user.role 
            } 
        };
        
        // Sign and send the token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '10h' },
            (err, token) => {
                if (err) {
                    console.error('JWT Error:', err);
                    return res.status(500).json({ message: 'Error generating token' });
                }
                
                res.json({
                    token,
                    user: { 
                        _id: user._id, 
                        name: user.name, 
                        phoneno: user.phoneno, 
                        role: user.role 
                    }
                });
            }
        );
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @routes GET /api/users/profile
// @desc Logged-in user's profile (Protected Route)
// @access Private
router.get('/profile', protect, async (req, res) => {
    res.json(req.user);
});

export default router;
