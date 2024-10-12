const express = require("express");
const mainRoutes = require("./routes/mainnet/index.js")
const testRoutes = require("./routes/testnet/index.js")
const { getBlocks,addressIsValid } = require("./trx-services/testnet/helper.js")

require('dotenv').config();

const testnet = process.env.TESTNET === 'true';

const app = express();
const port = 1101;

app.use(express.json());
// getBlocks()
// addressIsValid("TY4DMtkFqb6gDyhhmn2mm9TDLRkAxLaSfL")
app.use('/api/trx', testnet ? testRoutes : mainRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
