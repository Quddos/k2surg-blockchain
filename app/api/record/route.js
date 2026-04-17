import { NextResponse } from "next/server";
import { buildContract } from "../../../lib/contractHelpers.js";

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

export const runtime = "nodejs";

export function OPTIONS() {
  return NextResponse.json(null, { status: 204, headers });
}

export function GET() {
  return NextResponse.json([], { headers });
}

export async function POST(request) {
  try {
    const { score, transfers, penalties } = await request.json();

    if (
      typeof score !== "number" ||
      typeof transfers !== "number" ||
      typeof penalties !== "number"
    ) {
      return NextResponse.json(
        {
          error: "Request body must include numeric score, transfers, and penalties.",
        },
        { status: 400, headers }
      );
    }

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

    return NextResponse.json(
      {
        txHash: receipt.transactionHash ?? tx.hash,
        event,
        blockNumber: receipt.blockNumber,
      },
      { headers }
    );
  } catch (error) {
    console.error("recordPerformance failed:", error);
    return NextResponse.json(
      { error: error?.message || "Contract call failed." },
      { status: 500, headers }
    );
  }
}
