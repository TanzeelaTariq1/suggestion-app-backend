const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 9000;

// Import routes
const UserRoutes = require('./routes/UserRoutes.js');

// Connect to MongoDB (if URI exists)
if (process.env.MONGO_URI) {
    const connectDB = require('./config/db.js');
    connectDB().then(connection => {
        if (connection) {
            console.log('✅ MongoDB connected');
        }
    }).catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        // Continue without DB
    });
} else {
    console.log('⚠️ Running without MongoDB connection');
}

// Routes
app.get('/', (req, res) => {
    res.json({
        message: 'Suggestion App Backend API',
        status: 'online',
        timestamp: new Date().toISOString(),
        endpoints: {
            users: '/api/users',
            health: '/health'
        }
    });
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: process.env.MONGO_URI ? 'configured' : 'not-configured'
    });
});

// User routes
app.use('/api/users', UserRoutes);

// Handle favicon
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Route not found',
        url: req.url
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({
        error: 'Internal server error'
    });
});

if (process.env.VERCEL) {
    // Export for Vercel
    module.exports = app;
} else {
    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
    });
}
