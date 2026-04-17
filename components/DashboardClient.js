"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DashboardClient() {
  const [status, setStatus] = useState(null);
  const [health, setHealth] = useState(null);
  const [performance, setPerformance] = useState([]);

  useEffect(() => {
    fetch("/api/status")
      .then((res) => res.json())
      .then((data) => setStatus(data))
      .catch((err) => console.error(err));

    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) => console.error(err));

    fetch("/api/performance")
      .then((res) => res.json())
      .then((data) => setPerformance(data || []))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>K2Surg Blockchain Dashboard</h1>

      <div style={{ marginBottom: "20px" }}>
        <h2>Contract Status</h2>
        {status ? (
          <div>
            <p>
              <strong>Contract Address:</strong> {status.contractAddress}
            </p>
            <p>
              <strong>Reward Threshold:</strong> {status.rewardThreshold}
            </p>
            <p>
              <strong>Reward NFT:</strong> {status.rewardNFT}
            </p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Health Check</h2>
        {health ? <p>Status: {health.status}</p> : <p>Loading...</p>}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h2>Performance Data</h2>
        {performance.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p>No performance data available</p>
        )}
      </div>

      <div>
        <h2>Additional Details</h2>
        <p>This dashboard displays real-time data from your K2Surg blockchain contracts.</p>
        <p>Contract Address: {status?.contractAddress || "Not available"}</p>
      </div>
    </div>
  );
}
