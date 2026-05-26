/**
 * Seed script - creates demo user + sample transactions
 * Run: node utils/seed.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Budget = require('../models/Budget');

const DEMO_EMAIL = 'demo@expensetracker.com';
const DEMO_PASSWORD = 'demo1234';

const CATEGORIES = [
  'Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities',
  'Salary', 'Entertainment', 'Health & Medical', 'Education',
  'Travel', 'Rent', 'Freelance', 'Other',
];

const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const getRandomAmount = (min, max) => parseFloat((Math.random() * (max - min) + min).toFixed(2));

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Remove existing demo data
    let user = await User.findOne({ email: DEMO_EMAIL });
    if (user) {
      await Transaction.deleteMany({ userId: user._id });
      await Budget.deleteMany({ userId: user._id });
      await User.deleteOne({ _id: user._id });
      console.log('🗑  Removed existing demo data');
    }

    // Create demo user
    user = await User.create({
      name: 'Demo User',
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    console.log(`👤 Created demo user: ${DEMO_EMAIL}`);

    // Generate 6 months of transactions
    const transactions = [];
    const now = new Date();

    for (let m = 5; m >= 0; m--) {
      const year  = now.getFullYear();
      const month = now.getMonth() - m;
      const actualDate = new Date(year, month, 1);
      const actualYear  = actualDate.getFullYear();
      const actualMonth = actualDate.getMonth();

      // Monthly salary
      transactions.push({
        userId:   user._id,
        title:    'Monthly Salary',
        amount:   getRandomAmount(50000, 80000),
        type:     'income',
        category: 'Salary',
        date:     new Date(actualYear, actualMonth, 1),
        note:     'Regular monthly salary',
      });

      // Freelance (sometimes)
      if (Math.random() > 0.4) {
        transactions.push({
          userId:   user._id,
          title:    'Freelance Project',
          amount:   getRandomAmount(5000, 20000),
          type:     'income',
          category: 'Freelance',
          date:     new Date(actualYear, actualMonth, getRandomAmount(5, 25)),
          note:     'Freelance work payment',
        });
      }

      // Rent
      transactions.push({
        userId:   user._id,
        title:    'House Rent',
        amount:   15000,
        type:     'expense',
        category: 'Rent',
        date:     new Date(actualYear, actualMonth, 2),
        note:     'Monthly rent',
      });

      // Random expenses (10-18 per month)
      const expenseCount = Math.floor(getRandomAmount(10, 18));
      const expenseTitles = {
        'Food & Dining':    ['Dinner at Restaurant', 'Grocery Shopping', 'Coffee & Snacks', 'Lunch'],
        'Transportation':   ['Fuel', 'Uber/Ola Ride', 'Metro Pass', 'Auto Rickshaw'],
        'Shopping':         ['Clothes', 'Electronics', 'Books', 'Home Decor'],
        'Bills & Utilities':['Electricity Bill', 'Internet Bill', 'Phone Recharge', 'Water Bill'],
        'Entertainment':    ['Movie Tickets', 'Netflix Subscription', 'Gaming', 'Concert'],
        'Health & Medical': ['Doctor Visit', 'Medicines', 'Gym Membership', 'Health Check'],
        'Education':        ['Online Course', 'Books', 'Workshop Fee', 'Study Material'],
        'Travel':           ['Weekend Trip', 'Flight Ticket', 'Hotel Booking', 'Travel Expense'],
      };

      const expenseCategories = Object.keys(expenseTitles);

      for (let i = 0; i < expenseCount; i++) {
        const cat = getRandomItem(expenseCategories);
        const titles = expenseTitles[cat];
        transactions.push({
          userId:   user._id,
          title:    getRandomItem(titles),
          amount:   getRandomAmount(200, 5000),
          type:     'expense',
          category: cat,
          date:     new Date(actualYear, actualMonth, Math.floor(getRandomAmount(1, 28))),
          note:     '',
        });
      }

      // Set monthly budget
      const monthStr = `${actualYear}-${String(actualMonth + 1).padStart(2, '0')}`;
      await Budget.create({
        userId: user._id,
        month:  monthStr,
        amount: 60000,
      });
    }

    await Transaction.insertMany(transactions);
    console.log(`📊 Created ${transactions.length} transactions across 6 months`);
    console.log('\n─────────────────────────────────────');
    console.log('✅ Seed completed!');
    console.log('   Email:    demo@expensetracker.com');
    console.log('   Password: demo1234');
    console.log('─────────────────────────────────────\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
