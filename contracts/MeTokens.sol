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

    /// @notice The timestamp after which minting may occur
    uint256 public mintingAllowedAfter;

    constructor() ERC20("meTokens", "ME") {
        mint(msg.sender, 1000000 * 10**18); // 1 million ME
        mintingAllowedAfter = block.timestamp + 365 days;
    }


    function mint(address _to, uint256 _amount) public onlyOwner {
        require(block.timestamp >= mintingAllowedAfter, "ME::mint: minting not allowed yet");
        
        _mint(_to, _amount);
    }

    function getChainId() external view returns (uint256) {
        return block.chainid;
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
