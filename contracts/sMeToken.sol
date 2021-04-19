// SPDX-License-Identifier: MIT

import '@openzeppelin/contracts/utils/Context.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/access/Ownable.sol';

pragma solidity ^0.6.12;

contract sMeToken is ERC20("sMe Token", "SME"), ERC20Burnable, Ownable {
    mapping(address => bool) private admin;
    mapping(address => bool) private whitelist;
    uint8 private _decimals;
    uint256 private _totalSupply;
    
    constructor (uint256 totalSupply_) public {
        _totalSupply = totalSupply_;
        _decimals = 18;
    }

    // OWNER | SME OWNER MINTS
    function mint(address _to, uint256 _amount) public onlyOwner {
        _mint(_to, _amount);
    }

    // PERMISSIONS | ADMINS (OR OWNER) MAY ADD/REMOVE WHITELIST + ADMINS

    // VERIFY | ADMIN
    function isAdmin(address check) public view returns (bool) {
        return admin[check] == true;
    }

    // ADD | ADMIN
    function addAdmin(address newAdmin) public {
        require(msg.sender == owner() || isAdmin(msg.sender), "Insufficient Permissions");
        admin[newAdmin] = true;
    }

    // VERIFY | ADDRESS WHITELISTED
    function isWhitelisted(address check) public view returns (bool) {
        return whitelist[check] == true;
    }

    // ADD | CONTRACT WHITELIST
    function addToWhitelist(address newContract) public {
        require(msg.sender == owner() || isAdmin(msg.sender), "Insufficient Permissions");
        whitelist[newContract] = true;
    }

    // REMOVE | CONTRACT WHITELIST
    function removeFromWhitelist(address oldContract) public {
        require(msg.sender == owner() || isAdmin(msg.sender), "Insufficient Permissions");
        whitelist[oldContract] = false;
    }

    // OVERRIDE | TRANSFER UNAUTHORIZED
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        require(msg.sender == owner() || isWhitelisted(recipient), "Unauthorized transfer");
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    // OVERRIDE | TRANSFER FROM UNAUTHORIZED
    function transferFrom(address sender, address recipient, uint256 amount) public override returns (bool) {
        require(isWhitelisted(recipient), "Unauthorized transfer");
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), allowance(sender, recipient).sub(amount, "ERC20: transfer amount exceeds allowance"));
        return true;
    }
}