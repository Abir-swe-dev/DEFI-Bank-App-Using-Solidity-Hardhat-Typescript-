const hre = require("hardhat");

async function main() {
  console.log("Deploying DeFiBank contract...");

  const DeFiBank = await hre.ethers.getContractFactory("DeFiBank");
  const defiBank = await DeFiBank.deploy();

  await defiBank.waitForDeployment();

  const address = await defiBank.getAddress();
  console.log(`DeFiBank deployed to: ${address}`);

  // Save the contract address to a file
  const fs = require("fs");
  const contractsDir = "./src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  fs.writeFileSync(
    contractsDir + "/contract-address.json",
    JSON.stringify({ DeFiBank: address }, undefined, 2)
  );

  // Copy the ABI from Hardhat artifacts to src/contracts
  const artifactPath = "./artifacts/contracts/DeFiBank.sol/DeFiBank.json";
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  
  fs.writeFileSync(
    contractsDir + "/DeFiBank.json",
    JSON.stringify({ abi: artifact.abi }, undefined, 2)
  );

  console.log("Contract address saved to src/contracts/contract-address.json");
  console.log("Contract ABI saved to src/contracts/DeFiBank.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
