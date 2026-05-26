import React from 'react';
import { X, AlertTriangle, TrendingUp, TrendingDown, Wallet, PiggyBank } from 'lucide-react';
import { formatCurrency } from '../../utils/helpers';

/* ── Loader ─────────────────────────────────────────── */
export const Loader = ({ text = 'Loading…' }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    <p className="text-sm text-gray-400">{text}</p>
  </div>
);

/* ── Page loader (full screen) ───────────────────────── */
export const PageLoader = () => (
  <div className="fixed inset-0 bg-white dark:bg-gray-950 flex items-center justify-center z-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <p className="text-gray-500 text-sm font-medium">Loading your data…</p>
    </div>
  </div>
);

/* ── Empty state ─────────────────────────────────────── */
export const EmptyState = ({ icon = '📋', title, desc, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
    <span className="text-5xl">{icon}</span>
    <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">{title}</p>
    {desc && <p className="text-sm text-gray-400 max-w-xs">{desc}</p>}
    {action}
  </div>
);

/* ── Modal ───────────────────────────────────────────── */
export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full ${maxWidth} animate-slide-up max-h-[90vh] overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

/* ── Confirm delete modal ────────────────────────────── */
export const ConfirmModal = ({ isOpen, onClose, onConfirm, title = 'Delete Item', message, loading }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-slide-up">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <AlertTriangle size={26} className="text-red-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {message || 'This action cannot be undone. Are you sure?'}
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onClose} disabled={loading} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button onClick={onConfirm} disabled={loading} className="btn-danger flex-1 justify-center">
              {loading ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Summary card ────────────────────────────────────── */
export const SummaryCard = ({ type, amount, label, currency = '₹', trend }) => {
  const configs = {
    balance: {
      icon: Wallet,
      bg:   'from-primary-500 to-primary-700',
      text: 'text-white',
      iconBg: 'bg-white/20',
    },
    income: {
      icon: TrendingUp,
      bg:   'from-emerald-400 to-emerald-600',
      text: 'text-white',
      iconBg: 'bg-white/20',
    },
    expense: {
      icon: TrendingDown,
      bg:   'from-red-400 to-red-600',
      text: 'text-white',
      iconBg: 'bg-white/20',
    },
    savings: {
      icon: PiggyBank,
      bg:   'from-purple-400 to-purple-600',
      text: 'text-white',
      iconBg: 'bg-white/20',
    },
  };

  const { icon: Icon, bg, text, iconBg } = configs[type] || configs.balance;

  return (
    <div className={`rounded-2xl bg-gradient-to-br ${bg} p-5 shadow-lg hover:shadow-xl transition-all duration-300 animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div>
          <p className={`text-xs font-semibold uppercase tracking-wider ${text} opacity-80`}>{label}</p>
          <p className={`text-2xl font-bold ${text} mt-1`}>{formatCurrency(amount, currency)}</p>
          {trend !== undefined && (
            <p className={`text-xs ${text} opacity-70 mt-1`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}% vs last month
            </p>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={22} className={text} />
        </div>
      </div>
    </div>
  );
};

/* ── Progress bar ────────────────────────────────────── */
export const ProgressBar = ({ value = 0, max = 100, color, label, showPercent = true }) => {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const getColor = () => {
    if (color) return color;
    if (pct >= 90) return 'bg-red-500';
    if (pct >= 75) return 'bg-orange-500';
    if (pct >= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  return (
    <div className="w-full">
      {(label || showPercent) && (
        <div className="flex justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{label}</span>}
          {showPercent && <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${getColor()}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

/* ── Badge ───────────────────────────────────────────── */
export const TypeBadge = ({ type }) => (
  <span className={`badge ${type === 'income' ? 'badge-income' : 'badge-expense'}`}>
    {type === 'income' ? '↑ Income' : '↓ Expense'}
  </span>
);
