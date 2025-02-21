const mongoose = require('mongoose');

const BuyerComplaintSchema = new mongoose.Schema({
    complainant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    accused_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
    message: { type: String, required: true },
    image: { type: Buffer },
}, { timestamps: true });

module.exports = mongoose.model('BuyerComplaint', BuyerComplaintSchema);
