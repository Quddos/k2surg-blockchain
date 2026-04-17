import { NextResponse } from "next/server";
import { buildContract, CONTRACT_ADDRESS } from "../../../lib/contractHelpers.js";

export const runtime = "nodejs";

export async function GET() {
  try {
    const rewardContract = buildContract();
    const rewardThreshold = await rewardContract.REWARD_THRESHOLD();
    const rewardNFT = await rewardContract.rewardNFT();

    return NextResponse.json({
      status: "ok",
      contractAddress: CONTRACT_ADDRESS,
      rewardThreshold: rewardThreshold.toString(),
      rewardNFT,
    });
  } catch (error) {
    console.error("status handler failed:", error);
    return NextResponse.json(
      { error: error?.message || "Unable to verify contract status." },
      { status: 500 }
    );
  }
}

export function OPTIONS() {
  return NextResponse.json(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
