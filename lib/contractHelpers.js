import { readFileSync } from "fs";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const artifactPath = new URL("../abis/K2SurgReward.json", import.meta.url);

function loadAbi() {
  try {
    return JSON.parse(readFileSync(artifactPath, "utf-8"));
  } catch (error) {
    throw new Error(`Unable to load ABI from ${artifactPath}: ${error?.message || error}`);
  }
}

const rewardAbi = loadAbi();

function getRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function buildContract() {
  const RPC_URL = getRequiredEnv("RPC_URL");
  const PRIVATE_KEY = getRequiredEnv("PRIVATE_KEY");
  const CONTRACT_ADDRESS = getRequiredEnv("CONTRACT_ADDRESS");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const signer = new ethers.Wallet(PRIVATE_KEY, provider);
  return new ethers.Contract(CONTRACT_ADDRESS, rewardAbi, signer);
}

export { RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS, buildContract };