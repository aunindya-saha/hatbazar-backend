const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const productController = require('../controllers/productController');

// Get all products
router.get('/products', productController.getAllProducts);

// Create new product
router.post('/products', upload.single('image'), productController.createProduct);

// Get product by ID
router.get('/products/:id', productController.getProductById);

// Update product
router.put('/products/:id', upload.single('image'), productController.updateProduct);

// Delete product
router.delete('/products/:id', productController.deleteProduct);

module.exports = router; 