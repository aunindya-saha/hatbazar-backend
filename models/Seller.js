const mongoose = require('mongoose');

const SellerSchema = new mongoose.Schema({
    email: { type: String, unique: true, required: true },
    business_name: { type: String, required: true },
    division: { type: String, required: true },
    phone: { type: String, required: true },
    status: {
        type: String,
        required: true,
        enum: ['ACTIVE', 'SUSPENDED', 'BANNED'],
        default: 'ACTIVE'
    },
    address: { type: String },
    nid: { type: String },
    tinId: { type: String },
    tinDoc: { type: Buffer },
    image: { type: String },
    password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Seller', SellerSchema);
