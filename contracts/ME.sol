// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Snapshot} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol";
import {ERC20Votes} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/draft-ERC20Permit.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

/// @title meTokens erc20 governance contract (ME)
/// @author @CBobRobison, @cartercarlson, @parvgarg, @zgorrizzo69, @cryptounico
/// @notice Base erc20 token used for meTokens protocol governance
contract ME is ERC20Votes, ERC20Snapshot, ERC20Burnable, Ownable {
    uint256 public constant PRECISION = 1e18;
    uint256 public constant MAX_PCT_MINTABLE = 5 * 1e16; // 5%
    uint256 public lastMintTimestamp;
    uint256 public lastMintPct;

    constructor(string memory name, string memory symbol)
        ERC20(name, symbol)
        ERC20Permit(name)
    {
        _mint(msg.sender, 1000000 * 10**18); // 1 million ME
        lastMintTimestamp = block.timestamp;
    }

    /// @notice Mint new tokens, up to a rate of 5% of supply per rolling year
    /// @param account  Address to receive the minted ME
    /// @param pctMint  Percentage of supply to mint where 1e18 is 100%
    /// @param max      True if minting the max permitted
    function mint(
        address account,
        uint256 pctMint,
        bool max
    ) external onlyOwner {
        uint256 pctMintable = getPctMintable();
        require(pctMintable > 0, "nothing to mint");
        uint256 amount;
        if (max) {
            amount = (totalSupply() * pctMintable) / PRECISION;
        } else {
            require(pctMint <= pctMintable, "amount exceeds max");
            require(pctMint != 0, "pctMint == 0");
            amount = (totalSupply() * pctMint) / PRECISION;
        }

        lastMintPct = pctMintable - pctMint;
        lastMintTimestamp = block.timestamp;

        _mint(account, amount);
    }

    function getChainId() external view returns (uint256) {
        return block.chainid;
    }

    /// @notice Get the percent of supply that can be minted at the current timestamp
    function getPctMintable() public view returns (uint256) {
        uint256 period = block.timestamp - lastMintTimestamp;
        uint256 pctOfYear = (PRECISION * period) / 365 days;
        uint256 pctUnlockedToMint = (MAX_PCT_MINTABLE * pctOfYear) / PRECISION;
        uint256 totalPctToMint = pctUnlockedToMint + lastMintPct;

        return
            totalPctToMint >= MAX_PCT_MINTABLE
                ? MAX_PCT_MINTABLE
                : totalPctToMint;
    }

    function _mint(address account, uint256 amount)
        internal
        virtual
        override(ERC20, ERC20Votes)
    {
        return super._mint(account, amount);
    }

    function _burn(address account, uint256 amount)
        internal
        virtual
        override(ERC20, ERC20Votes)
    {
        return super._burn(account, amount);
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Votes) {
        return super._afterTokenTransfer(from, to, amount);
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override(ERC20, ERC20Snapshot) {
        return super._beforeTokenTransfer(from, to, amount);
    }
}
