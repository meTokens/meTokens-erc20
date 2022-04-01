import { deploy } from "../test/utils/helpers";
import { MeTokens } from "../artifacts/types";
import { ethers, network } from "hardhat";
import fs from "fs";
import { verifyContract } from "./utils";

async function main() {
  const [deployer] = await ethers.getSigners();
  if (!deployer.provider) {
    process.exit(1);
  }
  const { chainId } = await deployer.provider.getNetwork();

  const constructorParams = ["meTokens", "ME"];

  // deploy erc20 contract
  let meTokens = await deploy<MeTokens>(
    "MeTokens",
    undefined,
    constructorParams[0],
    constructorParams[1]
  );
  console.log(`MeTokens deployed at ${meTokens.address}`);

  const deploymentInfo = {
    deployer: deployer.address,
    owner: deployer.address,
    chainId,
    meTokensContract: meTokens.address,
  };

  console.log("Deployment Info: ", deploymentInfo);

  fs.writeFileSync(
    `deployments/${network.name}.json`,
    JSON.stringify(deploymentInfo, undefined, 2)
  );

  // TODO can also add mainnet here
  if (network.name === "rinkeby") {
    console.log(
      "wait for 5 blocks until bytecodes are uploaded into etherscan"
    );
    await meTokens.deployTransaction.wait(5);
    await verifyContract("MeTokens", meTokens.address, constructorParams);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
