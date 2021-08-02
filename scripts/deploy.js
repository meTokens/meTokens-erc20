const { network: { provider }, expect, artifacts } = require('hardhat');

require('dotenv').config();

const MeTokens = artifacts.require("MeTokens");

async function main() {

    // deploy erc20 contract
    let meTokens = await MeTokens.new();
    console.log(meTokens.address);

}


main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
