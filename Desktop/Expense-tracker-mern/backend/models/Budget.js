const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    month: {
      // Format: "YYYY-MM" e.g. "2024-01"
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month format must be YYYY-MM'],
    },
    amount: {
      type: Number,
      required: [true, 'Budget amount is required'],
      min: [1, 'Budget must be at least 1'],
    },
    // Category-wise budgets (optional)
    categoryBudgets: [
      {
        category: String,
        amount: Number,
      },
    ],
  },
  { timestamps: true }
);

// One budget per user per month
budgetSchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);
