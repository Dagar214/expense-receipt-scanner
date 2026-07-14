import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Wallet, Receipt as ReceiptIcon, Tag, ScanLine, ArrowUpRight } from "lucide-react";
import { getOverview, getTrend, resolveImageUrl } from "../api/api";
import StatCard from "../components/StatCard";
import CategoryBadge from "../components/CategoryBadge";
import "../components/StatCard.css";
import "./Dashboard.css";

export default function Dashboard() {
  const [overview, setOverview] = useState(null);
  const [trend, setTrend] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [ov, tr] = await Promise.all([getOverview(), getTrend(6)]);
        setOverview(ov.data);
        setTrend(tr.data);
      } catch (err) {
        setError("Could not load dashboard data. Is the backend server running?");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your spending overview at a glance.</p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          <ScanLine size={17} />
          Scan a Receipt
        </Link>
      </div>

      {error && <div className="card error-banner">{error}</div>}

      <div className="stat-grid">
        <StatCard
          icon={Wallet}
          label="This Month"
          value={loading ? "…" : `₹${(overview?.totalThisMonth || 0).toLocaleString()}`}
          accent="#6366f1"
          sub="Total spent so far"
        />
        <StatCard
          icon={ReceiptIcon}
          label="Total Records"
          value={loading ? "…" : overview?.totalReceipts ?? 0}
          accent="#2dd4bf"
          sub="Expenses tracked"
        />
        <StatCard
          icon={Tag}
          label="Top Category"
          value={loading ? "…" : overview?.topCategory || "N/A"}
          accent="#fbbf24"
          sub="Highest spend this month"
        />
      </div>

      <div className="dashboard-grid">
        <div className="card chart-card">
          <div className="card-title-row">
            <h3>Spending Trend</h3>
            <span className="muted-text">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.55} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="label" stroke="#8b93a7" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#8b93a7" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "#131829",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 10,
                  color: "#f4f5f9",
                }}
                formatter={(value) => [`₹${value.toLocaleString()}`, "Spent"]}
              />
              <Area type="monotone" dataKey="total" stroke="#818cf8" strokeWidth={2.5} fill="url(#trendFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card recent-card">
          <div className="card-title-row">
            <h3>Recent Expenses</h3>
            <Link to="/expenses" className="link-more">
              View all <ArrowUpRight size={14} />
            </Link>
          </div>

          {(!overview?.recent || overview.recent.length === 0) && !loading && (
            <div className="empty-state small">
              <p>No expenses yet. Upload a receipt to get started.</p>
            </div>
          )}

          <div className="recent-list">
            {overview?.recent?.map((exp) => (
              <Link to={`/expenses/${exp._id}`} key={exp._id} className="recent-item">
                <div className="recent-item-thumb">
                  {exp.receipt?.image ? (
                    <img src={resolveImageUrl(exp.receipt.image)} alt={exp.description} />
                  ) : (
                    <ReceiptIcon size={18} />
                  )}
                </div>
                <div className="recent-item-body">
                  <p className="recent-item-title">{exp.description || "Expense"}</p>
                  <CategoryBadge category={exp.category} />
                </div>
                <div className="recent-item-amount">₹{exp.amount.toLocaleString()}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
