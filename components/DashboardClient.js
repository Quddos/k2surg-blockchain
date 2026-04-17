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
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [formData, setFormData] = useState({ score: 260, transfers: 5, penalties: 1 });

  const loadData = async () => {
    setLoading(true);
    const nextErrors = {};

    const fetchJson = async (path) => {
      const response = await fetch(path);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status} ${text || response.statusText}`);
      }
      return response.json();
    };

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
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmitPerformance = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitResult(null);

    try {
      const response = await fetch("/api/record", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          score: Number(formData.score),
          transfers: Number(formData.transfers),
          penalties: Number(formData.penalties),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setSubmitResult({ type: "error", data });
      } else {
        setSubmitResult({ type: "success", data });
        setFormData({ score: 260, transfers: 5, penalties: 1 });
        setTimeout(loadData, 2000);
      }
    } catch (error) {
      setSubmitResult({ type: "error", data: { error: error.message } });
    } finally {
      setSubmitting(false);
    }
  };

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
        <h2>Test Performance Recording</h2>
        <p className="muted" style={{ marginTop: 0 }}>Submit test performance data to the contract:</p>
        <form onSubmit={handleSubmitPerformance} className="form">
          <div className="form-group">
            <label>Score</label>
            <input
              type="number"
              value={formData.score}
              onChange={(e) => setFormData({ ...formData, score: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label>Transfers</label>
            <input
              type="number"
              value={formData.transfers}
              onChange={(e) => setFormData({ ...formData, transfers: e.target.value })}
              disabled={submitting}
            />
          </div>
          <div className="form-group">
            <label>Penalties</label>
            <input
              type="number"
              value={formData.penalties}
              onChange={(e) => setFormData({ ...formData, penalties: e.target.value })}
              disabled={submitting}
            />
          </div>
          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? "Submitting..." : "Submit Performance"}
          </button>
        </form>

        {submitResult && (
          <div className={`submit-result ${submitResult.type}`}>
            {submitResult.type === "success" ? (
              <>
                <p className="success-title">✓ Success!</p>
                <p className="tx-hash">TX: {submitResult.data.txHash?.slice(0, 20)}...</p>
                {submitResult.data.event && (
                  <p className="event-info">Minted: {submitResult.data.event.minted ? "Yes" : "No"}</p>
                )}
              </>
            ) : (
              <>
                <p className="error-title">✗ Failed</p>
                <p className="error-msg">{submitResult.data.error}</p>
              </>
            )}
          </div>
        )}
      </section>

      <section className="panel card-animate">
        <h2>Additional details</h2>
        <p>This dashboard displays real-time data from your K2Surg blockchain contracts. Use the form above to test the API.</p>
        <p>
          <strong>Contract Address:</strong> {status?.contractAddress || "Not available"}
        </p>
        <p className="muted" style={{ fontSize: "0.9rem", marginTop: "12px" }}>
          API Endpoints: <code>/api/health</code> • <code>/api/status</code> • <code>/api/record</code>
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
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
          margin-bottom: 24px;
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

        .form {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 16px;
          margin-bottom: 18px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          color: #cbd5e1;
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 6px;
        }

        .form-group input {
          background: #0f172a;
          border: 1px solid rgba(148, 163, 184, 0.12);
          color: #e2e8f0;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .form-group input:focus {
          outline: none;
          border-color: #818cf8;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.1);
        }

        .form-group input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .submit-btn {
          padding: 10px 18px;
          background: #818cf8;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .submit-btn:hover:not(:disabled) {
          background: #6366f1;
          box-shadow: 0 8px 20px rgba(129, 140, 248, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submit-result {
          margin-top: 16px;
          padding: 14px 16px;
          border-radius: 12px;
          border: 1px solid;
        }

        .submit-result.success {
          background: rgba(34, 197, 94, 0.12);
          border-color: rgba(34, 197, 94, 0.25);
        }

        .submit-result .success-title {
          color: #86efac;
          margin: 0 0 6px;
          font-weight: 600;
        }

        .submit-result.error {
          background: rgba(248, 113, 113, 0.12);
          border-color: rgba(248, 113, 113, 0.18);
        }

        .submit-result .error-title {
          color: #fecaca;
          margin: 0 0 6px;
          font-weight: 600;
        }

        .submit-result p {
          margin: 0;
          color: #cbd5e1;
          font-size: 0.9rem;
        }

        .tx-hash,
        .event-info {
          color: #94a3b8;
          font-family: monospace;
          font-size: 0.85rem;
        }

        code {
          background: rgba(99, 102, 241, 0.1);
          color: #c7d2fe;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
          font-size: 0.85rem;
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

          .form {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
