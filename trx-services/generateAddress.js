const  tronWeb = require("./mainnet/tronwebConfig.js")

const generateTronAddress = () => {
    tronWeb.createAccount().then(result => {
        console.log("New TRON Address:", result.address.base58);
        console.log("Private Key:", result.privateKey);
        const trxAddress = {
            address: result.address.base58,
            privateKey: result.privateKey
        }
        return trxAddress
    }).catch(error => {
        console.error('Error generating TRON address:', error);
    });
};

module.exports = { generateTronAddress };
