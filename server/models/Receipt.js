const mongoose = require("mongoose");

const receiptSchema = new mongoose.Schema(
  {
    image: {
      type: String, // path/URL to stored image e.g. /uploads/xyz.jpg
      required: true,
    },
    storeName: {
      type: String,
      default: "Unknown Store",
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    tax: {
      type: Number,
      default: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    category: {
      type: String,
      enum: [
        "Food & Dining",
        "Groceries",
        "Travel",
        "Shopping",
        "Utilities & Bills",
        "Entertainment",
        "Health",
        "Others",
      ],
      default: "Others",
    },
    rawText: {
      type: String,
      default: "",
    },
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expense",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Receipt", receiptSchema);
