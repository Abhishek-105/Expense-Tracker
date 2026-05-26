import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, PieChart, Shield, Zap, BarChart2, Target } from 'lucide-react';

const FEATURES = [
  { icon: TrendingUp, title: 'Track Everything',   desc: 'Log income and expenses in seconds. Know exactly where every rupee goes.' },
  { icon: PieChart,   title: 'Visual Insights',    desc: 'Beautiful charts and graphs to understand your spending patterns at a glance.' },
  { icon: Target,     title: 'Smart Budgeting',    desc: 'Set monthly budgets and get warned before you overspend.' },
  { icon: BarChart2,  title: 'Monthly Reports',    desc: 'Detailed reports with trends across 6 months to plan better.' },
  { icon: Shield,     title: 'Secure & Private',   desc: 'JWT authentication ensures your data stays safe and private.' },
  { icon: Zap,        title: 'Lightning Fast',     desc: 'Built with React + Vite for a snappy, responsive experience.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navbar */}
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
            <TrendingUp size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">ExpenseTracker</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"  className="text-sm font-medium text-gray-400 hover:text-white transition-colors px-4 py-2">Login</Link>
          <Link to="/signup" className="text-sm font-semibold bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl transition-all">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary-900/30 border border-primary-800 px-4 py-2 rounded-full text-primary-400 text-sm font-medium mb-8">
          <Zap size={14} /> 
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
          Take Control of
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-400"> Your Finances</span>
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Track income, expenses, and budgets with beautiful charts and smart insights.
          Your complete personal finance manager — built for college students and professionals alike.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup" className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all shadow-lg hover:shadow-primary-900/50">
            Start for Free →
          </Link>
          <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-4 rounded-xl text-base transition-all">
            Try Demo
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-3xl mx-auto px-6 py-8 grid grid-cols-3 gap-6 text-center border-y border-gray-800 mb-20">
        {[['100%', 'Open Source'], ['6 Months', 'Trend Analysis'], ['Real-time', 'Budget Alerts']].map(([val, label]) => (
          <div key={label}>
            <p className="text-2xl font-bold text-primary-400">{val}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-4">Everything You Need</h2>
        <p className="text-gray-400 text-center mb-12">A complete expense management solution with powerful features</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-primary-800 transition-all">
              <div className="w-11 h-11 bg-primary-900/50 rounded-xl flex items-center justify-center mb-4">
                <Icon size={20} className="text-primary-400" />
              </div>
              <h3 className="font-bold text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 text-center py-8 text-gray-500 text-sm">
        <p>Built with ❤️ using MERN Stack — MongoDB, Express, React (Vite), Node.js + Tailwind CSS</p>
        <p className="mt-1 text-gray-600">© {new Date().getFullYear()} ExpenseTracker · Final Year College Project</p>
      </footer>
    </div>
  );
}
