const express = require('express');
const router = express.Router();
const {
    generateTronAddressController,
    sendTrxController,
    getAddressInfoController,
    checkTransactionStatusController,
    getAddressTransactionsController,
} = require('../../controllers/mainnet.js'); // Adjust the path as needed

router.get('/address-gen', generateTronAddressController);

// Route to send TRX
router.post('/sendTrx', sendTrxController);

// Route to get address info
router.get('/address/:address', getAddressInfoController);

// Route to check transaction status
router.get('/transaction/:txID', checkTransactionStatusController);

// Route to get address transactions
router.get('/address/:address/transactions', getAddressTransactionsController);


module.exports = router;
