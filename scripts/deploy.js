import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const [deployer, player] = await ethers.getSigners();

  console.log("Deployer:", await deployer.getAddress());
  console.log("Player:", await player.getAddress());

  const NFT = await ethers.getContractFactory("K2SurgRewardNFT");
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  console.log("K2SurgRewardNFT deployed to:", await nft.getAddress());

  const Reward = await ethers.getContractFactory("K2SurgReward");
  const reward = await Reward.deploy(await nft.getAddress());
  await reward.waitForDeployment();
  console.log("K2SurgReward deployed to:", await reward.getAddress());

  const transferTx = await nft.transferOwnership(await reward.getAddress());
  await transferTx.wait();
  console.log("Transferred NFT ownership to Reward contract");

  const score = 260;
  const performanceTx = await reward.connect(player).recordPerformance(score, 5, 1);
  const performanceReceipt = await performanceTx.wait();
  console.log("recordPerformance tx:", performanceReceipt.transactionHash ?? performanceTx.hash);

  const mintedOwner = await nft.ownerOf(0);
  console.log("NFT #0 owner:", mintedOwner);
  const totalMinted = await nft.tokenCounter();
  console.log("NFT total minted:", totalMinted.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});