const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// @route   GET /api/summary/monthly?year=2026&month=7
// @desc    Category breakdown + total for a specific month
router.get("/monthly", async (req, res) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const month = Number(req.query.month) || now.getMonth() + 1;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const expenses = await Expense.find({ date: { $gte: start, $lt: end } });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);

    const byCategory = {};
    expenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const categoryBreakdown = Object.entries(byCategory).map(
      ([category, amount]) => ({ category, amount })
    );

    res.json({
      year,
      month,
      total,
      count: expenses.length,
      categoryBreakdown,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to build summary", error: error.message });
  }
});

// @route   GET /api/summary/trend?months=6
// @desc    Monthly totals for the last N months (for dashboard trend chart)
router.get("/trend", async (req, res) => {
  try {
    const months = Number(req.query.months) || 6;
    const now = new Date();
    const results = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      const expenses = await Expense.find({ date: { $gte: start, $lt: end } });
      const total = expenses.reduce((sum, e) => sum + e.amount, 0);

      results.push({
        label: start.toLocaleString("default", { month: "short", year: "2-digit" }),
        year: start.getFullYear(),
        month: start.getMonth() + 1,
        total,
      });
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Failed to build trend", error: error.message });
  }
});

// @route   GET /api/summary/overview
// @desc    Quick stats for the dashboard
router.get("/overview", async (req, res) => {
  try {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const monthExpenses = await Expense.find({ date: { $gte: start, $lt: end } });
    const totalThisMonth = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    const totalReceipts = await Expense.countDocuments();

    const byCategory = {};
    monthExpenses.forEach((e) => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });
    let topCategory = "N/A";
    let topAmount = 0;
    Object.entries(byCategory).forEach(([cat, amt]) => {
      if (amt > topAmount) {
        topAmount = amt;
        topCategory = cat;
      }
    });

    const recent = await Expense.find()
      .populate("receipt")
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    res.json({
      totalThisMonth,
      totalReceipts,
      topCategory,
      recent,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to build overview", error: error.message });
  }
});

module.exports = router;
