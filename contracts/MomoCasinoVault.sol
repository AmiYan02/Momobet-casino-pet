// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MomoCasinoVault is ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    mapping(address => uint256) public casinoBalances;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor(address tokenAddress) {
        require(tokenAddress != address(0), "Invalid token");
        token = IERC20(tokenAddress);
    }

    function deposit(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");

        casinoBalances[msg.sender] += amount;
        token.safeTransferFrom(msg.sender, address(this), amount);

        emit Deposited(msg.sender, amount);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(casinoBalances[msg.sender] >= amount, "Insufficient casino balance");
        require(token.balanceOf(address(this)) >= amount, "Insufficient vault liquidity");

        casinoBalances[msg.sender] -= amount;
        token.safeTransfer(msg.sender, amount);

        emit Withdrawn(msg.sender, amount);
    }

    function balanceOf(address user) external view returns (uint256) {
        return casinoBalances[user];
    }
}
