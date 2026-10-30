const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const upload = multer({ dest: uploadDir });

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Endpoint for uploading 3D models / assets
app.post('/api/upload-model', upload.single('modelFile'), (req, res) => {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded.' });
    
    res.json({
        success: true,
        filename: req.file.originalname,
        path: `/uploads/${req.file.filename}`
    });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🌐 VR Game Creator Engine running on port ${PORT}`);
});
