const express = require("express");
const router = express.Router();
const Expense = require("../models/Expense");

// @route   GET /api/expenses
// @desc    Get all expenses, optional filters: ?category=&month=&year=&search=
router.get("/", async (req, res) => {
  try {
    const { category, month, year, search } = req.query;
    const filter = {};

    if (category && category !== "All") filter.category = category;

    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: start, $lt: end };
    } else if (year) {
      const start = new Date(Number(year), 0, 1);
      const end = new Date(Number(year) + 1, 0, 1);
      filter.date = { $gte: start, $lt: end };
    }

    if (search) {
      filter.description = { $regex: search, $options: "i" };
    }

    const expenses = await Expense.find(filter)
      .populate("receipt")
      .sort({ date: -1, createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expenses", error: error.message });
  }
});

// @route   GET /api/expenses/:id
router.get("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id).populate("receipt");
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch expense", error: error.message });
  }
});

// @route   POST /api/expenses
// @desc    Create a manual expense (not from a receipt)
router.post("/", async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    if (amount === undefined) {
      return res.status(400).json({ message: "Amount is required" });
    }
    const expense = await Expense.create({
      amount: Number(amount),
      category: category || "Others",
      description: description || "",
      date: date ? new Date(date) : new Date(),
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: "Failed to create expense", error: error.message });
  }
});

// @route   PUT /api/expenses/:id
router.put("/:id", async (req, res) => {
  try {
    const { amount, category, description, date } = req.body;
    const update = {};
    if (amount !== undefined) update.amount = Number(amount);
    if (category !== undefined) update.category = category;
    if (description !== undefined) update.description = description;
    if (date !== undefined) update.date = new Date(date);

    const expense = await Expense.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ message: "Failed to update expense", error: error.message });
  }
});

// @route   DELETE /api/expenses/:id
router.delete("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    await expense.deleteOne();
    res.json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete expense", error: error.message });
  }
});

module.exports = router;
