// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract MomoCasinoVault is ReentrancyGuard {
    uint256 public constant CREDITS_PER_ETH = 100_000;
    uint256 public constant WIN_CHANCE_BPS = 4_800;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    mapping(address => uint256) public casinoBalances;
    mapping(address => uint256) private nonces;

    uint256 public totalCasinoCredits;

    event Deposited(address indexed user, uint256 ethAmount, uint256 momoCredits);
    event BetPlaced(address indexed user, uint256 momoAmount);
    event GameResolved(
        address indexed user,
        uint256 betAmount,
        bool won,
        uint256 payout,
        uint256 randomValue
    );
    event Withdrawn(address indexed user, uint256 ethAmount, uint256 momoCredits);

    function deposit() external payable nonReentrant {
        require(msg.value > 0, "Deposit must be greater than zero");

        uint256 momoCredits = ethToCredits(msg.value);
        casinoBalances[msg.sender] += momoCredits;
        totalCasinoCredits += momoCredits;

        emit Deposited(msg.sender, msg.value, momoCredits);
    }

    function withdraw(uint256 momoAmount) external nonReentrant {
        require(momoAmount > 0, "Withdraw amount must be greater than zero");
        require(casinoBalances[msg.sender] >= momoAmount, "Insufficient casino balance");

        uint256 ethAmount = creditsToEth(momoAmount);
        require(ethAmount > 0, "Withdraw amount too small");
        require(address(this).balance >= ethAmount, "Insufficient ETH liquidity");

        casinoBalances[msg.sender] -= momoAmount;
        totalCasinoCredits -= momoAmount;

        (bool success, ) = payable(msg.sender).call{value: ethAmount}("");
        require(success, "ETH transfer failed");

        emit Withdrawn(msg.sender, ethAmount, momoAmount);
    }

    function play(uint256 momoAmount)
        external
        nonReentrant
        returns (bool won, uint256 payout, uint256 randomValue)
    {
        require(momoAmount > 0, "Bet amount must be greater than zero");
        require(casinoBalances[msg.sender] >= momoAmount, "Insufficient casino balance");

        casinoBalances[msg.sender] -= momoAmount;
        totalCasinoCredits -= momoAmount;

        emit BetPlaced(msg.sender, momoAmount);

        randomValue = uint256(
            keccak256(
                abi.encodePacked(
                    block.prevrandao,
                    block.timestamp,
                    msg.sender,
                    nonces[msg.sender]++
                )
            )
        ) % BPS_DENOMINATOR;

        won = randomValue < WIN_CHANCE_BPS;
        payout = won ? momoAmount * 2 : 0;

        if (won) {
            require(
                hasSufficientEthBacking(totalCasinoCredits + payout),
                "Insufficient ETH liquidity for payout"
            );
            casinoBalances[msg.sender] += payout;
            totalCasinoCredits += payout;
        }

        emit GameResolved(msg.sender, momoAmount, won, payout, randomValue);
    }

    function balanceOf(address user) external view returns (uint256) {
        return casinoBalances[user];
    }

    function ethToCredits(uint256 ethAmount) public pure returns (uint256) {
        return ethAmount * CREDITS_PER_ETH;
    }

    function creditsToEth(uint256 momoAmount) public pure returns (uint256) {
        return momoAmount / CREDITS_PER_ETH;
    }

    function hasSufficientEthBacking(uint256 creditAmount) public view returns (bool) {
        return address(this).balance >= creditsToEth(creditAmount);
    }
}
