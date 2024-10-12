const {
    sendTrx,
    getAddressInfo, 
    checkTransactionStatus, 
    getAddressTransactions,
    generateTronAddress
} = require("../trx-services/mainnet/transactions.js")

// Controller to send TRX
const generateTronAddressController = async (req, res) => {
    console.log("main", process.env.TESTNET)
    // const { fromAddress, toAddress, amount, privateKey } = req.body;
    try {
        const result = await generateTronAddress();
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Error sending TRX' });
    }
};

const sendTrxController = async (req, res) => {
    const { fromAddress, toAddress, amount, privateKey } = req.body;
    try {
        const result = await sendTrx(fromAddress, toAddress, amount, privateKey);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Error sending TRX' });
    }
};

// Controller to get address info
const getAddressInfoController = async (req, res) => {
    const { address } = req.params;
    try {
        const accountInfo = await getAddressInfo(address);
        return res.status(200).json(accountInfo);
    } catch (error) {
        return res.status(500).json({ error: 'Error getting address info' });
    }
};

// Controller to check transaction status
const checkTransactionStatusController = async (req, res) => {
    const { txID } = req.params;
    try {
        const status = await checkTransactionStatus(txID);
        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).json({ error: 'Error checking transaction status' });
    }
};

// Controller to get address transactions
const getAddressTransactionsController = async (req, res) => {
    const { address } = req.params;
    console.log("main", process.env.TESTNET)
    try {
        const transactions = await getAddressTransactions(address);
        return res.status(200).json(transactions);
    } catch (error) {
        return res.status(500).json({ error: 'Error retrieving transactions' });
    }
};

// Controller to start polling for address transactions
const startPollingController = (req, res) => {
    const { address, interval } = req.body;
    startPolling(address, interval);
    return res.status(200).json({ message: `Started polling transactions for address: ${address}` });
};

module.exports = {
    generateTronAddressController,
    sendTrxController,
    getAddressInfoController,
    checkTransactionStatusController,
    getAddressTransactionsController,
    startPollingController,
};
