import { network } from "hardhat";

async function main() {
  const { viem } = await network.create("sepolia");

  console.log("Deploying MomoCasinoVault to Sepolia...");
  const casinoVault = await viem.deployContract("MomoCasinoVault");
  console.log("MomoCasinoVault deployed:", casinoVault.address);

  console.log("");
  console.log("Set this frontend env variable after deployment:");
  console.log(`NEXT_PUBLIC_CASINO_VAULT_ADDRESS=${casinoVault.address}`);
  console.log("");
  console.log("The frontend already reads NEXT_PUBLIC_CASINO_VAULT_ADDRESS from the env file.");
  console.log("Verification example:");
  console.log(`npx hardhat verify --network sepolia ${casinoVault.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
