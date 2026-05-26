import React, { useEffect, useState, useCallback } from 'react';
import { Calendar, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, SummaryCard } from '../components/ui/index.jsx';
import { CategoryDoughnut, MonthlyBarChart, TrendLineChart } from '../components/ui/Charts.jsx';
import { formatCurrency, CATEGORY_ICONS, getCurrentMonth, getMonthName } from '../utils/helpers';

export default function Reports() {
  const { user }  = useAuth();
  const currency  = user?.currency || '₹';
  const [month,   setMonth]   = useState(getCurrentMonth());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [y, m] = month.split('-');
      const { data } = await transactionAPI.getSummary({ year: y, month: parseInt(m) });
      setSummary(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Deep insights into your financial health
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
          <Calendar size={15} className="text-gray-400" />
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="text-sm bg-transparent text-gray-700 dark:text-gray-300 focus:outline-none" />
        </div>
      </div>

      {loading ? <Loader /> : !summary ? null : (
        <>
          {/* Summary for selected month */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard type="income"  label="Monthly Income"  amount={summary.monthly.income}  currency={currency} />
            <SummaryCard type="expense" label="Monthly Expense" amount={summary.monthly.expense} currency={currency} />
            <SummaryCard type="savings" label="Monthly Savings" amount={summary.monthly.savings} currency={currency} />
            <SummaryCard type="balance" label="Net Balance"     amount={summary.allTime.balance} currency={currency} />
          </div>

          {/* Savings rate insight */}
          {summary.monthly.income > 0 && (
            <div className="card bg-gradient-to-r from-primary-50 to-emerald-50 dark:from-primary-900/20 dark:to-emerald-900/20 border border-primary-100 dark:border-primary-800">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/40 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={22} className="text-primary-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    Savings Rate: {Math.max(0, (summary.monthly.savings / summary.monthly.income * 100)).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You saved {formatCurrency(Math.max(0, summary.monthly.savings), currency)} out of {formatCurrency(summary.monthly.income, currency)} earned in {getMonthName(month)}.
                    {summary.monthly.savings / summary.monthly.income > 0.2
                      ? ' 🎉 Great job! You\'re above the 20% savings goal.'
                      : ' 💡 Tip: Aim to save at least 20% of your income.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Charts grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense pie chart */}
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                Category Breakdown
              </h2>
              <p className="text-xs text-gray-400 mb-4">Where your money goes this month</p>
              <CategoryDoughnut data={summary.categoryBreakdown} />
            </div>

            {/* Bar chart */}
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                Income vs Expenses
              </h2>
              <p className="text-xs text-gray-400 mb-4">Monthly comparison (last 6 months)</p>
              <MonthlyBarChart trendData={summary.monthlyTrend} />
            </div>
          </div>

          {/* Line chart full width */}
          <div className="card">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
              Trend Analysis
            </h2>
            <p className="text-xs text-gray-400 mb-4">Income and expense trends over 6 months</p>
            <TrendLineChart trendData={summary.monthlyTrend} />
          </div>

          {/* Category detail table */}
          {summary.categoryBreakdown?.length > 0 && (
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                Detailed Category Report — {getMonthName(month)}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 pb-3 uppercase tracking-wide">Category</th>
                      <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 pb-3 uppercase tracking-wide">Transactions</th>
                      <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 pb-3 uppercase tracking-wide">Amount</th>
                      <th className="text-right text-xs font-semibold text-gray-500 dark:text-gray-400 pb-3 uppercase tracking-wide">% of Expense</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {summary.categoryBreakdown.map((cat) => {
                      const pct = summary.monthly.expense > 0
                        ? ((cat.total / summary.monthly.expense) * 100).toFixed(1)
                        : '0';
                      return (
                        <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{CATEGORY_ICONS[cat._id] || '📦'}</span>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{cat._id}</span>
                            </div>
                          </td>
                          <td className="py-3 text-right text-sm text-gray-500 dark:text-gray-400">
                            {cat.count}
                          </td>
                          <td className="py-3 text-right text-sm font-bold text-red-500">
                            {formatCurrency(cat.total, currency)}
                          </td>
                          <td className="py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className="h-full bg-primary-500 rounded-full"
                                  style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 w-10 text-right">
                                {pct}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700">
                      <td className="pt-3 text-sm font-bold text-gray-900 dark:text-white">Total</td>
                      <td className="pt-3 text-right text-sm text-gray-500 dark:text-gray-400">
                        {summary.categoryBreakdown.reduce((s, c) => s + c.count, 0)}
                      </td>
                      <td className="pt-3 text-right text-sm font-bold text-red-500">
                        {formatCurrency(summary.monthly.expense, currency)}
                      </td>
                      <td className="pt-3 text-right text-xs font-semibold text-gray-500">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
