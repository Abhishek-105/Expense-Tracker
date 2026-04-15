import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { CATEGORY_COLORS, getShortMonth } from '../../utils/helpers';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, LineElement,
  PointElement, ArcElement, Title, Tooltip, Legend, Filler
);

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: '#1e293b',
      titleColor: '#f1f5f9',
      bodyColor: '#94a3b8',
      borderColor: '#334155',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 10,
    },
  },
};

/* ── Expense Category Pie / Doughnut ─────────────────── */
export const CategoryDoughnut = ({ data = [] }) => {
  const labels  = data.map((d) => d._id);
  const amounts = data.map((d) => d.total);

  const chartData = {
    labels,
    datasets: [{
      data: amounts,
      backgroundColor: CATEGORY_COLORS.slice(0, data.length),
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const options = {
    ...CHART_DEFAULTS,
    cutout: '65%',
    plugins: {
      ...CHART_DEFAULTS.plugins,
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          padding: 16,
          font: { size: 11 },
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
    },
  };

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <p className="text-sm">No expense data yet</p>
      </div>
    );
  }

  return (
    <div className="h-72">
      <Doughnut data={chartData} options={options} />
    </div>
  );
};

/* ── Monthly Income vs Expense Bar Chart ─────────────── */
export const MonthlyBarChart = ({ trendData = [] }) => {
  // Build month labels + income/expense arrays from trend data
  const months = [];
  const incomeMap  = {};
  const expenseMap = {};

  trendData.forEach(({ _id, total }) => {
    const key = `${_id.year}-${_id.month}`;
    if (!months.includes(key)) months.push(key);
    if (_id.type === 'income')  incomeMap[key]  = total;
    if (_id.type === 'expense') expenseMap[key] = total;
  });

  const sortedMonths = months.sort();
  const labels   = sortedMonths.map((m) => {
    const [y, mo] = m.split('-').map(Number);
    return getShortMonth(y, mo);
  });
  const income   = sortedMonths.map((m) => incomeMap[m]  || 0);
  const expenses = sortedMonths.map((m) => expenseMap[m] || 0);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: income,
        backgroundColor: '#10b981cc',
        borderColor: '#10b981',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
      {
        label: 'Expenses',
        data: expenses,
        backgroundColor: '#ef4444cc',
        borderColor: '#ef4444',
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    ...CHART_DEFAULTS,
    plugins: {
      ...CHART_DEFAULTS.plugins,
      legend: {
        display: true,
        position: 'top',
        align: 'end',
        labels: { usePointStyle: true, pointStyleWidth: 8, font: { size: 11 } },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 11 } } },
    },
  };

  if (!trendData.length) {
    return <div className="flex items-center justify-center h-64 text-gray-400 text-sm">No data yet</div>;
  }

  return (
    <div className="h-64">
      <Bar data={chartData} options={options} />
    </div>
  );
};

/* ── Income vs Expense Line Chart ────────────────────── */
export const TrendLineChart = ({ trendData = [] }) => {
  const months = [];
  const incomeMap  = {};
  const expenseMap = {};

  trendData.forEach(({ _id, total }) => {
    const key = `${_id.year}-${String(_id.month).padStart(2, '0')}`;
    if (!months.includes(key)) months.push(key);
    if (_id.type === 'income')  incomeMap[key]  = total;
    if (_id.type === 'expense') expenseMap[key] = total;
  });

  const sorted = months.sort();
  const labels = sorted.map((m) => {
    const [y, mo] = m.split('-').map(Number);
    return getShortMonth(y, mo);
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: sorted.map((m) => incomeMap[m] || 0),
        borderColor: '#10b981',
        backgroundColor: '#10b98120',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Expense',
        data: sorted.map((m) => expenseMap[m] || 0),
        borderColor: '#ef4444',
        backgroundColor: '#ef444420',
        tension: 0.4,
        fill: true,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    ...CHART_DEFAULTS,
    plugins: {
      ...CHART_DEFAULTS.plugins,
      legend: {
        display: true, position: 'top', align: 'end',
        labels: { usePointStyle: true, pointStyleWidth: 8, font: { size: 11 } },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
      y: { grid: { color: '#f1f5f920' }, ticks: { font: { size: 11 } } },
    },
  };

  return (
    <div className="h-64">
      <Line data={chartData} options={options} />
    </div>
  );
};
