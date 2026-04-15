// Format currency
export const formatCurrency = (amount, currency = '₹') => {
  const num = parseFloat(amount) || 0;
  return `${currency}${num.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

// Format date
export const formatDate = (date, options = {}) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    ...options,
  });
};

// Format date for input (YYYY-MM-DD)
export const toInputDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

// Get current month in YYYY-MM format
export const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// Get month name from YYYY-MM
export const getMonthName = (monthStr) => {
  const [year, month] = monthStr.split('-').map(Number);
  return new Date(year, month - 1).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

// Get short month name
export const getShortMonth = (year, month) => {
  return new Date(year, month - 1).toLocaleDateString('en-IN', { month: 'short' });
};

// Time ago
export const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60)     return 'Just now';
  if (diff < 3600)   return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return formatDate(date);
};

// Category icons mapping
export const CATEGORY_ICONS = {
  'Food & Dining':     '🍽️',
  'Transportation':    '🚗',
  'Shopping':          '🛍️',
  'Bills & Utilities': '💡',
  'Salary':            '💼',
  'Entertainment':     '🎬',
  'Health & Medical':  '🏥',
  'Education':         '📚',
  'Investment':        '📈',
  'Travel':            '✈️',
  'Rent':              '🏠',
  'Freelance':         '💻',
  'Gift':              '🎁',
  'Other':             '📦',
};

// Category colors for charts
export const CATEGORY_COLORS = [
  '#0ea5e9', '#10b981', '#f59e0b', '#ef4444',
  '#8b5cf6', '#ec4899', '#06b6d4', '#f97316',
  '#84cc16', '#6366f1', '#14b8a6', '#e11d48',
  '#a855f7', '#64748b',
];

export const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities',
  'Salary', 'Entertainment', 'Health & Medical', 'Education',
  'Investment', 'Travel', 'Rent', 'Freelance', 'Gift', 'Other',
];

export const INCOME_CATEGORIES  = ['Salary', 'Freelance', 'Investment', 'Gift', 'Other'];
export const EXPENSE_CATEGORIES = ['Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities',
  'Entertainment', 'Health & Medical', 'Education', 'Travel', 'Rent', 'Other'];

// Get color class based on type
export const getTypeColor = (type) =>
  type === 'income' ? 'text-emerald-600' : 'text-red-500';

export const getTypeBg = (type) =>
  type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20';
