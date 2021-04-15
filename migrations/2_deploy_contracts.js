const MeToken = artifacts.require("meToken");

module.exports = async function(deployer) {
    deployer.deploy(MeToken);
};