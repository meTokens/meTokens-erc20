const meToken = artifacts.require("meToken");

module.exports = async function(deployer) {

    // Deploy meToken
    await deployer.deploy(
        meToken,
        process.env.ADMIN_ADDRESS,
        process.env.ADMIN_ADDRESS,
        process.env.START_TIME
        );
};