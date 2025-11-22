const hre = require("hardhat");

async function main() {
    console.log("Deploying DEFI Bank .....");

    const DeFiBank = await hre.ethers.getContractFactory("DeFiBank");
    const defiBank = await DeFiBank.deploy();

    await defiBank.waitForDeployment();

    const address = await defiBank.getAddress();
    console.log(`DeFiBank deployed to: ${address}`);

    const fs = require('fs');
    const contractsDir = "./src/contracts";

    if(!fs.existsSync(contractsDir)){
        fs.mkdirSync(contractsDir, { recursive: true });
    }

    fs.writeFileSync(
        contractsDir + "/defiBank-address.json",
        JSON.stringify({ DeFiBank: address }, undefined, 2)
    )

    console.log("DeFiBank address saved to src/contracts/defiBank-address.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

