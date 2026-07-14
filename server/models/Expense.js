const mongoose = require("mongoose");

const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
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
    description: {
      type: String,
      default: "",
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    receipt: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Receipt",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", expenseSchema);
