const hre = require("hardhat");

async function main() {
  // Deploy Reward Contract
  const Reward = await hre.ethers.getContractFactory("K2SurgReward");
  const reward = await Reward.deploy();
  await reward.waitForDeployment();

  console.log("K2SurgReward deployed to:", await reward.getAddress());

  // Deploy NFT Contract
  const NFT = await hre.ethers.getContractFactory("K2SurgRewardNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();

  console.log("K2SurgRewardNFT deployed to:", await nft.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});