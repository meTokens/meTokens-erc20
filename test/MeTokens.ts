import { ethers, getNamedAccounts } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Signer } from "ethers";
import { mineBlock, passHours, setAutomine } from "./utils/hardhatNode";
import { deploy, getContractAt, fromETHNumber } from "./utils/helpers";
import { ERC20, MeTokens } from "../artifacts/types";

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
      let mintableSupply = (await meTokens.totalSupply())
        .mul(await meTokens.getPctMintable())
        .div(PRECISION);

      // Fails when minting slightly more than the mintable supply
      const tx = meTokens.mint(
        account2.address,
        mintableSupply.mul(10000000).div(9999999)
      );
      await expect(tx).to.be.revertedWith("amount exceeds max");

      // Succeeds when minting the mintable supply
      await meTokens.mint(account2.address, mintableSupply);
      expect(await meTokens.balanceOf(account2.address)).to.equal(
        mintableSupply
      );

      block = await ethers.provider.getBlock("latest");
      expect(await meTokens.lastMintTimestamp()).to.equal(
        block.timestamp.toString()
      );
      expect(await meTokens.getPctMintable()).to.equal("0");
      expect(await meTokens.lastMintPct()).to.equal("0");
    });
  });
};

setup().then(() => {
  run();
});
