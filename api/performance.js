import { buildContract } from "./contractHelpers.js";

export const config = {
  runtime: "nodejs18.x",
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
    const rewardContract = buildContract();
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
