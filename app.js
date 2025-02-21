const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const productRoutes = require('./routes/productRoutes');
const multer = require('multer');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploaded files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api', productRoutes);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/haatbazar', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File size is too large. Max limit is 5MB' });
        }
        return res.status(400).json({ error: err.message });
    }
    
    console.error(err.stack);
    res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 