const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

console.log("Queuing API started");


// Connect to MongoDB
// mongoose.connect(
//   'mongoURI',
//   {
//     dbName: 'FLOConnect', // Specify the database name here
//   }
// );

// Define transaction schema
const transactionQueueSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId, // Unique ID field
  privKey: String,
  receiver: String,
  floAmount: Number,
  floData: String,
  fee: Number,
  timestamp: { type: Date, default: Date.now },
  transaction_status: { type: Boolean, default: false },
});

// Define transaction model with collection name
const Transaction = mongoose.model(
  'Transaction',
  transactionQueueSchema,
  'TransactionQueue'
);

// Middleware
app.use(bodyParser.json());

// Routes
app.post('/api/transactions', async (req, res) => {
  try {
    const newTransaction = new Transaction({
      _id: new mongoose.Types.ObjectId(), // Generating unique ObjectId
      ...req.body,
    });
    await newTransaction.save();
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
