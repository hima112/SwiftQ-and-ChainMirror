//TransactionQueue Schema
const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  privKey: String,
  receiver: String,
  floAmount: Number,
  floData: String,
  fee: Number,
  timestamp: { type: Date, default: Date.now },
  transaction_status: { type: Boolean, default: false },
}, { collection: 'TransactionQueue' }); // Specify the collection name explicitly

const TransactionQueue = mongoose.model('TransactionQueue', transactionSchema);

module.exports = TransactionQueue;
