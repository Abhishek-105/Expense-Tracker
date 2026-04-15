import React, { useState, useEffect } from 'react';
import { transactionAPI } from '../../services/api';
import { CATEGORIES, INCOME_CATEGORIES, EXPENSE_CATEGORIES, toInputDate, CATEGORY_ICONS } from '../../utils/helpers';
import { Modal } from './index.jsx';
import toast from 'react-hot-toast';

const DEFAULT_FORM = {
  title: '', amount: '', type: 'expense',
  category: '', date: new Date().toISOString().split('T')[0], note: '',
};

export default function TransactionForm({ isOpen, onClose, onSuccess, editData }) {
  const [form,    setForm]    = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);

  // Pre-fill when editing
  useEffect(() => {
    if (editData) {
      setForm({
        title:    editData.title    || '',
        amount:   editData.amount   || '',
        type:     editData.type     || 'expense',
        category: editData.category || '',
        date:     toInputDate(editData.date),
        note:     editData.note     || '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [editData, isOpen]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const availableCategories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Reset category if type changes and current category isn't valid
  const handleTypeChange = (type) => {
    const valid = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    set('type', type);
    if (!valid.includes(form.category)) set('category', '');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }
    if (!form.amount || parseFloat(form.amount) <= 0) { toast.error('Enter a valid amount'); return; }
    if (!form.category) { toast.error('Select a category'); return; }

    setLoading(true);
    try {
      if (editData) {
        await transactionAPI.update(editData._id, form);
        toast.success('Transaction updated!');
      } else {
        await transactionAPI.create(form);
        toast.success('Transaction added!');
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Transaction' : 'Add Transaction'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
          {['expense', 'income'].map((t) => (
            <button key={t} type="button" onClick={() => handleTypeChange(t)}
              className={`py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                form.type === t
                  ? t === 'income'
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-red-500 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}>
              {t === 'income' ? '↑ Income' : '↓ Expense'}
            </button>
          ))}
        </div>

        {/* Title */}
        <div>
          <label className="label">Title *</label>
          <input className="input" placeholder="e.g. Monthly Salary, Grocery Shopping" required
            value={form.title} onChange={(e) => set('title', e.target.value)} />
        </div>

        {/* Amount + Date row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Amount *</label>
            <input className="input" type="number" step="0.01" min="0.01" placeholder="0.00" required
              value={form.amount} onChange={(e) => set('amount', e.target.value)} />
          </div>
          <div>
            <label className="label">Date *</label>
            <input className="input" type="date" required
              value={form.date} onChange={(e) => set('date', e.target.value)} />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="label">Category *</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {availableCategories.map((cat) => (
              <button key={cat} type="button" onClick={() => set('category', cat)}
                className={`flex items-center gap-1.5 p-2 rounded-xl border text-xs font-medium transition-all text-left ${
                  form.category === cat
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-600 dark:text-gray-400'
                }`}>
                <span>{CATEGORY_ICONS[cat] || '📦'}</span>
                <span className="truncate">{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="label">Note <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea className="input resize-none h-20" placeholder="Add a note…"
            value={form.note} onChange={(e) => set('note', e.target.value)} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1 justify-center">Cancel</button>
          <button type="submit" disabled={loading}
            className={`flex-1 justify-center btn ${form.type === 'income' ? 'btn-success' : 'btn-danger'}`}>
            {loading ? 'Saving…' : editData ? 'Update' : `Add ${form.type}`}
          </button>
        </div>
      </form>
    </Modal>
  );
}
