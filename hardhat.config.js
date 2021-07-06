require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-web3");
require("@nomiclabs/hardhat-etherscan");


require("dotenv").config();

module.exports = {
    defaultNetwork: "mainnet",
    solidity: {
        compilers: [
            { version: "0.8.0" }
        ]
    },
    mocha: {
        timeout: 60000 // Here is 2min but can be whatever timeout is suitable for you.
    },
    networks: {
        mainnet: {
            url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`,
            accounts: [`${process.env.PRIVATE_KEY}`,]
        },

    },
    etherscan: {
        url: String(`https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_KEY}`),
        apiKey: process.env.ETHERSCAN_KEY
    },
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
}