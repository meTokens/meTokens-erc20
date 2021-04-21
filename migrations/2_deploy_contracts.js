const MeToken = artifacts.require("MeToken");
const SMeToken = artifacts.require("sMeToken");
const SwapContract = artifacts.require("SwapContract");

module.exports = async function(deployer, addresses) {

    // Deploy MeToken + "Pre-Mine" 200000
    await deployer.deploy(MeToken);
    const meToken = await MeToken.deployed();
    await meToken.mint(process.env.ADMIN_ADDRESS, 200000);

    // Deploy sMeToken + Mint Total Supply 200000 + Add Admin
    await deployer.deploy(SMeToken, 200000);
    const sMeToken = await SMeToken.deployed();
    await sMeToken.addAdmin(process.env.ADMIN_ADDRESS);

    // Deploy SwapContract
    await deployer.deploy(
        SwapContract,
        sMeToken.address, // process.env.SYNTHETIC_TOKEN,
        meToken.address, // process.env.AUTHENTIC_TOKEN,
        web3.utils.toWei(process.env.SYNTHETIC_TOTAL),
        web3.utils.toWei(process.env.AUTHENTIC_TOTAL)
        );
        
    const swapContract = await SwapContract.deployed();
    
    // Whitelist Contract
    await sMeToken.addToWhitelist(swapContract.address);

};