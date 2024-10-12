const  tronWeb = require("./tronwebConfig.js");
const axios = require('axios');

const generateTronAddress = async () => {
    try {
        const result = await tronWeb.createAccount(); // Await the account creation
        const trxAddress = {
            address: result.address.base58,
            privateKey: result.privateKey,
        };
        return trxAddress; // Return the generated address object
    } catch (error) {
        console.error('Error generating TRON address:', error);
        throw error; // Throw the error so it's caught in the controller
    }
};

const sendTrx = async (fromAddress, toAddress, amount, privateKey) => {
    try {
        const tradeObject = await tronWeb.transactionBuilder.sendTrx(toAddress, amount * 1e6, fromAddress);

        const signedTransaction = await tronWeb.trx.sign(tradeObject, privateKey);
        const result = await tronWeb.trx.sendRawTransaction(signedTransaction);

        console.log('Transaction result:', result);
        return result;
    } catch (error) {
        console.error('Error sending TRX:', error);
    }
};

const getAddressInfo = async (address) => {
    try {
        const accountInfo = await tronWeb.trx.getAccount(address);
        console.log('Account info:', accountInfo);
        return accountInfo;
    } catch (error) {
        console.error('Error getting address info:', error);
    }
};

const checkTransactionStatus = async (transactionID) => {
    try {
        const result = await tronWeb.trx.getTransaction(transactionID);
        console.log('Transaction status:', result);
        return result;
    } catch (error) {
        console.error('Error checking transaction status:', error);
    }
};

const getAddressTransactions = async (address) => {
    const hexAddress = tronWeb.address.toHex(address);
    console.log(hexAddress)
    try {
        const response = await axios.get(`https://api.trongrid.io/v1/accounts/${address}/transactions`, {
            params: { limit: 10 }
        });

        const transactions = response.data.data;
        // console.log(transactions[0].raw_data?.contract[0].parameter)
        // console.log(transactions[0]?.txID)

        if (transactions.length === 0) {
            console.log(`No transactions found for address: ${address}`);
            return;
        }

        // Iterate through the transactions and display relevant information
        transactions.forEach(transaction => {
            const isDeposit = transaction.raw_data.contract.some(contract => 
                contract.type === 'TransferContract' && contract.parameter.value.to_address === hexAddress
            );

            const isWithdrawal = transaction.raw_data.contract.some(contract => 
                contract.type === 'TransferContract' && contract.parameter.value.owner_address === hexAddress
            );
         
            if (isDeposit) {
                console.log(`A deposit of ${transaction?.raw_data.contract[0].parameter.value.amount/1000000} TRX has been detected to your Eza wallet`);
                console.log({
                    trxId: transaction.txID,
                    blockNumber: `${transaction.blockNumber}`,
                    amount: transaction?.raw_data.contract[0].parameter.value.amount/1000000,
                    Timestamp: `${new Date(transaction.block_timestamp).toLocaleString()}`,
                    Fee: `${transaction.net_fee / 1e6} TRX`,
                    from: transaction.raw_data.contract[0].parameter.value.owner_address
                })
            } else if (isWithdrawal) {
                console.log(`No withdrawal found`);
            } else {
                console.log(`Status: Unknown`);
            }

            console.log('---');
        });
    } catch (error) {
        console.error('Error retrieving transactions:', error.response ? error.response.data : error);
    }
};
const startPolling = (address, interval) => {
    setInterval(() => {
        getAddressTransactions(address);
    }, interval);
}

// getAddressTransactions("TYLp6K2BzWGURaVcWqa5Z6TAhYsMnSa6LC")

module.exports = { generateTronAddress, sendTrx, getAddressInfo, checkTransactionStatus, getAddressTransactions }