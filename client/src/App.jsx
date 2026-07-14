import { Routes, Route } from "react-router-dom";
import Background from "./components/Background";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import UploadReceipt from "./pages/UploadReceipt";
import ExpenseList from "./pages/ExpenseList";
import ExpenseDetails from "./pages/ExpenseDetails";
import MonthlySummary from "./pages/MonthlySummary";

export default function App() {
  return (
    <>
      <Background />
      <div className="app-shell">
        <Sidebar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/upload" element={<UploadReceipt />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/expenses/:id" element={<ExpenseDetails />} />
            <Route path="/summary" element={<MonthlySummary />} />
          </Routes>
        </main>
      </div>
    </>
  );
}
