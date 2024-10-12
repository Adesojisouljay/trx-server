const express = require('express');
const router = express.Router();
const {
    generateTronAddressController,
    sendTrxController,
    getAddressBalanceController,
    checkTransactionStatusController,
    getAddressTransactionsController,
    getTransactionFeeController,
} = require('../../controllers/testnet.js'); // Adjust the path as needed

router.get('/address-gen', generateTronAddressController);

// Route to send TRX
router.post('/sendTrx', sendTrxController);

// Route to get address info
router.get('/address-balance/:address/:contractAddress?', getAddressBalanceController);

// Route to check transaction status
router.get('/transaction/:txID', checkTransactionStatusController);

// Route to get address transactions
router.get('/address-transactions/:address/:contractAddress?', getAddressTransactionsController);

// Start polling for address transactions
router.get('/transaction-fee/:fromAddress/:toAddress/:contractAddress', getTransactionFeeController);

module.exports = router; 
