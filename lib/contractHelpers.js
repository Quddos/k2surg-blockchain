import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const { RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;

const artifactPath = path.join(process.cwd(), "abis", "K2SurgReward.json");
const rewardAbi = JSON.parse(readFileSync(artifactPath, "utf-8"));

function buildContract() {
  if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
    throw new Error(
      "Missing required environment variables. Set RPC_URL, PRIVATE_KEY, and CONTRACT_ADDRESS."
    );
  }

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, rewardAbi, signer);
}

export { RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS, buildContract };