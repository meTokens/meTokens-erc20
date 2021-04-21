//SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/access/Ownable.sol";


contract SwapContract is Ownable {
    
    address public synthetic;
    address public authentic;
    
    uint256 public synTotal;
    uint256 public authTotal;
    
    address[] public swapUsers;
    mapping(address => uint256) public swappedAmount;
    
    bool public isInitiated = false;

    constructor(address _synthetic, address _authentic, uint256 _synTotal, uint256 _authTotal) {
        synthetic = _synthetic;
        authentic = _authentic;
        synTotal = _synTotal;
        authTotal = _authTotal;
    }
   
    function swap(uint256 _amount) public {
        require(_amount > 0, "amount cannot be 0");
        require(isInitiated == true, "Swap has not started yet");
        
        IERC20(synthetic).transferFrom(msg.sender, address(0x000000000000000000000000000000000000dEaD), _amount);
        
        uint256 finalAmount = _amount * authTotal / synTotal;
        IERC20(authentic).transfer(msg.sender, finalAmount);
        
        if(swappedAmount[msg.sender] <= 0) {
            swapUsers.push(msg.sender);
        }

        swappedAmount[msg.sender] = swappedAmount[msg.sender] + finalAmount;
    }
    
    function initiateSwap() public onlyOwner {
        require(IERC20(authentic).balanceOf(address(this)) >= authTotal, "Target token balance too low");
        require(isInitiated == false, "Swap already initiated");
        isInitiated = true;
    }
    
    function withdrawTokens(address _token, address _to, uint256 _amount) public onlyOwner {
        require(isInitiated == false, "Swap already initiated");
        IERC20 token = IERC20(_token);
        token.transfer(_to, _amount);
    }
    
    function calculateTokens(uint256 _amount) public view returns(uint256) {
        uint256 receiveAmount = _amount * (authTotal) / (synTotal);
        return receiveAmount;
    }
   
}