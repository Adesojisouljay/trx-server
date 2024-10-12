const { TronWeb } = require('tronweb');

// Initialize TronWeb instance without a private key
const tronWeb = new TronWeb({
    fullHost: 'https://api.trongrid.io'
});

module.exports = tronWeb