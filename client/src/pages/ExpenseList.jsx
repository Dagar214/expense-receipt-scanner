import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, Trash2, Receipt as ReceiptIcon, ScanLine, Download } from "lucide-react";
import { getExpenses, deleteExpense, deleteReceipt, resolveImageUrl } from "../api/api";
import { CATEGORIES } from "../utils/categories";
import CategoryBadge from "../components/CategoryBadge";
import ConfirmModal from "../components/ConfirmModal";
import "./ExpenseList.css";

export default function ExpenseList() {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [confirmTarget, setConfirmTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const params = {};
      if (category !== "All") params.category = category;
      if (search.trim()) params.search = search.trim();
      const res = await getExpenses(params);
      setExpenses(res.data);
      setError("");
    } catch (err) {
      setError("Could not load expenses. Is the backend server running?");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, search]);

  const handleDeleteConfirmed = async () => {
    if (!confirmTarget) return;
    setDeleting(true);
    try {
      if (confirmTarget.receipt) {
        await deleteReceipt(confirmTarget.receipt._id);
      } else {
        await deleteExpense(confirmTarget._id);
      }
      setExpenses((prev) => prev.filter((e) => e._id !== confirmTarget._id));
      setConfirmTarget(null);
    } catch (err) {
      setError("Failed to delete expense.");
    } finally {
      setDeleting(false);
    }
  };

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const exportCSV = () => {
    if (expenses.length === 0) return;
    const header = ["Date", "Store / Description", "Category", "Amount", "Tax"];
    const rows = expenses.map((exp) => [
      new Date(exp.date).toLocaleDateString("en-IN"),
      `"${(exp.description || "Expense").replace(/"/g, '""')}"`,
      exp.category,
      exp.amount,
      exp.tax || 0,
    ]);
    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Expense List</h1>
          <p>{expenses.length} record{expenses.length !== 1 ? "s" : ""} · ₹{total.toLocaleString()} total</p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-secondary"
            onClick={exportCSV}
            disabled={expenses.length === 0}
            title="Export current list as CSV"
          >
            <Download size={17} />
            Export CSV
          </button>
          <Link to="/upload" className="btn btn-primary">
            <ScanLine size={17} />
            Scan a Receipt
          </Link>
        </div>
      </div>

      <div className="card filter-bar">
        <div className="search-box">
          <Search size={16} />
          <input
            className="input"
            placeholder="Search by description or store…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input select category-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="card error-banner">{error}</div>}

      <div className="card list-card">
        {loading && <div className="empty-state">Loading expenses…</div>}

        {!loading && expenses.length === 0 && (
          <div className="empty-state">
            <ReceiptIcon size={30} style={{ marginBottom: 10, opacity: 0.5 }} />
            <p>No expenses found. Try adjusting your filters, or scan a new receipt.</p>
          </div>
        )}

        {!loading &&
          expenses.map((exp) => (
            <div key={exp._id} className="expense-row">
              <Link to={`/expenses/${exp._id}`} className="expense-row-main">
                <div className="expense-thumb">
                  {exp.receipt?.image ? (
                    <img src={resolveImageUrl(exp.receipt.image)} alt={exp.description} />
                  ) : (
                    <ReceiptIcon size={18} />
                  )}
                </div>
                <div className="expense-info">
                  <p className="expense-title">{exp.description || "Expense"}</p>
                  <p className="expense-date">
                    {new Date(exp.date).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <CategoryBadge category={exp.category} />
              </Link>
              <div className="expense-row-right">
                <span className="expense-amount">₹{exp.amount.toLocaleString()}</span>
                <button
                  className="icon-btn"
                  title="Delete expense"
                  onClick={() => setConfirmTarget(exp)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
      </div>

      <ConfirmModal
        open={!!confirmTarget}
        title="Delete this expense?"
        message="This will permanently remove the expense and its linked receipt image. This cannot be undone."
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirmed}
        loading={deleting}
      />
    </div>
  );
}