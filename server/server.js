require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const receiptRoutes = require("./routes/receipts");
const expenseRoutes = require("./routes/expenses");
const summaryRoutes = require("./routes/summary");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((o) => o.trim())
  : ["http://localhost:5173"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded receipt images statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// API routes
app.use("/api/receipts", receiptRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/summary", summaryRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Expense Receipt Scanner API is running" });
});

app.get("/", (req, res) => {
  res.send("Expense Receipt Scanner API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
