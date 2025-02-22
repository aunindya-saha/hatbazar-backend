const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
require('dotenv').config();

// Import models
const Buyer = require('./models/Buyer');
const Seller = require('./models/Seller');
const Admin = require('./models/Admin');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Review = require('./models/Review');
const Transaction = require('./models/Transaction');
const BuyerComplaint = require('./models/BuyerComplaint');
const SellerComplaint = require('./models/SellerComplaint');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Multer configuration for file uploads (images, documents)
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});
const mongoURI = process.env.MONGODB_URI ;

// MongoDB Connection
mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true, dbName: 'test'
})
.then(() => {
    console.log('Connected to MongoDB successfully');
})
.catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);  // Exit the process if MongoDB connection fails
});


//landing page show total number of products, sellers and buyer 
app.get('/api/statistics', async (req, res) => {
    const stats = {
        totalProducts: await Product.countDocuments(),
        totalSellers: await Seller.countDocuments(),
        totalBuyers: await Buyer.countDocuments()
    };  
    res.json(stats);
});


// buyer login
app.post('/api/auth/buyer/login', async (req, res) => {
    const { email, password } = req.body;
    const buyer = await Buyer.findOne({ email, password });
    res.json(buyer);
});

// seller login
app.post('/api/auth/seller/login', async (req, res) => {
    const { email, password } = req.body;
    const seller = await Seller.findOne({ email, password });
    res.json(seller);
}); 

// admin login
app.post('/api/auth/admin/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const admin = await Admin.findOne({ email, password });
        
        if (!admin) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.json(admin);
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}); 


/**
 * Authentication Routes
 * Purpose: Handle user registration for buyers and sellers
 * /api/auth/buyer/register - Register new buyer account
 * /api/auth/seller/register - Register new seller account with TIN document
 */
