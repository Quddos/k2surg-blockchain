export const config = {
  runtime: "nodejs18.x",
};

export default function handler(req, res) {
  res.status(200).json({ status: "ok" });
}
