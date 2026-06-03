# 📊 Smart Expense Tracker (MERN Stack)

A fully responsive, production-ready Full-Stack Expense Management Application designed specifically for college students and freelancers to track their multi-source income, manage budgets, and visualize their spending habits with real-time interactive charts.

🌐 **Live Application:** [View Live Site](https://expense-tracker-mauve-psi-74.vercel.app)  
💻 **Source Code:** [GitHub Repository](https://github.com/Abhishek-105/Expense-Tracker)

---

## 🚀 Key Features (Detailed Breakdown)

### 📈 1. Dynamic Financial Dashboard
- **Real-Time KPI Cards:** Instant visual display of Total Balance, Monthly Income, Monthly Expenses, and Monthly Savings calculations based on user inputs.
- **Dynamic Micro-Indicators:** Automatic color-coded balance gauges that shift styling depending on positive savings or high-expense ratios.
- **Recent Activity Logs:** A clean dashboard feed showcasing the latest 5 transactions with distinct visual indicators for `Income` (Green) and `Expense` (Red).

### 🔐 2. Secure User Authentication & Session Management
- **JWT Authentication:** Secure client-server communication using JSON Web Tokens (JWT) for stateless session handling.
- **Password Hashing:** Robust security layer implementing `bcryptjs` on the backend to hash and secure user credentials before saving to MongoDB.
- **Protected Client Routes:** Frontend private route guards that prevent unauthorized users from accessing the dashboard, transactions, or profile pages without a valid token session.

### 💼 3. Advanced Transaction Management
- **Full CRUD Operations:** Seamless capability to Add, View, and Track transactions dynamically with real-time state synchronization.
- **Multi-Source Categorization:** Specialized category filters including `Salary`, `Freelance`, `Investment`, and `Gift` for Income, and `Rent`, `Food & Dining`, `Education`, and `Transportation` for Expenses.
- **Optional Metadata:** Support for adding customized titles, exact transaction dates, and contextual notes to keep granular track of every rupee.

### 📊 4. Interactive Data Visualization & Reports
- **Expense Breakdown Pie Chart:** A dynamic, interactive Recharts-powered distribution wheel that updates instantly when a new expense category is added.
- **6-Month Trend Analysis:** A dual-bar histogram comparing monthly income vs. monthly expenses over time to identify structural spending habits.
- **Category-Wise Progress Bars:** Beautiful UI metrics breaking down percentage spend per category against total monthly outlays.

### 🎨 5. Premium UX & Optimization
- **Sleek Theme Toggle:** Seamless global theme context provider for an absolute Dark Mode / Light Mode transition.
- **Optimized Network Requests:** Implemented clean loading skeletons and spin-up indicators during backend controller data fetches to elevate user retention.
- **100% Responsive Design:** Utility-first grid layouts built via Tailwind CSS, fully responsive across high-res desktops, tablets, and mobile devices.

---

## 🛠️ Tech Stack & Architecture

This project follows a clean architecture separating frontend presentation from backend business logic.

### Frontend
- **React.js & Vite:** For a blazing fast, single-page application experience.
- **Redux Toolkit:** Centralized and scalable state management for cross-component communication.
- **Tailwind CSS:** Modern utility-first styling ensuring full mobile-to-desktop responsiveness.
- **Lucide React & Chart Components:** For elegant iconography and interactive data flows.

### Backend & Database
- **Node.js & Express.js:** Scalable RESTful API development structured using the Model-View-Controller (MVC) pattern.
- **MongoDB Atlas & Mongoose:** NoSQL cloud database with structured schemas for Users, Transactions, and Budgets.
- **JSON Web Tokens (JWT) & Bcrypt:** Industrial-grade password hashing and stateless token-based authorization.

---

## 📂 Project Structure

```text
expense-tracker/
├── backend/
│   ├── config/          # Database configuration (MongoDB Atlas)
│   ├── controllers/     # Business logic for Auth, Budget, and Transactions
│   ├── models/          # Mongoose Schemas (User, Transaction, Budget)
│   ├── routes/          # Express API routing endpoints
│   └── server.js        # Entry point for backend server
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components (Modals, Charts, Navbar)
    │   ├── pages/       # Dashboard, Transactions, Budget, Profile, Auth
    │   ├── store/       # Redux Toolkit global state configuration
    │   └── App.jsx      # Main application routing and theme context
