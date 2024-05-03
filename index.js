const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const axios = require('axios');
const cron = require('node-cron');
// Load environment variables from .env file
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;
mongoose.connect(
  mongoURI,
    {
      dbName: 'FLOConnect', 
    }
).then(() => 
    {console.log('MongoDB connected')
        //getTransaction history to frontnend API
        require('./getTransactionsApi.js')
        //moves the failed transactions to the queue
        require('./SwiftQ.js');
        //runs every 2 minutes to clear the queue
        require('./processTransaction.js')
        //scans blocks to sync it with the database 
        require('./ChainMirror.js')
    })
.catch(err => console.error('MongoDB connection error:', err));

