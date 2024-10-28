const  tronWeb = require("./testConfig.js");
const axios = require('axios');

const contractAdd = "41eca9bc828a3005b9a3b909f2cc5c2a54794de05f"
// Example usage:
const address1funded = {
    Address: "TYLp6K2BzWGURaVcWqa5Z6TAhYsMnSa6LC",
    PrivateKey: "B58FF8C2708ABF8F8CADE837F678C3D6191CA327053A42114D1525F93F632C92"
};

const recipientAddress = "TGpugTNwBLCNnGub7gV3x1V6DH5wU6wxCG"; // Address to receive tokens
const amountToTransfer = 50; // Amount of tokens to send

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
        // throw error; // Throw the error so it's caught in the controller
    }
}; 

const sendTestnetTrx = async (fromAddress, toAddress, amount, privateKey, contractAddress = null) => {
    try {
        tronWeb.setPrivateKey(privateKey);

        const fromHex = tronWeb.address.toHex(fromAddress);
        const toHex = tronWeb.address.toHex(toAddress);

        let tradeObject;

        if (contractAddress) {
            // const contract = await tronWeb.contract().at(contractAddress); 
            const tokenAmount = amount * 1e6;

            const cnt = await tronWeb.trx.getContract(contractAddress)
            const abi = cnt.abi.entrys
            let instance = await tronWeb.contract(abi, contractAddress);
            tradeObject = await instance.transfer(toHex, tokenAmount).send({
                feeLimit: 100_000_000,
                callValue: 0,
                // shouldPollResponse: true, 
            });
        } else {
            tradeObject = await tronWeb.transactionBuilder.sendTrx(toHex, amount * 1e6, fromHex);
            const signedTransaction = await tronWeb.trx.sign(tradeObject, privateKey);
            const result = await tronWeb.trx.sendRawTransaction(signedTransaction);
            console.log('Transaction result:', result);
            return result;
        }

        console.log('Trade Object:', tradeObject);
        return tradeObject;

    } catch (error) {
        console.error('Error sending TRX:', error.response ? error.response.data : error); 
    }
};

const getContract = async (contr) => {
    const cnt = await tronWeb.trx.getContract(contr)
    console.log(cnt.abi)
}

// getContract("41eca9bc828a3005b9a3b909f2cc5c2a54794de05f")
 
// sendTestnetTrx("TYLp6K2BzWGURaVcWqa5Z6TAhYsMnSa6LC", "TU5G97XX7BF75EUsPArYD3ca6qri8goe7E", 10, "B58FF8C2708ABF8F8CADE837F678C3D6191CA327053A42114D1525F93F632C92", contractAdd)

// /done......
const estimateTransactionFee = async ( fromAddress, toAddress, contractAdd) => {
  try {
      if (!tronWeb.isAddress(fromAddress) || !tronWeb.isAddress(toAddress)) {
          throw new Error("Invalid address format"); 
      }

      const result = await tronWeb.transactionBuilder.estimateEnergy(
          contractAdd,
          'transfer(address,uint256)',
          {},
          [
              { type: 'address', value: toAddress },
          ],
          fromAddress
      );

      console.log('Energy required:', result.energy_required);

      const energyInTRX = tronWeb.fromSun(result.energy_required);
      console.log('Estimated Energy Fee (TRX):', energyInTRX);

      return {
          energyFee: energyInTRX,
          rawResult: result
      };
  } catch (error) {
      console.error("Error estimating energy fee:", error);
      return {
          error: "Could not estimate transaction fee."
      };
  }
};

// estimateTransactionFee("TYLp6K2BzWGURaVcWqa5Z6TAhYsMnSa6LC", "TGpugTNwBLCNnGub7gV3x1V6DH5wU6wxCG")

///done
///tron balance
const getTronBalance = async (address) => {
  try {
      const accountBalanceInSun = await tronWeb.trx.getBalance(address);
      const accountBalanceInTrx = tronWeb.fromSun(accountBalanceInSun);  // Convert from Sun to TRX
      console.log('Account balance (TRX):', accountBalanceInTrx);
      return Number(accountBalanceInTrx);
  } catch (error) {
      console.error('Error getting address info:', error);
  }
};
///other trx token balance
const getTtxTokenBalance = async (address, contractAdd) => {
try {
    // Create an instance of the token contract
    tronWeb.setAddress(address);
    const contract = await tronWeb.contract().at(contractAdd);

    // Call the balanceOf method for the provided address
    const balanceInSun = await contract.balanceOf(address).call();
    
    // Convert balance from Sun to TRX (assuming the token uses TRX decimals)
    const balanceInTrx = tronWeb.fromSun(balanceInSun.toString());
    
    console.log(`TRC20 Token Balance for ${contractAdd} (TRX):`, balanceInTrx);
    return Number(balanceInTrx);
} catch (error) {
    console.error('Error getting TRC20 token balance:', error);
}
};

const checkTestnetTransactionStatus = async (transactionID) => {
  try {
      // Fetch basic transaction details
      const transactionResult = await tronWeb.trx.getTransaction(transactionID);
      console.log('Transaction details:', transactionResult); 
      
      // Fetch detailed transaction info, including block confirmations
      const transactionInfo = await tronWeb.trx.getTransactionInfo(transactionID);
      console.log('Transaction info:', transactionInfo);
      
      // Check if the transaction is confirmed
      if (transactionInfo.receipt && transactionInfo.receipt.result === "SUCCESS") {
          console.log('Transaction confirmed and successful');
      } else {
          console.log('Transaction is still pending or failed');
      }

      return { transactionResult, transactionInfo };
  } catch (error) {
      console.error('Error checking transaction status:', error);
  }
};

