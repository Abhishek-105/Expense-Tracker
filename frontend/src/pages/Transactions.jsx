import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus, Search, Filter, Edit2, Trash2,
  ChevronLeft, ChevronRight, X, ArrowUpDown,
} from 'lucide-react';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Loader, EmptyState, ConfirmModal, TypeBadge } from '../components/ui/index.jsx';
import TransactionForm from '../components/ui/TransactionForm.jsx';
import {
  formatCurrency, formatDate, CATEGORY_ICONS,
  CATEGORIES, getTypeColor,
} from '../utils/helpers';
import toast from 'react-hot-toast';

export default function Transactions() {
  const { user } = useAuth();
  const currency  = user?.currency || '₹';

  const [transactions, setTransactions] = useState([]);
  const [pagination,   setPagination]   = useState({ page: 1, pages: 1, total: 0 });
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [filters, setFilters] = useState({
    search: '', type: '', category: '', startDate: '', endDate: '',
    sortBy: 'date', order: 'desc', page: 1, limit: 10,
  });
  const [showFilters, setShowFilters] = useState(false);

  const setF = (k, v) => setFilters((p) => ({ ...p, [k]: v, page: 1 }));

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      // Strip empty filters
      const params = Object.fromEntries(
        Object.entries(filters).filter(([, v]) => v !== '')
      );
      const { data } = await transactionAPI.getAll(params);
      setTransactions(data.data);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchTransactions(); }, [fetchTransactions]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await transactionAPI.delete(deleteId);
      toast.success('Transaction deleted');
      setDeleteId(null);
      fetchTransactions();
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(false); }
  };

  const openEdit = (tx) => { setEditData(tx); setShowForm(true); };
  const closeForm = () => { setEditData(null); setShowForm(false); };

  const clearFilters = () => setFilters({
    search: '', type: '', category: '', startDate: '', endDate: '',
    sortBy: 'date', order: 'desc', page: 1, limit: 10,
  });

  const hasActiveFilters = filters.type || filters.category || filters.startDate || filters.endDate;

  // Income / expense totals from current page
  const income  = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {pagination.total} total transactions
          </p>
        </div>
        <button onClick={() => { setEditData(null); setShowForm(true); }} className="btn-primary">
          <Plus size={16} /> Add Transaction
        </button>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Showing', value: `${transactions.length} records`, color: 'text-gray-700 dark:text-gray-300' },
          { label: 'Income',  value: formatCurrency(income,  currency), color: 'text-emerald-600' },
          { label: 'Expense', value: formatCurrency(expense, currency), color: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="card-sm text-center">
            <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search + filter bar */}
      <div className="card py-4 space-y-3">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input className="input pl-9" placeholder="Search transactions…"
              value={filters.search}
              onChange={(e) => setF('search', e.target.value)} />
          </div>
          <button onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary btn-sm flex-shrink-0 ${hasActiveFilters ? 'ring-2 ring-primary-400' : ''}`}>
            <Filter size={15} />
            Filters
            {hasActiveFilters && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
          </button>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-ghost btn-sm flex-shrink-0">
              <X size={15} /> Clear
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
            <div>
              <label className="label">Type</label>
              <select className="input" value={filters.type} onChange={(e) => setF('type', e.target.value)}>
                <option value="">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="label">Category</label>
              <select className="input" value={filters.category} onChange={(e) => setF('category', e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">From Date</label>
              <input className="input" type="date" value={filters.startDate}
                onChange={(e) => setF('startDate', e.target.value)} />
            </div>
            <div>
              <label className="label">To Date</label>
              <input className="input" type="date" value={filters.endDate}
                onChange={(e) => setF('endDate', e.target.value)} />
            </div>
          </div>
        )}
      </div>

      {/* Transaction table / list */}
      {loading ? <Loader /> : transactions.length === 0 ? (
        <div className="card">
          <EmptyState icon="💸" title="No transactions found"
            desc={hasActiveFilters ? 'Try adjusting your filters.' : 'Add your first transaction to get started.'}
            action={
              <button onClick={() => setShowForm(true)} className="btn-primary mt-2">
                <Plus size={15} /> Add Transaction
              </button>
            } />
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card p-0 overflow-hidden hidden md:block">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {['Date', 'Title', 'Category', 'Type', 'Amount', 'Note', ''].map((h) => (
                    <th key={h} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {formatDate(tx.date)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{CATEGORY_ICONS[tx.category] || '📦'}</span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{tx.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{tx.category}</td>
                    <td className="px-5 py-4"><TypeBadge type={tx.type} /></td>
                    <td className={`px-5 py-4 text-sm font-bold whitespace-nowrap ${getTypeColor(tx.type)}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-400 max-w-[150px] truncate">
                      {tx.note || '—'}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(tx)}
                          className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-gray-400 hover:text-primary-600 transition-colors">
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setDeleteId(tx._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {transactions.map((tx) => (
              <div key={tx._id} className="card-sm">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 ${
                    tx.type === 'income' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    {CATEGORY_ICONS[tx.category] || '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{tx.title}</p>
                        <p className="text-xs text-gray-400">{tx.category} · {formatDate(tx.date)}</p>
                      </div>
                      <span className={`text-sm font-bold flex-shrink-0 ${getTypeColor(tx.type)}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                      </span>
                    </div>
                    {tx.note && <p className="text-xs text-gray-400 mt-1 truncate">{tx.note}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <TypeBadge type={tx.type} />
                      <button onClick={() => openEdit(tx)} className="btn-secondary btn-sm py-1">
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={() => setDeleteId(tx._id)} className="btn-danger btn-sm py-1">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.pages} · {pagination.total} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFilters((p) => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="btn-secondary btn-sm">
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                  const p = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i;
                  return (
                    <button key={p}
                      onClick={() => setFilters((f) => ({ ...f, page: p }))}
                      className={`btn-sm w-9 justify-center ${p === pagination.page ? 'btn-primary' : 'btn-secondary'}`}>
                      {p}
                    </button>
                  );
                })}
                <button
                  onClick={() => setFilters((p) => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.pages}
                  className="btn-secondary btn-sm">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <TransactionForm
        isOpen={showForm}
        onClose={closeForm}
        onSuccess={() => { closeForm(); fetchTransactions(); }}
        editData={editData}
      />
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This cannot be undone."
      />
    </div>
  );
}
