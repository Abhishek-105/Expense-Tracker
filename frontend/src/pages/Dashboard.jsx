import React, { useEffect, useState, useCallback } from 'react';
import { Plus, RefreshCw, Calendar } from 'lucide-react';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { SummaryCard, Loader, EmptyState, TypeBadge } from '../components/ui/index.jsx';
import { CategoryDoughnut, MonthlyBarChart } from '../components/ui/Charts.jsx';
import TransactionForm from '../components/ui/TransactionForm.jsx';
import { formatCurrency, formatDate, CATEGORY_ICONS, getCurrentMonth, getMonthName } from '../utils/helpers';

export default function Dashboard() {
  const { user } = useAuth();
  const [summary,  setSummary]  = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [month,    setMonth]    = useState(getCurrentMonth());

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const [y, m] = month.split('-');
      const { data } = await transactionAPI.getSummary({ year: y, month: parseInt(m) });
      setSummary(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [month]);

  useEffect(() => { fetchSummary(); }, [fetchSummary]);

  const currency = user?.currency || '₹';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            👋 Hello, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            Here's your financial overview for {getMonthName(month)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
            <Calendar size={15} className="text-gray-400" />
            <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
              className="text-sm bg-transparent text-gray-700 dark:text-gray-300 focus:outline-none" />
          </div>
          <button onClick={fetchSummary} className="btn-secondary btn-sm">
            <RefreshCw size={15} />
          </button>
          <button onClick={() => setShowForm(true)} className="btn-primary btn-sm">
            <Plus size={15} /> Add
          </button>
        </div>
      </div>

      {loading ? <Loader /> : !summary ? (
        <EmptyState icon="📊" title="No data yet" desc="Add your first transaction to see your dashboard." />
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard type="balance"  label="Total Balance" amount={summary.allTime.balance}  currency={currency} />
            <SummaryCard type="income"   label="Monthly Income"  amount={summary.monthly.income}  currency={currency} />
            <SummaryCard type="expense"  label="Monthly Expense" amount={summary.monthly.expense} currency={currency} />
            <SummaryCard type="savings"  label="Monthly Savings" amount={summary.monthly.savings} currency={currency} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense breakdown */}
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Expense Breakdown
              </h2>
              <CategoryDoughnut data={summary.categoryBreakdown} />
            </div>

            {/* Monthly bar chart */}
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                6-Month Trend
              </h2>
              <MonthlyBarChart trendData={summary.monthlyTrend} />
            </div>
          </div>

          {/* Category breakdown table */}
          {summary.categoryBreakdown?.length > 0 && (
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Category Spending
              </h2>
              <div className="space-y-3">
                {summary.categoryBreakdown.map((cat) => {
                  const total   = summary.monthly.expense || 1;
                  const pct     = Math.min(100, (cat.total / total) * 100);
                  return (
                    <div key={cat._id} className="flex items-center gap-3">
                      <span className="text-xl w-8 text-center flex-shrink-0">
                        {CATEGORY_ICONS[cat._id] || '📦'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                            {cat._id}
                          </span>
                          <span className="text-sm font-bold text-gray-900 dark:text-white ml-2 flex-shrink-0">
                            {formatCurrency(cat.total, currency)}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full bg-primary-500 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 w-10 text-right flex-shrink-0">
                        {pct.toFixed(0)}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Recent transactions */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Recent Transactions</h2>
              <a href="/transactions" className="text-sm text-primary-600 font-medium hover:underline">
                View all →
              </a>
            </div>

            {!summary.recentTransactions?.length ? (
              <EmptyState icon="💸" title="No transactions yet"
                desc="Start adding your income and expenses." />
            ) : (
              <div className="space-y-2">
                {summary.recentTransactions.map((tx) => (
                  <div key={tx._id}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 dark:bg-emerald-900/20'
                        : 'bg-red-50 dark:bg-red-900/20'
                    }`}>
                      {CATEGORY_ICONS[tx.category] || '📦'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{tx.title}</p>
                      <p className="text-xs text-gray-400">{tx.category} · {formatDate(tx.date)}</p>
                    </div>
                    <span className={`text-sm font-bold flex-shrink-0 ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Add transaction modal */}
      <TransactionForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={fetchSummary}
      />
    </div>
  );
}
