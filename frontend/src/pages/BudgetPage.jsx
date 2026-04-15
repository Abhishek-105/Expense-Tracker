import React, { useEffect, useState, useCallback } from 'react';
import { Target, AlertTriangle, CheckCircle, TrendingDown, Plus, Edit2 } from 'lucide-react';
import { budgetAPI, transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, ProgressBar, Modal } from '../components/ui/index.jsx';
import { formatCurrency, getCurrentMonth, getMonthName, CATEGORY_ICONS, EXPENSE_CATEGORIES } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function BudgetPage() {
  const { user }   = useAuth();
  const currency   = user?.currency || '₹';
  const [month,    setMonth]    = useState(getCurrentMonth());
  const [budgetData, setBudgetData] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [amount,   setAmount]   = useState('');
  const [saving,   setSaving]   = useState(false);
  const [history,  setHistory]  = useState([]);
  const [catBreakdown, setCatBreakdown] = useState([]);

  const fetchBudget = useCallback(async () => {
    setLoading(true);
    try {
      const [budgetRes, historyRes] = await Promise.all([
        budgetAPI.get(month),
        budgetAPI.getHistory(),
      ]);
      setBudgetData(budgetRes.data.data);
      setHistory(historyRes.data.data);

      // Fetch category breakdown for this month
      const [y, m] = month.split('-');
      const summaryRes = await transactionAPI.getSummary({ year: y, month: parseInt(m) });
      setCatBreakdown(summaryRes.data.data.categoryBreakdown || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [month]);

  useEffect(() => { fetchBudget(); }, [fetchBudget]);

  const openForm = () => {
    setAmount(budgetData?.budget?.amount || '');
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter a valid budget amount'); return; }
    setSaving(true);
    try {
      await budgetAPI.set({ month, amount: parseFloat(amount) });
      toast.success('Budget saved!');
      setShowForm(false);
      fetchBudget();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save budget');
    } finally { setSaving(false); }
  };

  const pct = budgetData?.percentage || 0;
  const isOver    = pct >= 100;
  const isWarning = pct >= 80 && pct < 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Budget</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Manage your spending limit for {getMonthName(month)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)}
            className="input w-auto text-sm" />
          <button onClick={openForm} className="btn-primary">
            {budgetData?.budget ? <><Edit2 size={15} /> Edit</> : <><Plus size={15} /> Set Budget</>}
          </button>
        </div>
      </div>

      {loading ? <Loader /> : (
        <>
          {/* Main budget card */}
          {!budgetData?.budget ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-primary-50 dark:bg-primary-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target size={30} className="text-primary-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Budget Set</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
                Set a monthly budget to track your spending and avoid overspending.
              </p>
              <button onClick={openForm} className="btn-primary mx-auto">
                <Plus size={15} /> Set Budget for {getMonthName(month)}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Alert banner */}
              {isOver && (
                <div className="flex items-center gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                  <AlertTriangle size={22} className="text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400">Budget Exceeded!</p>
                    <p className="text-sm text-red-600 dark:text-red-400/80">
                      You've spent {formatCurrency(budgetData.totalSpent, currency)} out of {formatCurrency(budgetData.budget.amount, currency)}.
                      Over by {formatCurrency(budgetData.totalSpent - budgetData.budget.amount, currency)}.
                    </p>
                  </div>
                </div>
              )}
              {isWarning && !isOver && (
                <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
                  <AlertTriangle size={22} className="text-amber-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-amber-700 dark:text-amber-400">Warning: Approaching Limit</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400/80">
                      You've used {pct.toFixed(0)}% of your budget. {formatCurrency(budgetData.remaining, currency)} remaining.
                    </p>
                  </div>
                </div>
              )}
              {!isOver && !isWarning && budgetData.budget && (
                <div className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
                  <CheckCircle size={22} className="text-emerald-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-emerald-700 dark:text-emerald-400">On Track!</p>
                    <p className="text-sm text-emerald-600 dark:text-emerald-400/80">
                      You have {formatCurrency(budgetData.remaining, currency)} remaining for this month.
                    </p>
                  </div>
                </div>
              )}

              {/* Budget overview card */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Monthly Budget Overview</h2>
                  <span className="text-sm text-gray-400">{getMonthName(month)}</span>
                </div>

                {/* Big numbers */}
                <div className="grid grid-cols-3 gap-4 mb-6 text-center">
                  <div>
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Budget</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {formatCurrency(budgetData.budget.amount, currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Spent</p>
                    <p className={`text-2xl font-bold ${isOver ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                      {formatCurrency(budgetData.totalSpent, currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">Remaining</p>
                    <p className={`text-2xl font-bold ${budgetData.remaining < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                      {formatCurrency(Math.abs(budgetData.remaining || 0), currency)}
                      {budgetData.remaining < 0 && <span className="text-sm font-normal ml-1">over</span>}
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <ProgressBar value={budgetData.totalSpent} max={budgetData.budget.amount} showPercent />
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {pct.toFixed(1)}% of monthly budget used
                </p>
              </div>

              {/* Category spending vs budget */}
              {catBreakdown.length > 0 && (
                <div className="card">
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
                    Spending by Category
                  </h2>
                  <div className="space-y-4">
                    {catBreakdown.map((cat) => (
                      <div key={cat._id} className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{CATEGORY_ICONS[cat._id] || '📦'}</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{cat._id}</span>
                            <span className="text-xs text-gray-400">({cat.count} txns)</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {formatCurrency(cat.total, currency)}
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-primary-500 transition-all duration-700"
                            style={{ width: `${Math.min(100, (cat.total / budgetData.budget.amount) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Budget history */}
          {history.length > 0 && (
            <div className="card">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Budget History</h2>
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {history.map((b) => (
                  <div key={b._id} className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{getMonthName(b.month)}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(b.amount, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Set/Edit Budget Modal */}
      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title={budgetData?.budget ? 'Edit Budget' : 'Set Monthly Budget'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Month</label>
            <input className="input" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
          </div>
          <div>
            <label className="label">Monthly Budget Amount ({currency})</label>
            <input className="input" type="number" min="1" step="100" required
              placeholder="e.g. 50000"
              value={amount} onChange={(e) => setAmount(e.target.value)} />
            <p className="text-xs text-gray-400 mt-1">Set a realistic limit for your monthly expenses</p>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
              {saving ? 'Saving…' : 'Save Budget'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
