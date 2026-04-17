import { buildContract, RPC_URL, CONTRACT_ADDRESS } from "./contractHelpers.js";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET is allowed" });
  }

  try {
    const rewardContract = buildContract();
    const rewardThreshold = await rewardContract.REWARD_THRESHOLD();
    const rewardNFT = await rewardContract.rewardNFT();

    return res.status(200).json({
      status: "ok",
      contractAddress: CONTRACT_ADDRESS,
      rewardThreshold: rewardThreshold.toString(),
      rewardNFT,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ error: error?.message || "Unable to verify contract status." });
  }
}
