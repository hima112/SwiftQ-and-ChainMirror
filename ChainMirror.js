const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cron = require('node-cron');

// Create Express app
const app = express();

app.use(bodyParser.json());


// Connect to MongoDB
// const mongoURI = process.env.MONGO_URI;
// mongoose.connect(
//     mongoURI,
//     {
//       dbName: 'FLOConnect', 
//     }
// ).then(() => console.log('MongoDB connected'))
// .catch(err => console.error('MongoDB connection error:', err));

// Define Schema
const transactionSchema = new mongoose.Schema({
    blockheight: Number,
    txid: {
        type: String,
        unique: true // Set txid as unique
    },
    sender: String,
    receiver: String,
    floData: String,
    created_at: {
        type: Date,
        default: Date.now
    }
});

// Define Model with collection name TransactionList
const TransactionList = mongoose.model('TransactionList', transactionSchema, 'TransactionList');

async function main() {
    let initialBlock = "6736611"; // Initial block
    const searchPattern = "FloConnect";
    const apiUrl = "https://blockbook.ranchimall.net"; // Move apiUrl inside main()

    console.log("Blockchain Scan Utility.");
    console.log("==============================");

    let searchcount = 0;

    try {
        const response = await axios.get(`${apiUrl}/api`);
        const blockcount = response.data.blockbook.bestHeight;

        console.log(`Block count: ${blockcount}`);

        const lastTransaction = await TransactionList.findOne({}, {}, { sort: { blockheight: -1 } });
        if (lastTransaction) {
            initialBlock = lastTransaction.blockheight + 1;
        }

        console.log(`Starting from block: ${initialBlock}`);

        for (let i = initialBlock; i <= blockcount; i++) {
            console.log(`Block: ${i}`);
            try {
                const blockResponse = await axios.get(`${apiUrl}/api/block/${i}`);
                const txs = blockResponse.data.txs;

                for (const tx of txs) {
                    const txid = tx.txid;
                    const txDataResponse = await axios.get(`${apiUrl}/api/tx/${txid}`);
                    const txData = txDataResponse.data;
                    const txSender = txData.vin[0].addr;
                    const txReceiver = txData.vout[0].scriptPubKey.addresses[0];

                    const txComment = tx.floData;
                    if (txComment && txComment.includes(searchPattern, 'i')) {
                        searchcount++;

                        const newTransaction = new TransactionList({
                            blockheight: i,
                            txid: txid,
                            sender: txSender,
                            receiver: txReceiver,
                            floData: txComment
                        });

                        await newTransaction.save();

                        console.log(`Found at Block No: ${i}`);
                        console.log(`Transaction ID: ${txid}`);
                        console.log(`Sender: ${txSender}`);
                        console.log(`Receiver: ${txReceiver}`);
                        console.log(`Comment: ${txComment}`);
                    }
                }
            } catch (error) {
                console.error("Error processing block:", error);
            }
        }

        console.log("Done. Search Pattern Found " + searchcount + " times.");
        console.log("No. of Blocks Searched : " + (blockcount - initialBlock + 1));
    } catch (error) {
        console.error("Error:", error);
    }
}

// Schedule main function to run every 2 minutes
cron.schedule('*/5 * * * *', main);

// Run main function initially
main().catch(console.error);

