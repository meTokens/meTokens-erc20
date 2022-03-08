import { ethers, getNamedAccounts } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Signer } from "ethers";
import { mineBlock } from "./utils/hardhatNode";
import { deploy, getContractAt } from "./utils/helpers";
import { MeTokens } from "../artifacts/types";

const setup = async () => {
  describe("MeTokens.sol", () => {});
};

setup().then(() => {
  run();
});
