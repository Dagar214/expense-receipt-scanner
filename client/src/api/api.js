import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Derive the server's root origin (without /api) to resolve receipt image URLs
export const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");

export const resolveImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${SERVER_ORIGIN}${imagePath}`;
};

// ---------- Receipts ----------
export const uploadReceipt = (formData) =>
  api.post("/receipts", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getReceipts = () => api.get("/receipts");
export const getReceipt = (id) => api.get(`/receipts/${id}`);
export const updateReceipt = (id, data) => api.put(`/receipts/${id}`, data);
export const deleteReceipt = (id) => api.delete(`/receipts/${id}`);

// ---------- Expenses ----------
export const getExpenses = (params) => api.get("/expenses", { params });
export const getExpense = (id) => api.get(`/expenses/${id}`);
export const createExpense = (data) => api.post("/expenses", data);
export const updateExpense = (id, data) => api.put(`/expenses/${id}`, data);
export const deleteExpense = (id) => api.delete(`/expenses/${id}`);

// ---------- Summary ----------
export const getMonthlySummary = (year, month) =>
  api.get("/summary/monthly", { params: { year, month } });
export const getTrend = (months = 6) =>
  api.get("/summary/trend", { params: { months } });
export const getOverview = () => api.get("/summary/overview");

export default api;
