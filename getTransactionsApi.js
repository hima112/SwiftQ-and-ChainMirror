const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Create Express app
const app = express();
app.use(cors());

const transactionSchema = new mongoose.Schema({
    blockheight: Number,
    txid: String,
    sender: String,
    receiver: String,
    floData: String,
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Define Model
const getTransactionList = mongoose.model('getTransactionList', transactionSchema, 'TransactionList');

// API endpoint to fetch all transactions
app.get('/api/gettransactions', async (req, res) => {
    try {
        const transactions = await getTransactionList.find();
        res.json(transactions);
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

const PORT = process.env.PORT || 7000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
