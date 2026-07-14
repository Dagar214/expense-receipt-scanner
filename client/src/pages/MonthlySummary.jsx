import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import { ChevronLeft, ChevronRight, Wallet, Tag } from "lucide-react";
import { getMonthlySummary } from "../api/api";
import { CATEGORY_COLORS } from "../utils/categories";
import StatCard from "../components/StatCard";
import "../components/StatCard.css";
import "./MonthlySummary.css";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function MonthlySummary() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getMonthlySummary(year, month);
        setSummary(res.data);
        setError("");
      } catch (err) {
        setError("Could not load monthly summary.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [year, month]);

  const shiftMonth = (delta) => {
    let m = month + delta;
    let y = year;
    if (m > 12) {
      m = 1;
      y += 1;
    } else if (m < 1) {
      m = 12;
      y -= 1;
    }
    setMonth(m);
    setYear(y);
  };

  const pieData =
    summary?.categoryBreakdown?.map((c) => ({
      name: c.category,
      value: c.amount,
    })) || [];

  const topCategory = pieData.reduce(
    (top, c) => (c.value > (top?.value || 0) ? c : top),
    null
  );

  const RADIAN = Math.PI / 180;
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    // Skip tiny slivers to avoid cramped/overlapping text
    if (percent < 0.04) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill="#ffffff"
        stroke="rgba(0,0,0,0.65)"
        strokeWidth={4}
        paintOrder="stroke"
      >
        {`${Math.round(percent * 100)}%`}
      </text>
    );
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Monthly Summary</h1>
          <p>Category breakdown and totals for the selected month.</p>
        </div>
        <div className="month-switcher">
          <button className="icon-btn" onClick={() => shiftMonth(-1)}>
            <ChevronLeft size={16} />
          </button>
          <span className="month-label">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button className="icon-btn" onClick={() => shiftMonth(1)}>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {error && <div className="card error-banner">{error}</div>}

      <div className="stat-grid">
        <StatCard
          icon={Wallet}
          label="Total Spent"
          value={loading ? "…" : `₹${(summary?.total || 0).toLocaleString()}`}
          accent="#6366f1"
          sub={`${summary?.count || 0} expense${summary?.count === 1 ? "" : "s"}`}
        />
        <StatCard
          icon={Tag}
          label="Top Category"
          value={loading ? "…" : topCategory?.name || "N/A"}
          accent="#fbbf24"
          sub={topCategory ? `₹${topCategory.value.toLocaleString()}` : "No data"}
        />
      </div>

      <div className="card summary-chart-card">
        <h3 className="section-title">Category Breakdown</h3>

        {!loading && pieData.length === 0 && (
          <div className="empty-state">
            <p>No expenses recorded for {MONTH_NAMES[month - 1]} {year}.</p>
          </div>
        )}

        {pieData.length > 0 && (
          <div className="summary-chart-layout">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={95}
                  paddingAngle={3}
                  label={renderPieLabel}
                  labelLine={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CATEGORY_COLORS[entry.name] || "#94a3b8"}
                      stroke="rgba(0,0,0,0.2)"
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "#ffffff",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 10,
                    color: "#111827",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  }}
                  itemStyle={{ color: "#111827", fontWeight: 600 }}
                  labelStyle={{ color: "#111827", fontWeight: 700 }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, "Spent"]}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="category-legend">
              {pieData
                .sort((a, b) => b.value - a.value)
                .map((c) => (
                  <div className="legend-row" key={c.name}>
                    <span
                      className="legend-dot"
                      style={{ background: CATEGORY_COLORS[c.name] || "#94a3b8" }}
                    />
                    <span className="legend-name">{c.name}</span>
                    <span className="legend-value">₹{c.value.toLocaleString()}</span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}