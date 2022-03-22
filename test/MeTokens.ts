import { ethers, getNamedAccounts } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber, Signer } from "ethers";
import { mineBlock, passHours, setAutomine } from "./utils/hardhatNode";
import { deploy, getContractAt, fromETHNumber } from "./utils/helpers";
import { ERC20, MeTokens } from "../artifacts/types";

const calGetPctMintable = async (
  timestamp: BigNumber,
  lastMintTimestamp: BigNumber,
  lastMintPct: BigNumber,
  MAX_PCT_MINTABLE: BigNumber,
  PRECISION: BigNumber
) => {
  const period = timestamp.sub(lastMintTimestamp);
  const pctOfYear = period
    .mul(PRECISION)
    .div(BigNumber.from(365).mul(24 * 60 * 60));
  const pctUnlockedToMint = pctOfYear.mul(MAX_PCT_MINTABLE).div(PRECISION);
  const totalPctToMint = pctUnlockedToMint.add(lastMintPct);
  return totalPctToMint >= BigNumber.from(MAX_PCT_MINTABLE)
    ? BigNumber.from(MAX_PCT_MINTABLE)
    : totalPctToMint;
};

const setup = async () => {
  const MAX_PCT_MINTABLE = fromETHNumber(0.05);
  const ONE_PCT = fromETHNumber(0.01);
  const RANDOM_PCT = fromETHNumber(0.0000069);
  const PRECISION = fromETHNumber(1);
  let meTokens: MeTokens;
  let account0: SignerWithAddress;
  let account1: SignerWithAddress;
  let account2: SignerWithAddress;
  describe("MeTokens.sol", () => {
    before(async () => {
      [account0, account1, account2] = await ethers.getSigners();
      meTokens = await deploy<MeTokens>(
        "MeTokens",
        undefined,
        "meTokens",
        "ME"
      );
    });

    it("Correct initial state", async () => {
      // Starting supply of 1 million ME
      expect(await meTokens.balanceOf(account0.address)).to.equal(
        fromETHNumber(1000000)
      );
      // Starting mintable supply of 0
      expect(await meTokens.getPctMintable()).to.equal("0");
      // last mint timestamp as deploy block
      let block = await ethers.provider.getBlock("latest");
      expect(await meTokens.lastMintTimestamp()).to.equal(
        block.timestamp.toString()
      );
      // Last mint percent at 0
      expect(await meTokens.lastMintPct()).to.equal("0");
    });

    it("Mintable supply increases at a rate of 5%/year", async () => {
      // Fast forward 73 days, or 1/5 of a year
      let block = await ethers.provider.getBlock("latest");
      await mineBlock(block.timestamp + 73 * 24 * 60 * 60);
      // 1/5 of 5% is 1%
      expect(await meTokens.getPctMintable()).to.equal(ONE_PCT);
    });

    it("Mintable supply never exceeds 5%", async () => {
      // Fast forward two years
      let block = await ethers.provider.getBlock("latest");
      await mineBlock(block.timestamp + 730 * 24 * 60 * 60);
      expect(await meTokens.getPctMintable()).to.equal(MAX_PCT_MINTABLE);
    });

    it("Only owner can mint", async () => {
      let amountMinted = (await meTokens.totalSupply())
        .mul(RANDOM_PCT)
        .div(PRECISION);
      // Fails when non-owner tries to mint
      const tx = meTokens
        .connect(account1)
        .mint(account1.address, amountMinted);
      await expect(tx).to.be.revertedWith("Ownable: caller is not the owner");

      // Succeeds when owner mints
      await meTokens.mint(account1.address, amountMinted);
      expect(await meTokens.balanceOf(account1.address)).to.equal(amountMinted);
      expect(await meTokens.getPctMintable()).to.equal(
        MAX_PCT_MINTABLE.sub(RANDOM_PCT)
      );
      expect(await meTokens.lastMintPct()).to.equal(
        MAX_PCT_MINTABLE.sub(RANDOM_PCT)
      );
      const block = await ethers.provider.getBlock("latest");
      expect(await meTokens.lastMintTimestamp()).to.equal(
        block.timestamp.toString()
      );
    });

    it("Owner cannot mint more than mintable supply", async () => {
      // fast-fwd an hr and get mintable supply
      let block = await ethers.provider.getBlock("latest");
      await mineBlock(block.timestamp + 60 * 60);

      block = await ethers.provider.getBlock("latest");
      await setAutomine(false);

      const pctMintable = await calGetPctMintable(
        BigNumber.from(block.timestamp).add(1), // adding one here as next tx is mined at timestamp+1
        await meTokens.lastMintTimestamp(),
        await meTokens.lastMintPct(),
        MAX_PCT_MINTABLE,
        PRECISION
      );

      const mintableSupply = (await meTokens.totalSupply())
        .mul(pctMintable)
        .div(PRECISION);

      console.log("block.timestamp", String(block.timestamp));
      console.log("pctMintable", String(pctMintable));
      console.log("mintableSupply", String(mintableSupply));

      console.log(
        "reverse pctMintable",
        String(mintableSupply.mul(PRECISION).div(await meTokens.totalSupply()))
      );

      const tx = meTokens.mint(
        account2.address,
        mintableSupply.add(await meTokens.totalSupply())
      );
      await expect(tx).to.be.revertedWith("amount exceeds max");

      // Succeeds when minting the mintable supply
      block = await ethers.provider.getBlock("latest");
      await meTokens.mint(account2.address, mintableSupply);

      await setAutomine(true);
      await mineBlock(block.timestamp + 1);
      const lastMineTimestamp = block.timestamp + 1;
      expect(await meTokens.balanceOf(account2.address)).to.equal(
        mintableSupply
      );

      expect(await meTokens.lastMintTimestamp()).to.equal(lastMineTimestamp);
      expect(await meTokens.getPctMintable()).to.equal("0");
      expect(await meTokens.lastMintPct()).to.equal("0");
      await setAutomine(true);
    });
  });
};

setup().then(() => {
  run();
});
