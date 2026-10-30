/**
 * VR Game Creator Studio - Backend Express Server
 */
const express = require('express');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Root route handler
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API status check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'online', engine: 'VR Game Creator Studio', timestamp: new Date() });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 VR Game Creator server is running live at http://localhost:${PORT}`);
});
