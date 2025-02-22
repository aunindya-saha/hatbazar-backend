const mongoose = require('mongoose');

const SellerComplaintSchema = new mongoose.Schema({
    complainant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Buyer', required: true },
    accuser_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Seller', required: true },
    message: { type: String, required: true },
    image: { type: String },
}, { timestamps: true });


module.exports = mongoose.model('SellerComplaint', SellerComplaintSchema);
