import { run } from "hardhat";

export const verify = async (
  address: string,
  constructorArguments?: any[] | undefined
) => {
  console.log(
    `verify  ${address} with arguments ${
      constructorArguments && constructorArguments.join(",")
    }`
  );
  await run("verify:verify", {
    address,
    constructorArguments,
  });
};

export const verifyContract = async (
  contractName: string,
  contractAddress: string,
  args: any = undefined
) => {
  try {
    console.log(`Verifying ${contractName}`);
    if (args) {
      await verify(contractAddress, args);
    } else await verify(contractAddress);
  } catch (e) {
    console.log(e);
  }
};
