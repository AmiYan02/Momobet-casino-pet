# MomoBet - Challenge Submission

**Network:**
Ethereum Sepolia Testnet

---

## Short Summary

MomoBet is a small Web3 casino prototype built for the challenge.

I joined the challenge mostly for fun and learning, not as a serious attempt to win. The goal was to understand the basic Web3 casino flow: wallet connection, testnet balance, internal casino balance, cashier concept, and simple game logic.

The project was built partly manually and partly with AI assistance. I wrote and edited parts of the code myself, tested the flow step by step, and used AI mostly as a helper to move faster.

---

## What Works

* Live testnet version is deployed
* GitHub repository is available
* MetaMask wallet connection works
* Ethereum Sepolia testnet is used
* Connected wallet address is shown in the UI
* Sepolia ETH wallet balance is displayed
* MOMO Test Chips faucet is available
* MOMO Wallet Balance and MOMO Casino Balance are separated in the UI
* Casino balance can be used inside the product flow
* Fungal Crash game prototype is available
* Game actions update the casino balance
* Basic deposit / withdraw concept is shown in the cashier
* MetaMask is shown as a payment method
* Casino lobby UI is available
* Basic footer/legal sections are added:

  * Terms and Conditions
  * KYC Policy
  * Privacy Notice
  * Responsible Gaming Policy

---

## What Does Not Work Yet

* This is not a production-ready casino
* Real money processing is not implemented
* Full on-chain casino logic is not completed
* Smart contract logic is limited / experimental
* Game settlement is not fully on-chain
* Provably fair logic is not implemented yet
* Legal pages are placeholders
* KYC provider integration is not implemented
* Security review was not done
* Mobile version still needs polishing
* Some UI and game logic parts still need cleanup
* 5-minute Loom is not included

---

## Why Ethereum Sepolia

I chose Ethereum Sepolia because it was the fastest way for me to test the basic Web3 flow with MetaMask.

The main goal was not to build the most optimized blockchain casino, but to understand how wallet connection, testnet balance, internal casino balance, and simple game flow can work together in one prototype.

---

## Main Learning

The biggest learning was the difference between wallet balance and casino balance.

At first, it was easy to mix them together. But in a casino product, the connected wallet balance and the internal playable balance should be treated separately.

So I separated the logic:

**MOMO Wallet Balance** - wallet / on-chain side
**MOMO Casino Balance** - internal playable casino balance

Game wins and losses affect the casino balance, not the wallet balance directly.

This made the product logic much clearer.

---

## AI Tools

I used AI tools during the challenge, but the project was not fully AI-generated.

AI helped with:

* frontend speed
* debugging
* UI changes
* Web3 explanations
* README / Notion structure
* turning rough ideas into tasks

Manual work included:

* writing and editing code
* testing the flow
* checking fixes
* changing product logic
* deciding how balances should work
* final product decisions

AI was useful, but it still needed manual testing, correction, and product direction.

---

## Final Note

This is a learning prototype, not a finished casino product.

I joined the challenge for fun and to understand the Web3 flow better. The project helped me understand where a simple Web3 demo ends and where real payment product architecture begins.
