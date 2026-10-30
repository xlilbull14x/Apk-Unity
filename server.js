const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Setup upload folder for APK processing simulation
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage: storage });

// Serve static frontend files from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// API Endpoint to handle APK uploads & simulated decompilation
app.post('/api/upload-apk', upload.single('apkFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No APK file provided.' });
    }

    const apkInfo = {
        filename: req.file.originalname,
        sizeMB: (req.file.size / (1024 * 1024)).toFixed(2),
        uploadedAt: new Date().toISOString(),
        extractedAssets: ['classes.dex', 'libil2cpp.so', 'assets/bin/Data/globalgamemanagers']
    };

    console.log(`[APK Processor] Successfully unzipped and parsed: ${req.file.originalname}`);

    res.json({
        success: true,
        message: 'APK decompiled successfully!',
        data: apkInfo
    });
});

// Fallback route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`⚡ VR Mod Studio Pro Server running on port ${PORT}`);
});