app.post('/api/auth/buyer/register', async (req, res) => {
    try {
        const buyer = new Buyer(req.body);
        await buyer.save();
        res.status(201).json(buyer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/auth/seller/register', upload.single('tinDoc'), async (req, res) => {
    try {
        const seller = new Seller({
            ...req.body,
            tinDoc: req.file ? req.file.buffer : null
        });
        await seller.save();
        res.status(201).json(seller);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * Buyer Routes
 * Purpose: Manage buyer profiles and their information
 * GET /api/buyers/:id - Retrieve buyer profile information
 * PUT /api/buyers/:id - Update buyer profile details
 */
app.get('/api/buyers/:id', async (req, res) => {
    try {
        const buyer = await Buyer.findById(req.params.id);
        res.json(buyer);
    } catch (error) {
        res.status(404).json({ error: 'Buyer not found' });
    }
});

app.put('/api/buyers/:id', upload.single('image'), async (req, res) => {
    try {
        // Convert image to base64 URL if present
        const imageUrl = req.file 
            ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
            : undefined; // Use undefined so it won't update if no new image

        const updateData = {
            ...req.body,
            ...(imageUrl && { image: imageUrl }) // Only include image if new one uploaded
        };

        const buyer = await Buyer.findByIdAndUpdate(
            req.params.id, 
            updateData,
            { new: true }
        );
        res.json(buyer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * Seller Routes
 * Purpose: Manage seller profiles and their business information
 * GET /api/sellers/:id - Retrieve seller profile and business details
 * PUT /api/sellers/:id - Update seller information including TIN documents
 */
//get all sellers   
app.get('/api/sellers', async (req, res) => {
    try {
        const sellers = await Seller.find();
        res.json(sellers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
app.get('/api/sellers/:id', async (req, res) => {
    try {
        const seller = await Seller.findById(req.params.id);
        res.json(seller);
    } catch (error) {
        res.status(404).json({ error: 'Seller not found' });
    }
});

app.put('/api/sellers/:id', upload.single('tinDoc'), async (req, res) => {
    try {
        const updateData = {
            ...req.body,
            ...(req.file && { tinDoc: req.file.buffer })
        };
        const seller = await Seller.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(seller);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * Product Routes
 * Purpose: Handle all product-related operations
 * POST /api/products - Create new product listing with image
 * GET /api/products - Get all products with seller information
 * GET /api/products/:id - Get detailed information of a specific product
 * GET /api/sellers/:sellerId/products - Get all products of a specific seller
 */
app.post('/api/products', upload.single('image'), async (req, res) => {
    try {
        const product = new Product({
            ...req.body,
            image: req.file.buffer
        });
        await product.save();
        res.status(201).json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// put product by id
app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// delete product by id
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().populate('seller_id');
        res.json(products);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller_id');
        res.json(product);
    } catch (error) {
        res.status(404).json({ error: 'Product not found' });
    }
});

app.put('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/sellers/:sellerId/products', async (req, res) => {
    try {
        const products = await Product.find({ seller_id: req.params.sellerId });
        res.json(products);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * Order Routes
 * Purpose: Handle order creation and management
 * POST /api/orders - Create new order and update product stock
 * GET /api/buyers/:buyerId/orders - Get order history for a specific buyer
 * Features: Automatically updates product stock levels on order creation
 */
app.post('/api/orders', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        
        // Update product stock
        for (const item of req.body.ordered_products) {
            await Product.findByIdAndUpdate(
                item.product_id,
                { $inc: { stock: -item.quantity } }
            );
        }
        
        res.status(201).json(order);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/buyers/:buyerId/orders', async (req, res) => {
    try {
        const orders = await Order.find({ buyer_id: req.params.buyerId }).sort({ createdAt: -1 })
            .populate('ordered_products.product_id');
        res.json(orders);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// transaction routes
app.post('/api/transactions', async (req, res) => {
    try {
        const transaction = new Transaction(req.body);
        await transaction.save();
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


/**
 * Review Routes
 * Purpose: Handle product reviews and ratings
 * POST /api/reviews - Create new product review with optional image
 * GET /api/products/:productId/reviews - Get all reviews for a specific product
 * Features: Automatically updates product's average rating and review count
 */
app.post('/api/reviews', upload.single('image'), async (req, res) => {
    try {
        // Check for existing review
        const existingReview = await Review.findOne({
            buyer_id: req.body.buyer_id,
            product_id: req.body.product_id
        });

        if (existingReview) {
            return res.status(400).json({ error: "You have already reviewed this product" });
        }

        const imageUrl = req.file 
            ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
            : null;

        const review = new Review({
            ...req.body,
            image: imageUrl
        });
        await review.save();
        
        res.status(201).json(review);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/buyers/:buyerId/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ buyer_id: req.params.buyerId })
            .populate('product_id');
        res.json(reviews);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//get review by productId
app.get('/api/products/:productId/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ product_id: req.params.productId })
            .populate('buyer_id');

        const totalRating = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        const averageRating = totalRating / reviews.length;
        res.json({ reviews, averageRating });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Add this new endpoint to check if user has already reviewed
app.get('/api/reviews/check', async (req, res) => {
    try {
        const { buyer_id, product_id } = req.query;
        const review = await Review.findOne({ buyer_id, product_id });
        res.json({ hasReviewed: !!review });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


/**
 * Complaint Routes
 * Purpose: Handle buyer and seller complaints
 * POST /api/buyer-complaints - File complaint against seller with optional image
 * POST /api/seller-complaints - File complaint against buyer with optional image
 * Features: Supports image attachments for evidence
 */
// buyer complaint

app.get('/api/complaints/buyer/:buyerId', async (req, res) => {
    try {
        const complaints = await BuyerComplaint.find({ accuser_id: req.params.buyerId })
            .populate('complaint_id')
            .populate('accuser_id')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//post buyer complaints 
app.post('/api/complaints/buyer/:buyerId', upload.single('image'), async (req, res) => {
    try {
        // Convert the image buffer to base64 URL string if image exists
        const imageUrl = req.file 
            ? `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
            : null;

        const complaint = new BuyerComplaint({
            ...req.body,
            image: imageUrl // Store as URL string instead of buffer
        }); 
        await complaint.save();
        res.status(201).json(complaint);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});
    
// seller complaint
app.get('/api/complaints/seller/:sellerId', async (req, res) => {
    try {
        const complaints = await SellerComplaint.find({ complaint_id: req.params.sellerId })
            .populate('complaint_id')
            .populate('accuser_id')
            .sort({ createdAt: -1 });
        res.json(complaints);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}); 

app.post('/api/buyer-complaints', upload.single('image'), async (req, res) => {
    try {
        const complaint = new BuyerComplaint({
            ...req.body,
            image: req.file ? req.file.buffer : null
        });
        await complaint.save();
        res.status(201).json(complaint);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
    });

//get all complaints
app.get('/api/buyer-complaints', async (req, res) => {
    try {
        const complaints = await BuyerComplaint.find().populate('complainant_id');
        res.json(complaints);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/seller-complaints', upload.single('image'), async (req, res) => {
    try {
        const complaint = new SellerComplaint({
            ...req.body,
            image: req.file ? req.file.buffer : null
        });
        await complaint.save();
        res.status(201).json(complaint);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

//get all seller complaints
app.get('/api/seller-complaints', async (req, res) => {
    try {
        const complaints = await SellerComplaint.find().populate('complainant_id');
        res.json(complaints);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}); 

/**
 * Admin Routes
 * Purpose: System administration and monitoring
 * GET /api/admin/dashboard - Get system-wide statistics
 * PUT /api/admin/sellers/:sellerId/status - Update seller account status
 * PUT /api/admin/buyers/:buyerId/status - Update buyer account status
 * Features: 
 * - Monitor total products, users, orders, and complaints
 * - Manage user account statuses (ACTIVE/SUSPENDED/BANNED)
 */
app.get('/api/admin/dashboard', async (req, res) => {
    try {
        const stats = {
            totalProducts: await Product.countDocuments(),
            totalBuyers: await Buyer.countDocuments(),
            totalSellers: await Seller.countDocuments(),
            totalOrders: await Order.countDocuments(),
            totalTransactions: await Transaction.countDocuments(),
            buyerComplaints: await BuyerComplaint.countDocuments(),
            sellerComplaints: await SellerComplaint.countDocuments()
        };
        res.json(stats);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.put('/api/admin/sellers/:sellerId/status', async (req, res) => {
    try {
        const seller = await Seller.findByIdAndUpdate(
            req.params.sellerId,
            { status: req.body.status },
            { new: true }
        );
        res.json(seller);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// get all sellers
app.get('/api/sellers', async (req, res) => {
    try {
        const sellers = await Seller.find();
        res.json(sellers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// get all buyers
app.get('/api/buyers', async (req, res) => {
    try {
        const buyers = await Buyer.find();
        res.json(buyers);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// update buyer status
app.put('/api/admin/buyers/:buyerId/status', async (req, res) => {
    try {
        const buyer = await Buyer.findByIdAndUpdate(
            req.params.buyerId,
            { status: req.body.status },
            { new: true }
        );
        res.json(buyer);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * Transaction Routes
 * Purpose: Handle financial transactions and payment processing
 * GET /api/transactions/buyer/:buyerId - Get all transactions for a specific buyer
 * GET /api/transactions/seller/:sellerId - Get all transactions for a specific seller
 * Features:
 * - Aggregates transaction data with order details
 * - Calculates total transaction amounts
 * - Provides payment status and type information
 */

// Get all transactions for a specific buyer
app.get('/api/transactions/buyer/:buyerId', async (req, res) => {
    try {
        const transactions = await Transaction.aggregate([
            // First, join with the Order collection
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            // Unwind the order array (since it's a 1-1 relationship)
            { $unwind: '$order' },
            // Match orders for the specific buyer
            {
                $match: {
                    'order.buyer_id': new mongoose.Types.ObjectId(req.params.buyerId)
                }
            },
            // Join with the Product collection for order details
            {
                $lookup: {
                    from: 'products',
                    localField: 'order.ordered_products.product_id',
                    foreignField: '_id',
                    as: 'products'
                }
            },
            // Project the fields we want to return
            {
                $project: {
                    transaction_id: '$_id',
                    order_id: '$order_id',
                    amount: '$amount',
                    payment_type: '$payment_type',
                    status: '$status',
                    order_status: '$order.status',
                    order_date: '$order.createdAt',
                    products: '$products',
                    shipping_address: '$order.shipping_address',
                    billing_address: '$order.billing_address',
                    createdAt: '$createdAt'
                }
            },
            // Sort by creation date, newest first
            { $sort: { createdAt: -1 } }
        ]);

        // Calculate total amount of all transactions
        const totalAmount = transactions.reduce((sum, trans) => sum + trans.amount, 0);

        res.json({
            transactions,
            summary: {
                total_transactions: transactions.length,
                total_amount: totalAmount,
                successful_transactions: transactions.filter(t => t.status === 'SUCCESS').length,
                pending_transactions: transactions.filter(t => t.status === 'PENDING').length,
                failed_transactions: transactions.filter(t => t.status === 'FAILED').length
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get all transactions for a specific seller
app.get('/api/transactions/seller/:sellerId', async (req, res) => {
    try {
        const transactions = await Transaction.aggregate([
            // First, join with the Order collection
            {
                $lookup: {
                    from: 'orders',
                    localField: 'order_id',
                    foreignField: '_id',
                    as: 'order'
                }
            },
            // Unwind the order array
            { $unwind: '$order' },
            // Match orders for the specific seller
            {
                $match: {
                    'order.seller_id': new mongoose.Types.ObjectId(req.params.sellerId)
                }
            },
            // Join with the Buyer collection to get buyer information
            {
                $lookup: {
                    from: 'buyers',
                    localField: 'order.buyer_id',
                    foreignField: '_id',
                    as: 'buyer'
                }
            },
            // Unwind the buyer array
            { $unwind: '$buyer' },
            // Project the fields we want to return
            {
                $project: {
                    transaction_id: '$_id',
                    order_id: '$order_id',
                    amount: '$amount',
                    payment_type: '$payment_type',
                    status: '$status',
                    order_status: '$order.status',
                    order_date: '$order.createdAt',
                    buyer_name: '$buyer.name',
                    buyer_phone: '$buyer.phone',
                    shipping_address: '$order.shipping_address',
                    createdAt: '$createdAt'
                }
            },
            // Sort by creation date, newest first
            { $sort: { createdAt: -1 } }
        ]);

        // Calculate summary statistics
        const totalAmount = transactions.reduce((sum, trans) => sum + trans.amount, 0);
        const statusCounts = transactions.reduce((acc, trans) => {
            acc[trans.status] = (acc[trans.status] || 0) + 1;
            return acc;
        }, {});

        res.json({
            transactions,
            summary: {
                total_transactions: transactions.length,
                total_amount: totalAmount,
                by_status: {
                    successful: statusCounts['SUCCESS'] || 0,
                    pending: statusCounts['PENDING'] || 0,
                    failed: statusCounts['FAILED'] || 0
                },
                by_payment_type: {
                    cash: transactions.filter(t => t.payment_type === 'CASH').length,
                    card: transactions.filter(t => t.payment_type === 'CARD').length
                }
            }
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
