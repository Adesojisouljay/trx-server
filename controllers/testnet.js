const { getBase58CheckAddress } = require("tronweb/utils");
const {
    generateTronAddress,
    sendTestnetTrx,
    getTronBalance,
    getTtxTokenBalance,
    checkTestnetTransactionStatus,
    estimateTransactionFee,
    watchAllTokens
} = require("../trx-services/testnet/testnetTrx.js")

// generateTronAddress()

const generateTronAddressController = async (req, res) => {
    console.log("test",process.env.TESTNET)
    try {
        const result = await generateTronAddress(); // Await the function
        console.log(result);
        return res.status(200).json(result); // Return the result as JSON
    } catch (error) {
        console.error('Error generating TRON address:', error);
        return res.status(500).json({ error: 'Error generating TRON address' });
    }
};

// Controller to send TRX
const sendTrxController = async (req, res) => {
    const { fromAddress, toAddress, amount, privateKey, contractAddress } = req.body;
    try {
        const result = await sendTestnetTrx(fromAddress, toAddress, amount, privateKey, contractAddress);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Error sending TRX' }); 
    }
};

// Controller to get address info
const getAddressBalanceController = async (req, res) => {
    const { address, contractAddress } = req.params;
    console.log({ address, contractAddress })
    try {
        let balance;
        if(contractAddress) {
            balance = await getTtxTokenBalance(address, contractAddress)
        } else {
            balance = await getTronBalance(address);
        }
        return res.status(200).json(balance);  
    } catch (error) {
        return res.status(500).json({ error: 'Error getting address info' });
    }
}; 

// Controller to check transaction status
const checkTransactionStatusController = async (req, res) => {
    const { txID } = req.params;
    try {
        const status = await checkTestnetTransactionStatus(txID);
        return res.status(200).json(status);
    } catch (error) {
        return res.status(500).json({ error: 'Error checking transaction status' });
    }
};

// Controller to get address transactions
const getAddressTransactionsController = async (req, res) => {
    const { address, contractAddress } = req.params;

    // console.log({ address, contractAddress })
  
    try {
      const transactions = await watchAllTokens([address], contractAddress || null); // Ensure trackedAddresses is passed as an array
      console.log(transactions);
  
      return res.status(200).json(transactions);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Error retrieving transactions' });
    }
  };

const getTransactionFeeController = async (req, res) => {
    const { fromAddress, toAddress, contractAddress } = req.params;
    console.log(contractAddress)
    try {
        const transactionFee = await estimateTransactionFee(fromAddress, toAddress, contractAddress);
        res.json(transactionFee);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

module.exports = {
    generateTronAddressController,
    sendTrxController,
    getAddressBalanceController,
    checkTransactionStatusController,
    getAddressTransactionsController,
    getTransactionFeeController
};
