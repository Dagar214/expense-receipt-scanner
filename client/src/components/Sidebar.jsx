import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ScanLine,
  ListTree,
  PieChart,
  Receipt,
} from "lucide-react";
import "./Sidebar.css";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/upload", label: "Upload Receipt", icon: ScanLine },
  { to: "/expenses", label: "Expense List", icon: ListTree },
  { to: "/summary", label: "Monthly Summary", icon: PieChart },
];

export default function Sidebar() {
  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Receipt size={20} strokeWidth={2.4} />
        </div>
        <div>
          <h2>ReceiptIQ</h2>
          <p>Expense Scanner</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              "sidebar-link" + (isActive ? " active" : "")
            }
          >
            <Icon size={18} strokeWidth={2.1} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <p>Powered by OCR</p>
        <p className="sidebar-footer-sub">Tesseract.js · MongoDB</p>
      </div>
    </aside>
  );
}