//////watching done
const getTrxTokensDepoit = async (usdtContractAddress, trackedAddresses) => {
  let lastFingerprint = null; // Use fingerprint to keep track of paginated results
  let detectedEvents = [];  // Array to store the entire detected deposit events
let interval = 300000
  const checkForNewDeposits = async () => {
    try {
      // Query the contract's Transfer events
      const options = {
        eventName: 'Transfer', // Only interested in Transfer events
        limit: 200,            // Set a limit to control pagination size
      };

      if (lastFingerprint) {
        options.fingerprint = lastFingerprint; // Use the previous fingerprint if available
      }

      const events = await tronWeb.event.getEventsByContractAddress(usdtContractAddress, options);

      if (events && events.data && events.data.length > 0) {
        events.data.forEach(event => {
          const { from, to, value } = event.result;

          const fromAddress = tronWeb.address.fromHex(from);
          const toAddress = tronWeb.address.fromHex(to);
          const amountSent = value / 1e6; // USDT has 6 decimal places

          // Check if the recipient address is in the list of tracked addresses
          if (trackedAddresses.includes(toAddress)) {
            // console.log(`USDT deposit detected: TX ID ${event.transaction_id} from ${fromAddress} to ${toAddress}. Amount: ${amountSent}`);
            // Push the entire event into the array
            detectedEvents.push(event);
            
            
            // Optionally, handle the deposit here (e.g., update user balances, send notifications)
          }
        });
        
        // Update the fingerprint for the next batch of results
        lastFingerprint = events.meta.fingerprint;
      } else {
        console.log('No new deposit events found.');
      }
    } catch (error) {
      console.error('Error checking for new deposits:', error);
    }
    return detectedEvents;
  };
  
  setInterval(checkForNewDeposits, interval);
  detectedEvents = await checkForNewDeposits()
  if(!detectedEvents) {
    return;
  }

  return detectedEvents;
};

const getTronDeposits = async (trackedAddresses) => {
  let lastCheckedBlockNumber = 0; // Keep track of the last checked block
  let detectedTrxDeposits = [];   // Array to store detected TRX transactions
  let interval = 500000;

  const checkForNewDeposits = async () => {
    try {
      const currentBlock = await tronWeb.trx.getCurrentBlock();
      const newBlockNumber = currentBlock.block_header.raw_data.number;
      
      // Check if the block contains transactions and it is newer than the last checked block
      if (currentBlock.transactions && newBlockNumber > lastCheckedBlockNumber) {
        for (const transaction of currentBlock.transactions) {
          const contract = transaction.raw_data.contract[0];
          
          // Ensure the transaction is of type TransferContract (native TRX)
          if (contract.type === "TransferContract") {
            // console.log("currentBlock..44444...", transaction.raw_data.contract[0])
            const fromAddress = contract.parameter.value.owner_address; // Sender
            const toAddress = contract.parameter.value.to_address;      // Recipient
            const amountSent = contract.parameter.value.amount / 1e6;   // Amount sent (TRX has 6 decimal places)

            // Convert addresses from hex format to base58
            const fromBase58 = tronWeb.address.fromHex(fromAddress);
            const toBase58 = tronWeb.address.fromHex(toAddress);
            
            // Check if the recipient address is being tracked
            if (trackedAddresses.includes(toBase58)) {
              console.log(fromBase58, "......base")
              console.log(toBase58, "......toBase58")
              console.log(`TRX deposit detected: TX ID ${transaction.txID} from ${fromBase58} to ${toBase58}. Amount: ${amountSent}`);
              // console.log("object", transaction)
              // Store the detected transaction in the array
              detectedTrxDeposits.push(transaction);
              console.log("detectedTrxDeposits.........new", detectedTrxDeposits[0].raw_data.contract[0].parameter)
            }
          }
        }
        // Update last checked block number
        lastCheckedBlockNumber = newBlockNumber;
      }
    } catch (error) {
      console.error("Error checking for TRX deposits:", error);
    }
    
    if(!detectedTrxDeposits) {
      return [];
    }
    // console.log(detectedTrxDeposits)
    
    return detectedTrxDeposits; // Return detected TRX deposits after each poll
  };
  
  // Poll for new deposits at the specified interval
  setInterval(checkForNewDeposits, interval);
  
  // Perform an initial check and return the array of detected TRX transactions
  detectedTrxDeposits = await checkForNewDeposits();
  // console.log("detectedTrxDeposits...........68669", detectedTrxDeposits)
  return detectedTrxDeposits;
};

const watchAllTokens = async (trackedAddresses, usdtContractAddress = null) => {

  try {
    let res
    if(usdtContractAddress) {
      res = await getTrxTokensDepoit(usdtContractAddress, trackedAddresses)
    } else {
      res = await getTronDeposits(trackedAddresses)
    }
    return res
  } catch (error) {
    console.log(error)
  }

}
    
module.exports = { 
  generateTronAddress, 
  sendTestnetTrx, 
  getTronBalance, 
  getTtxTokenBalance, 
  checkTestnetTransactionStatus, 
  watchAllTokens,
  estimateTransactionFee

}