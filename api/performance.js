import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const { RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS } = process.env;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  throw new Error(
    "Missing required environment variables: RPC_URL, PRIVATE_KEY, CONTRACT_ADDRESS"
  );
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const artifactPath = path.join(__dirname, "..", "abis", "K2SurgReward.json");
const rewardAbi = JSON.parse(readFileSync(artifactPath, "utf-8"));

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const rewardContract = new ethers.Contract(CONTRACT_ADDRESS, rewardAbi, signer);

export const config = {
  runtime: "nodejs",
};

const setCorsHeaders = (res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
};

export default async function handler(req, res) {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST is allowed" });
  }

  const { score, transfers, penalties } = req.body ?? {};

  if (
    typeof score !== "number" ||
    typeof transfers !== "number" ||
    typeof penalties !== "number"
  ) {
    return res.status(400).json({
      error: "Request body must include numeric score, transfers, and penalties.",
    });
  }

  try {
    const tx = await rewardContract.recordPerformance(score, transfers, penalties);
    const receipt = await tx.wait();

    const parsedEvent = receipt.logs
      .map((log) => {
        try {
          return rewardContract.interface.parseLog(log);
        } catch {
          return null;
        }
      })
      .find((parsed) => parsed && parsed.name === "PerformanceRecorded");

    const event = parsedEvent?.args
      ? {
          user: parsedEvent.args.user,
          score: parsedEvent.args.score.toString(),
          minted: parsedEvent.args.minted,
        }
      : null;

    return res.status(200).json({
      txHash: receipt.transactionHash ?? tx.hash,
      event,
      blockNumber: receipt.blockNumber,
    });
  } catch (error) {
    console.error("recordPerformance failed:", error);
    return res
      .status(500)
      .json({ error: error?.message || "Contract call failed." });
  }
}
