# 💰 Pocketwise — Personal Finance Tracker

**Pocketwise** is a full-stack personal finance management application built with React, Vite, and Supabase. It helps users manage their income, expenses, savings, loans, and investments through a single, easy-to-use interface.

🌐 **Live Demo:** https://glowing-seahorse-a60a6e.netlify.app/

📂 **GitHub Repository:** https://github.com/paarjun2007/pocketwise-personal-finance-tracker

---

## ✨ Features

- **User Authentication** — Sign up and sign in using Supabase Authentication.
- **Income & Expense Tracking** — Record and manage financial transactions.
- **Savings Management** — Track savings and monitor saved amounts.
- **Loan Management** — Record loans, repayments, and loan status.
- **Investment Tracking** — Store investment details and current values.
- **Cloud Database** — Store financial records in Supabase PostgreSQL.
- **Data Security** — Use Row Level Security (RLS) to restrict access to user-specific records.
- **Responsive Interface** — Access the application from desktop and mobile browsers.
- **Persistent Data** — Financial records remain available after refreshing or signing in again.

## 🛠️ Technology Stack

| Technology | Purpose |
|---|---|
| React.js | User interface |
| Vite | Development server and build tool |
| JavaScript | Application logic |
| CSS | Styling and responsive layout |
| Supabase Authentication | User authentication |
| PostgreSQL | Relational database |
| Supabase Row Level Security | User-specific data access |
| Netlify | Frontend hosting |
| Git & GitHub | Version control and source code hosting |

## 🏗️ Architecture

Pocketwise uses a client-side React application connected to Supabase for authentication and database operations.

```text
User
  |
  v
React + Vite Frontend
  |
  +---- Supabase Authentication
  |
  +---- Supabase Client
             |
             v
       PostgreSQL Database
       +-- transactions
       +-- savings
       +-- loans
       +-- investments
             |
             v
       Row Level Security
       
Frontend Deployment: Netlify
Source Code: GitHub
```

## 🚀 Getting Started

### Prerequisites

Install the following before running the project locally:

- Node.js and npm
- Git
- A Supabase project

### 1. Clone the repository

```bash
git clone https://github.com/paarjun2007/pocketwise-personal-finance-tracker.git
```

### 2. Navigate to the project directory

```bash
cd pocketwise-personal-finance-tracker
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the project root directory and add your Supabase project configuration:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Replace the placeholder values with your own Supabase project URL and publishable key.

**Security:** Never commit your `.env` file, service-role keys, or other secret credentials to GitHub.

### 5. Start the development server

```bash
npm run dev
```

Open the local URL displayed in your terminal, usually:

```text
http://localhost:5173/
```

### 6. Create a production build

```bash
npm run build
```

The production-ready files are generated in the `dist/` directory.

## 🗄️ Database

Pocketwise uses Supabase PostgreSQL for cloud data storage.

The application uses the following tables:

- `transactions` — Income and expense records
- `savings` — Savings records
- `loans` — Loan information and repayment details
- `investments` — Investment records and current values

Row Level Security policies should ensure authenticated users can access only their own records.

## 🌐 Deployment

The application is hosted on Netlify.

**Live application:** https://glowing-seahorse-a60a6e.netlify.app/

For manual deployments, build the application locally using `npm run build` and deploy the generated `dist/` directory. Ensure the correct environment variables are available during the build.

## 🔒 Security Considerations

- Keep environment variables out of version control.
- Use Supabase Row Level Security policies for all user-owned financial records.
- Use a publishable key in the frontend, never a service-role or secret key.
- Validate user input and handle authentication errors appropriately.

## 🎯 Project Objective

The objective of Pocketwise is to provide a simple, accessible platform for personal financial management. It brings income, expenses, savings, loans, and investments together in one application while demonstrating practical full-stack development concepts.

## 👨‍💻 Author

**Arjun PA**

B.Tech Computer Science and Engineering

GitHub: [paarjun2007](https://github.com/paarjun2007)

---

*Pocketwise — Manage your money. Understand your spending. Track your financial goals.*