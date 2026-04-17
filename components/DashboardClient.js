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

function formatError(error) {
  return error?.message || "Unable to load data.";
}

export default function DashboardClient() {
  const [status, setStatus] = useState(null);
  const [health, setHealth] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJson(path) {
      const response = await fetch(path);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} ${text || response.statusText}`);
      }
      return response.json();
    }

    async function loadData() {
      setLoading(true);
      const nextErrors = {};

      try {
        setStatus(await fetchJson("/api/status"));
      } catch (error) {
        nextErrors.status = formatError(error);
      }

      try {
        setHealth(await fetchJson("/api/health"));
      } catch (error) {
        nextErrors.health = formatError(error);
      }

      try {
        setPerformance(await fetchJson("/api/performance"));
      } catch (error) {
        nextErrors.performance = formatError(error);
      }

      setErrors(nextErrors);
      setLoading(false);
    }

    loadData();
  }, []);

  return (
    <main className="page-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">K2Surg Dashboard</p>
          <h1>Blockchain status with live contract checks</h1>
          <p className="subtitle">
            Verify contract health, read the deployed reward contract state, and watch performance data all from a modern dashboard.
          </p>
        </div>
      </section>

      <div className="grid">
        <article className="panel card-animate">
          <h2>Contract Status</h2>
          {loading ? (
            <p className="muted">Loading contract status…</p>
          ) : errors.status ? (
            <p className="error">{errors.status}</p>
          ) : (
            <div className="field-list">
              <div>
                <span>Address</span>
                <strong>{status?.contractAddress || "Not available"}</strong>
              </div>
              <div>
                <span>Reward Threshold</span>
                <strong>{status?.rewardThreshold || "N/A"}</strong>
              </div>
              <div>
                <span>Reward NFT</span>
                <strong>{status?.rewardNFT || "N/A"}</strong>
              </div>
            </div>
          )}
        </article>

        <article className="panel card-animate">
          <h2>Health Check</h2>
          {loading ? (
            <p className="muted">Checking system health…</p>
          ) : errors.health ? (
            <p className="error">{errors.health}</p>
          ) : (
            <p className="status-pill">{health?.status || "Unknown"}</p>
          )}
        </article>

        <article className="panel card-animate">
          <h2>Performance Data</h2>
          {loading ? (
            <p className="muted">Fetching performance metrics…</p>
          ) : errors.performance ? (
            <p className="error">{errors.performance}</p>
          ) : performance.length > 0 ? (
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={performance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="timestamp" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155" }} />
                  <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                  <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="muted">No performance data available yet.</p>
          )}
        </article>
      </div>

      <section className="panel card-animate">
        <h2>Additional details</h2>
        <p>This dashboard displays real-time data from your K2Surg blockchain contracts.</p>
        <p>
          <strong>Contract Address:</strong> {status?.contractAddress || "Not available"}
        </p>
      </section>

      <style jsx>{`
        .page-shell {
          min-height: 100vh;
          padding: 48px 24px;
          color: #e2e8f0;
          font-family: Inter, system-ui, sans-serif;
          background: radial-gradient(circle at top, rgba(99, 102, 241, 0.18), transparent 28%),
            linear-gradient(180deg, #020617 0%, #0f172a 100%);
        }

        .hero-card {
          max-width: 960px;
          margin: 0 auto 32px;
          padding: 32px;
          border-radius: 28px;
          background: rgba(15, 23, 42, 0.92);
          border: 1px solid rgba(148, 163, 184, 0.12);
          box-shadow: 0 28px 80px rgba(15, 23, 42, 0.35);
          animation: fadeInUp 0.6s ease both;
        }

        .eyebrow {
          display: inline-flex;
          margin-bottom: 12px;
          color: #c7d2fe;
          font-size: 0.9rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 700;
        }

        h1 {
          margin: 0 0 16px;
          font-size: clamp(2rem, 3vw, 3rem);
          line-height: 1.05;
        }

        .subtitle {
          margin: 0;
          max-width: 760px;
          color: #cbd5e1;
          line-height: 1.75;
        }

        .grid {
          display: grid;
          gap: 24px;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          max-width: 1200px;
          margin: 0 auto 24px;
        }

        .panel {
          padding: 28px;
          border-radius: 24px;
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid rgba(148, 163, 184, 0.08);
          box-shadow: 0 16px 40px rgba(15, 23, 42, 0.22);
        }

        .panel h2 {
          margin: 0 0 18px;
          color: #f8fafc;
          font-size: 1.15rem;
        }

        .field-list {
          display: grid;
          gap: 14px;
        }

        .field-list div {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          font-size: 0.96rem;
          color: #cbd5e1;
        }

        .field-list strong {
          color: #f8fafc;
          word-break: break-word;
          max-width: 52%;
        }

        .status-pill {
          display: inline-flex;
          padding: 8px 16px;
          border-radius: 999px;
          background: #111827;
          color: #d1fae5;
          border: 1px solid rgba(34, 197, 94, 0.25);
          font-weight: 600;
        }

        .muted {
          color: #94a3b8;
        }

        .error {
          color: #fecaca;
          background: rgba(248, 113, 113, 0.12);
          padding: 14px 16px;
          border-radius: 16px;
          border: 1px solid rgba(248, 113, 113, 0.18);
        }

        .chart-wrap {
          min-height: 260px;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(18px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-animate {
          animation: fadeInUp 0.5s ease both;
        }

        .card-animate:nth-child(2) {
          animation-delay: 0.08s;
        }

        .card-animate:nth-child(3) {
          animation-delay: 0.16s;
        }

        .card-animate:nth-child(4) {
          animation-delay: 0.24s;
        }

        @media (max-width: 640px) {
          .page-shell {
            padding: 32px 16px;
          }

          .hero-card {
            padding: 24px;
          }
        }
      `}</style>
    </main>
  );
}
