const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    amount: { type: Number, required: true },
    payment_type: {
        type: String,
        required: true,
        enum: ['CASH', 'CARD'],
        default: 'CARD'
    },
    status: {
        type: String,
        required: true,
        enum: ['PENDING', 'SUCCESS', 'FAILED'],
        default: 'PENDING'
    },
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);
