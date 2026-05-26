const Budget = require('../models/Budget');
const Transaction = require('../models/Transaction');

// @desc    Get budget for a month
// @route   GET /api/budget?month=YYYY-MM
// @access  Private
const getBudget = async (req, res, next) => {
  try {
    const now = new Date();
    const month =
      req.query.month ||
      `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const budget = await Budget.findOne({ userId: req.user._id, month });

    // Get actual spending for this month
    const [year, mon] = month.split('-').map(Number);
    const startDate = new Date(year, mon - 1, 1);
    const endDate   = new Date(year, mon, 0, 23, 59, 59, 999);

    const spending = await Transaction.aggregate([
      {
        $match: {
          userId:  req.user._id,
          type:    'expense',
          date:    { $gte: startDate, $lte: endDate },
        },
      },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    const totalSpent = spending[0]?.total || 0;

    res.json({
      success: true,
      data: {
        budget:     budget || null,
        totalSpent,
        remaining:  budget ? budget.amount - totalSpent : null,
        percentage: budget ? Math.min(100, (totalSpent / budget.amount) * 100) : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create or update budget
// @route   POST /api/budget
// @access  Private
const setBudget = async (req, res, next) => {
  try {
    const { month, amount, categoryBudgets } = req.body;

    if (!month || !amount) {
      return res.status(400).json({ success: false, message: 'Month and amount are required' });
    }

    if (amount <= 0) {
      return res.status(400).json({ success: false, message: 'Budget amount must be positive' });
    }

    const budget = await Budget.findOneAndUpdate(
      { userId: req.user._id, month },
      { userId: req.user._id, month, amount, categoryBudgets: categoryBudgets || [] },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(201).json({
      success: true,
      message: 'Budget set successfully!',
      data: budget,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update budget
// @route   PUT /api/budget/:id
// @access  Private
const updateBudget = async (req, res, next) => {
  try {
    const { amount, categoryBudgets } = req.body;

    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { amount, categoryBudgets },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ success: false, message: 'Budget not found' });
    }

    res.json({ success: true, message: 'Budget updated!', data: budget });
  } catch (error) {
    next(error);
  }
};

// @desc    Get budgets for last 6 months
// @route   GET /api/budget/history
// @access  Private
const getBudgetHistory = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id }).sort({ month: -1 }).limit(6);
    res.json({ success: true, data: budgets });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBudget, setBudget, updateBudget, getBudgetHistory };
