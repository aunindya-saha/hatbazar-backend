const mongoose = require('mongoose');

const BuyerComplaintSchema = new mongoose.Schema({
    complaint_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    accuser_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
    message: { type: String, required: true },
    image: { type: String },
    status: { 
        type: String,
        enum: ['PENDING', 'RESOLVED', 'REJECTED'],
        default: 'PENDING'
    },
    response: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('BuyerComplaint', BuyerComplaintSchema);
