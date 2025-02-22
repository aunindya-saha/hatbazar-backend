const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
    buyer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    rating: { type: Number, min: 1, max: 5, required: false },
    comment: { type: String, required: false },
    image: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);
