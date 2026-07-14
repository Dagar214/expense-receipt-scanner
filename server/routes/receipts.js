const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const Receipt = require("../models/Receipt");
const Expense = require("../models/Expense");
const upload = require("../middleware/upload");

// @route   POST /api/receipts
// @desc    Upload a receipt image + OCR extracted data, auto-create linked Expense
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Receipt image is required" });
    }

    const { storeName, amount, tax, date, category, rawText, description } =
      req.body;

    const imagePath = `/uploads/${req.file.filename}`;

    const receipt = await Receipt.create({
      image: imagePath,
      storeName: storeName || "Unknown Store",
      amount: Number(amount) || 0,
      tax: Number(tax) || 0,
      date: date ? new Date(date) : new Date(),
      category: category || "Others",
      rawText: rawText || "",
    });

    // Automatically create the linked expense record
    const expense = await Expense.create({
      amount: Number(amount) || 0,
      category: category || "Others",
      description: description || storeName || "Receipt expense",
      date: date ? new Date(date) : new Date(),
      receipt: receipt._id,
    });

    receipt.expense = expense._id;
    await receipt.save();

    res.status(201).json({ receipt, expense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to save receipt", error: error.message });
  }
});

// @route   GET /api/receipts
router.get("/", async (req, res) => {
  try {
    const receipts = await Receipt.find().sort({ date: -1, createdAt: -1 });
    res.json(receipts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch receipts", error: error.message });
  }
});

// @route   GET /api/receipts/:id
router.get("/:id", async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch receipt", error: error.message });
  }
});

// @route   PUT /api/receipts/:id
// @desc    Edit extracted data (also syncs linked expense)
router.put("/:id", async (req, res) => {
  try {
    const { storeName, amount, tax, date, category, description } = req.body;

    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    if (storeName !== undefined) receipt.storeName = storeName;
    if (amount !== undefined) receipt.amount = Number(amount);
    if (tax !== undefined) receipt.tax = Number(tax);
    if (date !== undefined) receipt.date = new Date(date);
    if (category !== undefined) receipt.category = category;

    await receipt.save();

    if (receipt.expense) {
      const expenseUpdate = {};
      if (amount !== undefined) expenseUpdate.amount = Number(amount);
      if (category !== undefined) expenseUpdate.category = category;
      if (date !== undefined) expenseUpdate.date = new Date(date);
      if (description !== undefined) expenseUpdate.description = description;
      await Expense.findByIdAndUpdate(receipt.expense, expenseUpdate);
    }

    res.json(receipt);
  } catch (error) {
    res.status(500).json({ message: "Failed to update receipt", error: error.message });
  }
});

// @route   DELETE /api/receipts/:id
router.delete("/:id", async (req, res) => {
  try {
    const receipt = await Receipt.findById(req.params.id);
    if (!receipt) return res.status(404).json({ message: "Receipt not found" });

    // remove image file from disk
    const imgPath = path.join(__dirname, "..", receipt.image);
    fs.unlink(imgPath, (err) => {
      if (err) console.warn("Could not delete image file:", err.message);
    });

    if (receipt.expense) {
      await Expense.findByIdAndDelete(receipt.expense);
    }

    await receipt.deleteOne();

    res.json({ message: "Receipt deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete receipt", error: error.message });
  }
});

module.exports = router;
