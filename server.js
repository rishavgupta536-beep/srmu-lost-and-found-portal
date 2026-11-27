const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'static', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// MongoDB Connection
mongoose.connect('mongodb://127.0.0.1:27017/srmu_lost_found')
    .then(() => console.log('Connected to MongoDB successfully!'))
    .catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schema & Model
const itemSchema = new mongoose.Schema({
    category: { type: String, required: true, enum: ['Lost', 'Found'] },
    person_name: { type: String, required: true },
    mobile_no: { type: String, required: true },
    location: { type: String, required: true },
    item_name: { type: String, required: true },
    photo_path: { type: String, default: '' },
    submitted_to: { type: String, default: '' },
    status: { type: String, default: 'Active' },
    created_at: { type: Date, default: Date.now }
});

const Item = mongoose.model('Item', itemSchema);

// Multer Setup for Image Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const cleanName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        cb(null, `${Date.now()}_${cleanName}`);
    }
});
const upload = multer({ storage });

// HTML Page Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'home.html'));
});

app.get('/lost', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'lost.html'));
});

app.get('/found', (req, res) => {
    res.sendFile(path.join(__dirname, 'templates', 'found.html'));
});

// REST API Routes
app.get('/api/items/:category', async (req, res) => {
    try {
        const items = await Item.find({ category: req.params.category }).sort({ created_at: -1 });
        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/items', upload.single('photo'), async (req, res) => {
    try {
        const { category, person_name, mobile_no, location, item_name, submitted_to } = req.body;
        const photo_path = req.file ? `/static/uploads/${req.file.filename}` : '';

        const newItem = new Item({
            category,
            person_name,
            mobile_no,
            location,
            item_name,
            photo_path,
            submitted_to: submitted_to || ''
        });

        await newItem.save();
        res.status(201).json({ message: 'Saved successfully', item: newItem });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/items/:id/resolve', async (req, res) => {
    try {
        await Item.findByIdAndUpdate(req.params.id, { status: 'Resolved' });
        res.json({ message: 'Resolved' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/items/:id', async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`SRMU Lost & Found Server running at http://127.0.0.1:${PORT}`);
});