const { validationResult } = require('express-validator');
const Transaction = require('../models/Transaction');

// @desc    Get all transactions (with filters, search, pagination)
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 10,
      sortBy = 'date',
      order = 'desc',
    } = req.query;

    // Build query
    const query = { userId: req.user._id };

    if (type && ['income', 'expense'].includes(type)) query.type = type;
    if (category) query.category = category;
    if (search) query.title = { $regex: search, $options: 'i' };
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Sort
    const sortOrder = order === 'asc' ? 1 : -1;
    const sortField = ['date', 'amount', 'title', 'createdAt'].includes(sortBy) ? sortBy : 'date';

    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Transaction.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private
const createTransaction = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { title, amount, type, category, date, note } = req.body;

    const transaction = await Transaction.create({
      userId: req.user._id,
      title,
      amount: parseFloat(amount),
      type,
      category,
      date: date || new Date(),
      note,
    });

    res.status(201).json({
      success: true,
      message: 'Transaction added successfully!',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    const { title, amount, type, category, date, note } = req.body;

    if (title !== undefined)    transaction.title    = title;
    if (amount !== undefined)   transaction.amount   = parseFloat(amount);
    if (type !== undefined)     transaction.type     = type;
    if (category !== undefined) transaction.category = category;
    if (date !== undefined)     transaction.date     = date;
    if (note !== undefined)     transaction.note     = note;

    await transaction.save();

    res.json({
      success: true,
      message: 'Transaction updated successfully!',
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    res.json({ success: true, message: 'Transaction deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary
// @route   GET /api/transactions/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const now = new Date();
    const targetYear  = parseInt(year)  || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;

    const startOfMonth = new Date(targetYear, targetMonth - 1, 1);
    const endOfMonth   = new Date(targetYear, targetMonth, 0, 23, 59, 59, 999);

    // Monthly aggregation
    const monthlyData = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    // All-time totals
    const allTimeData = await Transaction.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$type', total: { $sum: '$amount' } } },
    ]);

    // Category breakdown (monthly expenses)
    const categoryData = await Transaction.aggregate([
      { $match: { userId: req.user._id, type: 'expense', date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    // Last 6 months trend
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTrend = await Transaction.aggregate([
      { $match: { userId: req.user._id, date: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year:  { $year: '$date' },
            month: { $month: '$date' },
            type:  '$type',
          },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Recent transactions
    const recentTransactions = await Transaction.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    // Calculate totals
    const getTotal = (data, type) => data.find((d) => d._id === type)?.total || 0;

    const monthlyIncome  = getTotal(monthlyData, 'income');
    const monthlyExpense = getTotal(monthlyData, 'expense');
    const allTimeIncome  = getTotal(allTimeData,  'income');
    const allTimeExpense = getTotal(allTimeData,  'expense');

    res.json({
      success: true,
      data: {
        monthly: {
          income:  monthlyIncome,
          expense: monthlyExpense,
          savings: monthlyIncome - monthlyExpense,
          balance: allTimeIncome - allTimeExpense,
        },
        allTime: {
          income:  allTimeIncome,
          expense: allTimeExpense,
          balance: allTimeIncome - allTimeExpense,
        },
        categoryBreakdown: categoryData,
        monthlyTrend,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
};
