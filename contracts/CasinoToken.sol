// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract CasinoToken is ERC20 {
    uint256 public constant CLAIM_AMOUNT = 1000 ether;
    uint256 public constant CLAIM_COOLDOWN = 60;

    mapping(address => uint256) public lastClaimAt;

    event TokensClaimed(address indexed user, uint256 amount);

    constructor() ERC20("Momo Test Chip", "MOMO") {}

    function claim() external {
        uint256 nextClaimAt = lastClaimAt[msg.sender] + CLAIM_COOLDOWN;
        require(block.timestamp >= nextClaimAt, "Claim cooldown active");

        lastClaimAt[msg.sender] = block.timestamp;
        _mint(msg.sender, CLAIM_AMOUNT);

        emit TokensClaimed(msg.sender, CLAIM_AMOUNT);
    }
}
