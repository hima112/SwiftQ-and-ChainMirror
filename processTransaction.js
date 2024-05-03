const mongoose = require('mongoose');
const cron = require('node-cron');
const TransactionQueue = require('./Transaction.js'); 
const axios = require('axios');

console.log("Queue clearing started")
// // Connect to MongoDB
// const mongoURI = process.env.MONGO_URI;
// mongoose.connect(
//   mongoURI,
//     {
//       dbName: 'FLOConnect', 
//     }
// );

// Function to process transactions
const processTransactions = async () => {
    try {
      // Fetch transactions from the queue
      const transactions = await TransactionQueue.find({ transaction_status: false });
      //console.log(transactions);
      // Process each transaction
      for (const transaction of transactions) {
        try {
            const data = {
                //   senderAddress: senderAddress,
                    privKey: transaction.privKey,
                    receiver: transaction.receiver,
                    floAmount:transaction.floAmount,
                    floData: transaction.floData,
                    fee:0.001
                };
          // Send transaction data to endpoint
          const response = await axios.post('http://localhost:8081/sendTransaction', data);
          
          // If transaction is successful (response.txid exists), remove it from the queue
          if (response.data && response.data.txid) {
            await TransactionQueue.findByIdAndDelete(transaction._id);
            console.log(`Transaction with ID ${response.data.txid} processed and removed from queue.`);
          } else {
            console.log(`Transaction with ID ${response.data.txid} failed. Leaving it in the queue.`);
          }
        } catch (error) {
          console.error(`Error processing transaction with ID ${response.data.txid}:`, error);
        }
      }
    } catch (error) {
      console.error('Error processing transactions:', error);
    }
  };
  
  // Schedule task to run every 2 minutes
  cron.schedule('*/2 * * * *', async () => {
    console.log('Running transaction processing task...');
    await processTransactions();
  });
  
  console.log('Transaction processing task scheduled to run every 2 minutes.');