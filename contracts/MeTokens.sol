// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {ERC20, IERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import {ERC20Burnable} from '@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol';
import {ERC20Snapshot} from '@openzeppelin/contracts/token/ERC20/extensions/ERC20Snapshot.sol';
import {ERC20Votes} from '@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol';
import {IERC20Permit} from '@openzeppelin/contracts/token/ERC20/extensions/draft-IERC20Permit.sol';
import {Ownable} from '@openzeppelin/contracts/access/Ownable.sol';
import {EIP712} from '@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol';



/// @title meTokens erc20 contract (ME)
/// @author @CBobRobison, @carlfarterson, @cryptounico
/// @notice Base erc20 contract used for meTokens protocol
abstract contract MeTokens is ERC20Votes, ERC20Snapshot, ERC20Burnable, Ownable {

    uint256 constant PRECISION = 10e18;
    uint256 constant MAX_PCT_MINTABLE = 5 * 10e16; // 5%
    uint256 private lastMintTimestamp;
    uint256 private lastMintPct;

    constructor() ERC20("meTokens", "ME") {
        _mint(msg.sender, 1000000 * 10**18); // 1 million ME
        lastMintTimestamp = block.timestamp;
    }


    function mint(address account, uint256 amount) external onlyOwner {
        uint256 amountPct = PRECISION * amount / totalSupply();
        require(amountPct <= getPctMintable(), "amount exceeds max");
        
        lastMintPct = getPctMintable() - amountPct;
        lastMintTimestamp = block.timestamp;

        _mint(account, amount);
    }

    function getChainId() external view returns (uint256) {
        return block.chainid;
    }

/*
period = 6 months
% of year = 50%
pctUnlockedToMint * 5% = 2.5%
totalPctToMint = 2.5% + 0 = 2.5%
*/

    function getPctMintable() public view returns (uint256) {
        uint256 period = block.timestamp - lastMintTimestamp;
        uint256 pctOfYear = PRECISION * period / 365 days;
        uint256 pctUnlockedToMint = MAX_PCT_MINTABLE * pctOfYear;
        uint256 totalPctToMint = pctUnlockedToMint + lastMintPct;

        return totalPctToMint >= MAX_PCT_MINTABLE ? MAX_PCT_MINTABLE : totalPctToMint;
    }

    function _mint(address account, uint256 amount) internal virtual override(ERC20, ERC20Votes) {
        return super._mint(account, amount);
    }
    function _burn(address account, uint256 amount) internal virtual override(ERC20, ERC20Votes) {
        return super._burn(account, amount);
    }
    function _afterTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20, ERC20Votes) {
        return super._afterTokenTransfer(from, to, amount);
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount) internal virtual override(ERC20, ERC20Snapshot) {
        return super._beforeTokenTransfer(from, to, amount);
    }
}
