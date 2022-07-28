import { deploy } from "../test/utils/helpers";
import { ME } from "../artifacts/types";
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
  let me = await deploy<ME>(
    "ME",
    undefined,
    constructorParams[0],
    constructorParams[1]
  );
  console.log(`ME deployed at ${me.address}`);

  const deploymentInfo = {
    deployer: deployer.address,
    owner: deployer.address,
    chainId,
    meContract: me.address,
  };

  console.log("Deployment Info: ", deploymentInfo);

  fs.writeFileSync(
    `deployments/${network.name}.json`,
    JSON.stringify(deploymentInfo, undefined, 2)
  );

  if (network.name === "rinkeby" || network.name === "mainnet") {
    console.log(
      "wait for 5 blocks until bytecodes are uploaded into etherscan"
    );
    await me.deployTransaction.wait(5);
    await verifyContract("ME", me.address, constructorParams);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
