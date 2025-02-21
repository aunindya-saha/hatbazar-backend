const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: { type: String, required: true },
    subcategory: { type: String, required: true },
    seller_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    division: { type: String, required: true },
    unit: { type: String, required: true },
    price_per_unit: { type: Number, required: true },
    image: { type: String, required: true },
    stock: { type: Number, required: true },
    description: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
