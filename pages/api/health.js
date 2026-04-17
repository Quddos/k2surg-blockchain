export default function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Only GET is allowed" });
  }

  return res.status(200).json({ status: "ok" });
}
