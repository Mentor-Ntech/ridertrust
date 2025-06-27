import { ethers } from "hardhat";

async function main() {
  console.log("Starting DeliveryEscrow deployment...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log(
    "Account balance:",
    (await ethers.provider.getBalance(deployer.address)).toString()
  );

  // Deploy the DeliveryEscrow contract
  console.log("Deploying DeliveryEscrow...");
  const DeliveryEscrow = await ethers.getContractFactory("DeliveryEscrow");
  const deliveryEscrow = await DeliveryEscrow.deploy();

  await deliveryEscrow.waitForDeployment();
  const deliveryEscrowAddress = await deliveryEscrow.getAddress();

  console.log("DeliveryEscrow deployed to:", deliveryEscrowAddress);

  // Log deployment information
  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("Contract: DeliveryEscrow");
  console.log("Address:", deliveryEscrowAddress);
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Deployer:", deployer.address);
  console.log("Block Number:", await ethers.provider.getBlockNumber());

  // Verify the contract on CeloScan (if not on local network)
  const network = await ethers.provider.getNetwork();
  if (network.chainId !== 31337n) {
    // Not local network
    console.log("\nWaiting for block confirmations before verification...");
    await deliveryEscrow.waitForDeployment();

    console.log("Contract deployed successfully!");

    // Auto-verify the contract
    console.log("\nVerifying contract on CeloScan...");
    try {
      await hre.run("verify:verify", {
        address: deliveryEscrowAddress,
        constructorArguments: [],
      });
      console.log("Contract verified successfully on CeloScan!");
    } catch (error) {
      console.log("Verification failed:", error);
      console.log("\nYou can manually verify using:");
      console.log(
        `   npx hardhat verify --network ${
          network.name === "unknown" ? "alfajores" : network.name
        } ${deliveryEscrowAddress}`
      );
    }
  }

  return {
    deliveryEscrow: deliveryEscrowAddress,
    deployer: deployer.address,
    network: network.name,
  };
}

// Handle errors and exit
main()
  .then((result) => {
    console.log("\nDeployment completed successfully!");
    console.log("Contract deployed at:", result.deliveryEscrow);
    process.exit(0);
  })
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
