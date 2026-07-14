import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Trash2, Save, Receipt as ReceiptIcon } from "lucide-react";
import {
  getExpense,
  updateExpense,
  updateReceipt,
  deleteExpense,
  deleteReceipt,
  resolveImageUrl,
} from "../api/api";
import { CATEGORIES } from "../utils/categories";
import ConfirmModal from "../components/ConfirmModal";
import "./ExpenseDetails.css";

export default function ExpenseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [expense, setExpense] = useState(null);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getExpense(id);
        setExpense(res.data);
        setForm({
          storeName: res.data.receipt?.storeName || "",
          description: res.data.description || "",
          amount: res.data.amount,
          tax: res.data.receipt?.tax ?? 0,
          date: new Date(res.data.date).toISOString().slice(0, 10),
          category: res.data.category,
        });
      } catch (err) {
        setError("Could not load this expense.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      if (expense.receipt) {
        await updateReceipt(expense.receipt._id, {
          storeName: form.storeName,
          amount: form.amount,
          tax: form.tax,
          date: form.date,
          category: form.category,
          description: form.description,
        });
      } else {
        await updateExpense(expense._id, {
          amount: form.amount,
          category: form.category,
          date: form.date,
          description: form.description,
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      if (expense.receipt) {
        await deleteReceipt(expense.receipt._id);
      } else {
        await deleteExpense(expense._id);
      }
      navigate("/expenses");
    } catch (err) {
      setError("Failed to delete this expense.");
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="empty-state">Loading…</div>;
  }

  if (!expense || !form) {
    return (
      <div className="empty-state">
        <p>{error || "Expense not found."}</p>
        <Link to="/expenses" className="btn btn-secondary" style={{ marginTop: 16 }}>
          Back to Expense List
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/expenses" className="back-link">
            <ArrowLeft size={15} /> Back to Expense List
          </Link>
          <h1 style={{ marginTop: 10 }}>Expense Details</h1>
        </div>
        <button className="btn btn-danger" onClick={() => setConfirmOpen(true)}>
          <Trash2 size={16} />
          Delete
        </button>
      </div>

      {error && <div className="card error-banner">{error}</div>}

      <div className="details-grid">
        <div className="card">
          <h3 className="section-title">Receipt Image</h3>
          {expense.receipt?.image ? (
            <div className="details-image-wrap">
              <img src={resolveImageUrl(expense.receipt.image)} alt={form.storeName} />
            </div>
          ) : (
            <div className="empty-state small">
              <ReceiptIcon size={26} style={{ marginBottom: 8, opacity: 0.5 }} />
              <p>No receipt image attached to this expense.</p>
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="section-title">Edit Details</h3>
          <div className="receipt-form">
            {expense.receipt && (
              <div>
                <label className="field-label">Store Name</label>
                <input
                  className="input"
                  name="storeName"
                  value={form.storeName}
                  onChange={handleChange}
                />
              </div>
            )}

            <div>
              <label className="field-label">Description</label>
              <input
                className="input"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="What was this expense for?"
              />
            </div>

            <div className="form-row">
              <div>
                <label className="field-label">Amount (₹)</label>
                <input
                  className="input"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.amount}
                  onChange={handleChange}
                />
              </div>
              {expense.receipt && (
                <div>
                  <label className="field-label">Tax (₹)</label>
                  <input
                    className="input"
                    name="tax"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.tax}
                    onChange={handleChange}
                  />
                </div>
              )}
            </div>

            <div className="form-row">
              <div>
                <label className="field-label">Date</label>
                <input
                  className="input"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="field-label">Category</label>
                <select
                  className="input select"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button className="btn btn-primary full-width" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" /> : (
                <>
                  <Save size={16} />
                  {saved ? "Saved!" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Delete this expense?"
        message="This will permanently remove the expense and its linked receipt image. This cannot be undone."
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
