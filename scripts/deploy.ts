import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { network } from "hardhat";

const contractsOutputPath = path.join(process.cwd(), "src/lib/contracts.ts");

async function main() {
  const { viem } = await network.create("sepolia");

  console.log("Deploying CasinoToken to Sepolia...");
  const momoToken = await viem.deployContract("CasinoToken");
  console.log("CasinoToken deployed:", momoToken.address);

  console.log("Deploying MomoCasinoVault to Sepolia...");
  const casinoVault = await viem.deployContract("MomoCasinoVault", [momoToken.address]);
  console.log("MomoCasinoVault deployed:", casinoVault.address);

  const generated = `export const MOMO_TOKEN_ADDRESS = "${momoToken.address}" as const;
export const CASINO_VAULT_ADDRESS = "${casinoVault.address}" as const;

export const MOMO_TOKEN_ABI = ${JSON.stringify(momoToken.abi, null, 2)} as const;
export const CASINO_VAULT_ABI = ${JSON.stringify(casinoVault.abi, null, 2)} as const;

export const hasDeployedContracts = Boolean(
  MOMO_TOKEN_ADDRESS && CASINO_VAULT_ADDRESS,
);
`;

  await mkdir(path.dirname(contractsOutputPath), { recursive: true });
  await writeFile(contractsOutputPath, generated);

  console.log("");
  console.log("Saved frontend contract output to src/lib/contracts.ts");
  console.log("Verification examples:");
  console.log(`npx hardhat verify --network sepolia ${momoToken.address}`);
  console.log(`npx hardhat verify --network sepolia ${casinoVault.address} ${momoToken.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
