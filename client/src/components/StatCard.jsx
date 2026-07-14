export default function StatCard({ icon: Icon, label, value, accent = "#6366f1", sub }) {
  return (
    <div className="card stat-card">
      <div className="stat-card-top">
        <div
          className="stat-card-icon"
          style={{ background: `${accent}22`, color: accent }}
        >
          <Icon size={20} strokeWidth={2.2} />
        </div>
      </div>
      <p className="stat-card-label">{label}</p>
      <h3 className="stat-card-value">{value}</h3>
      {sub && <p className="stat-card-sub">{sub}</p>}
    </div>
  );
}
