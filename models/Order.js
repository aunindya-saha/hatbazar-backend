const mongoose = require('mongoose');



const OrderSchema = new mongoose.Schema({
    buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    total_price: { type: Number, required: true },
    status: {
        type: String,
        required: true,
        enum: ['ORDER_PLACED', 'PROCESSING', 'DELIVERED', 'CANCELLED'],
        default: 'DELIVERED'
    },
    shipping_address: { type: String, required: true },
    billing_address: { type: String, required: true },
    ordered_products: [{
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        subtotal: { type: Number, required: true }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);
