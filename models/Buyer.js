const mongoose = require('mongoose');

const BuyerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    phone: { type: String, required: true },
    billing_address: { type: String },
    shipping_address: { type: String },
    nid: { type: String },
    status: {
        type: String,
        required: true,
        enum: ['ACTIVE', 'SUSPENDED', 'BANNED'],
        default: 'ACTIVE'
    },
    password: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Buyer', BuyerSchema);
