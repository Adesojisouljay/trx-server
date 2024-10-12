const  tronWeb = require("./testConfig.js");

const addressIsValid = (add) => {
   const res = tronWeb.isAddress(add)

   console.log(res)
   return res;
}

const getBlocks = async () => {
    const events = await tronWeb.event.getEventsOfLatestBlock();
console.log(events);
}

module.exports = { addressIsValid, getBlocks };