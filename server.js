import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import { ethers } from "ethers";

dotenv.config();

const {
  RPC_URL,
  PRIVATE_KEY,
  CONTRACT_ADDRESS,
  PORT = 3001,
} = process.env;

if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
  console.error(
    "Missing required environment variables. Set RPC_URL, PRIVATE_KEY, and CONTRACT_ADDRESS."
  );
  process.exit(1);
}

const artifactPath = new URL(
  "./artifacts/contracts/K2SurgReward.sol/K2SurgReward.json",
  import.meta.url
);
const rewardJson = JSON.parse(fs.readFileSync(artifactPath, "utf-8"));
const rewardAbi = rewardJson.abi;

const provider = new ethers.JsonRpcProvider(RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);
const rewardContract = new ethers.Contract(CONTRACT_ADDRESS, rewardAbi, signer);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.get("/health", (req, res) => {
  res.json({ status: "ok", network: RPC_URL });
});

app.post("/api/performance", async (req, res) => {
  const { score, transfers, penalties } = req.body;

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

    res.json({
      txHash: receipt.transactionHash ?? tx.hash,
      event,
      blockNumber: receipt.blockNumber,
    });
  } catch (error) {
    console.error("recordPerformance failed:", error);
    res.status(500).json({ error: error?.message || "Contract call failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
