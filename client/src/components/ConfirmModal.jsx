import { AlertTriangle } from "lucide-react";
import "./ConfirmModal.css";

export default function ConfirmModal({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-box glass-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          <AlertTriangle size={22} />
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
