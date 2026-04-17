import "dotenv/config";
import { network } from "hardhat";
import { ethers as ethersPkg } from "ethers";

async function main() {
  const connection = await network.connect();
  const ethers = connection.ethers;

  let signer;
  if (process.env.PRIVATE_KEY) {
    signer = new ethersPkg.Wallet(process.env.PRIVATE_KEY, ethers.provider);
  } else if (ethers.getSigners) {
    const signers = await ethers.getSigners();
    signer = signers[0];
  } else {
    throw new Error("No signer available. Set PRIVATE_KEY in your .env file.");
  }

  console.log("Signer address:", await signer.getAddress());

  const NFT = await ethers.getContractFactory("K2SurgRewardNFT", signer);
  const nft = await NFT.deploy();
  await nft.waitForDeployment();
  console.log("K2SurgRewardNFT deployed to:", await nft.getAddress());

  const Reward = await ethers.getContractFactory("K2SurgReward", signer);
  const reward = await Reward.deploy(await nft.getAddress());
  await reward.waitForDeployment();
  console.log("K2SurgReward deployed to:", await reward.getAddress());

  const transferTx = await nft.transferOwnership(await reward.getAddress());
  await transferTx.wait();
  console.log("Transferred NFT ownership to Reward contract");

  const score = 260;
  const performanceTx = await reward.recordPerformance(score, 5, 1);
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