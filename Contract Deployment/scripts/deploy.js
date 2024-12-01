const hre = require("hardhat");
async function main() {
  const MyContract = await hre.ethers.getContractFactory("MyContract");
  console.log("Deploying contract...");
  const myContract = await MyContract.deploy();
  console.log(myContract);
  console.log("Contract deployed to:", myContract.target);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  });
