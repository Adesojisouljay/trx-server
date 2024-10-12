const { TronWeb } = require('tronweb');

const shasta = false
// Initialize TronWeb instance without a private key
const tronWeb = new TronWeb({
    fullHost: shasta ? 'https://api.shasta.trongrid.io' : 'https://nile.trongrid.io'
});

module.exports = tronWeb