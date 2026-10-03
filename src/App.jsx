

import { useEffect, useState } from "react";

import {

  LayoutDashboard,

  ReceiptText,

  Wallet,

  ChartNoAxesCombined,

  HandCoins,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Landmark,
  CircleDollarSign,

  Plus,

  Search,

  Bell,

  ArrowUpRight,

  ArrowDownLeft,

  Fuel,

  Coffee,

  ShoppingBag,

  GraduationCap,

  Utensils,

  Menu,

  X,

} from "lucide-react";



import { supabase } from "./lib/supabase";

import "./index.css";



const navigation = [

  { label: "Dashboard", icon: LayoutDashboard },

  { label: "Transactions", icon: ReceiptText },

  { label: "Money Management", icon: Wallet },
  { label: "Investments", icon: TrendingUp },
  { label: "Spending Calendar", icon: CalendarDays },
  { label: "Smart Insights", icon: ChartNoAxesCombined },
  { label: "Reports", icon: ChartNoAxesCombined },

];



const expenseCategories = [

  "Food",

  "Transport",

  "Outing",

  "Shopping",

  "College",

  "Bills",

  "Health",

  "Other",

];



const incomeCategories = [

  "Allowance",

  "Gift",

  "Refund",

  "Salary",

  "Other",

];



function getToday() {

  const now = new Date();

  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(

    2,

    "0"

  )}-${String(now.getDate()).padStart(2, "0")}`;

}



function formatMoney(amount) {

  return new Intl.NumberFormat("en-IN", {

    style: "currency",

    currency: "INR",

    maximumFractionDigits: 2,

  }).format(Number(amount) || 0);

}



function App() {

  const [transactions, setTransactions] = useState([]);

  const [savings, setSavings] = useState({ current: 0, goal: 10000 });

  const [activePage, setActivePage] = useState("Dashboard");

  const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [mobileMenu, setMobileMenu] = useState(false);

  const [formError, setFormError] = useState("");

  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authSubmitting, setAuthSubmitting] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState("");
  const [savingsRowId, setSavingsRowId] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loanForm, setLoanForm] = useState({
    person: "",
    direction: "lent",
    amount: "",
    date: getToday(),
    dueDate: "",
    notes: "",
  });
  const [loanError, setLoanError] = useState("");
  const [investments, setInvestments] = useState([]);
  const [investmentForm, setInvestmentForm] = useState({ name: "", symbol: "", invested: "", currentValue: "", date: getToday(), notes: "" });
  const [investmentError, setInvestmentError] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(getToday().slice(0, 7));
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(getToday());



  const [form, setForm] = useState({

    title: "",

    category: "Food",

    type: "expense",

    amount: "",

    date: getToday(),

  });



  const mapTransaction = (row) => ({
    id: row.id,
    title: row.description || "Transaction",
    category: row.category || "Other",
    type: row.type || "expense",
    amount: Number(row.amount) || 0,
    date: row.transaction_date || getToday(),
  });

  const mapLoan = (row) => ({
    id: row.id,
    person: row.person_name || "",
    direction: row.loan_type || "lent",
    amount: Number(row.amount) || 0,
    repaid: Number(row.repaid_amount) || 0,
    date: row.loan_date || row.created_at?.slice(0, 10) || getToday(),
    dueDate: row.due_date || "",
    notes: row.description || "",
  });

  const mapInvestment = (row) => ({
    id: row.id,
    name: row.name || "",
    symbol: row.symbol || "",
    invested: Number(row.invested_amount) || 0,
    currentValue: Number(row.current_value) || 0,
    date: row.purchase_date || row.created_at?.slice(0, 10) || getToday(),
    notes: row.notes || "",
  });

  const loadCloudData = async (userId) => {
    setDataLoading(true);
    setDataError("");

    const [transactionsResult, savingsResult, loansResult, investmentsResult] = await Promise.all([
      supabase.from("transactions").select("*").eq("user_id", userId).order("transaction_date", { ascending: false }).order("created_at", { ascending: false }),
      supabase.from("savings").select("*").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1),
      supabase.from("loans").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
      supabase.from("investments").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);

    const error = transactionsResult.error || savingsResult.error || loansResult.error || investmentsResult.error;
    if (error) {
      setDataError(error.message || "Unable to load your cloud data.");
      setDataLoading(false);
      return;
    }

    setTransactions((transactionsResult.data || []).map(mapTransaction));

    const savingsRow = savingsResult.data?.[0];
    if (savingsRow) {
      setSavingsRowId(savingsRow.id);
      setSavings({
        current: Math.max(0, Number(savingsRow.amount) || 0),
        goal: Math.max(1, Number(savingsRow.goal_amount) || 10000),
      });
    } else {
      setSavingsRowId(null);
      setSavings({ current: 0, goal: 10000 });
    }

    setLoans((loansResult.data || []).map(mapLoan));
    setInvestments((investmentsResult.data || []).map(mapInvestment));
    setDataLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!mounted) return;
      if (error) setAuthError(error.message);
      setSession(data.session);
      setAuthLoading(false);
      if (data.session?.user) {
        loadCloudData(data.session.user.id);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession?.user) {
        loadCloudData(nextSession.user.id);
      } else {
        setTransactions([]);
        setSavings({ current: 0, goal: 10000 });
        setSavingsRowId(null);
        setLoans([]);
        setInvestments([]);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setAuthMessage("");
    setAuthSubmitting(true);

    const cleanEmail = authEmail.trim();
    if (!cleanEmail || !authPassword) {
      setAuthError("Enter your email and password.");
      setAuthSubmitting(false);
      return;
    }

    if (authMode === "signup" && authPassword.length < 6) {
      setAuthError("Password must be at least 6 characters.");
      setAuthSubmitting(false);
      return;
    }

    const result = authMode === "login"
      ? await supabase.auth.signInWithPassword({ email: cleanEmail, password: authPassword })
      : await supabase.auth.signUp({ email: cleanEmail, password: authPassword });

    if (result.error) {
      setAuthError(result.error.message);
    } else if (authMode === "signup" && !result.data.session) {
      setAuthMessage("Account created. Check your email to confirm your account, then sign in.");
      setAuthPassword("");
    } else {
      setAuthMessage("");
    }

    setAuthSubmitting(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const saveSavings = async (event) => {
    event.preventDefault();
    if (!session?.user) return;

    const cleanSavings = {
      current: Math.max(0, Number(savings.current) || 0),
      goal: Math.max(1, Number(savings.goal) || 1),
    };

    setSavings(cleanSavings);
    setDataError("");

    const payload = {
      user_id: session.user.id,
      name: "Personal Savings",
      amount: cleanSavings.current,
      goal_amount: cleanSavings.goal,
    };

    const result = savingsRowId
      ? await supabase.from("savings").update(payload).eq("id", savingsRowId).select().single()
      : await supabase.from("savings").insert(payload).select().single();

    if (result.error) {
      setDataError(result.error.message || "Unable to save savings details.");
      return;
    }

    if (result.data?.id) setSavingsRowId(result.data.id);
  };

  const addLoan = async (event) => {
    event.preventDefault();
    setLoanError("");
    if (!session?.user) return;

    const amount = Number(loanForm.amount);
    if (!loanForm.person.trim()) {
      setLoanError("Enter the person's name.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setLoanError("Enter an amount greater than zero.");
      return;
    }
    if (!loanForm.date) {
      setLoanError("Choose the date of the loan.");
      return;
    }

    const result = await supabase.from("loans").insert({
      user_id: session.user.id,
      person_name: loanForm.person.trim(),
      loan_type: loanForm.direction,
      amount,
      repaid_amount: 0,
      status: "pending",
      description: loanForm.notes.trim(),
      loan_date: loanForm.date,
      due_date: loanForm.dueDate || null,
    }).select().single();

    if (result.error) {
      setLoanError(result.error.message || "Unable to save the loan record.");
      return;
    }

    setLoans((current) => [mapLoan(result.data), ...current]);
    setLoanForm({ person: "", direction: "lent", amount: "", date: getToday(), dueDate: "", notes: "" });
  };

  const recordLoanRepayment = async (loan) => {
    const outstanding = Math.max(0, Number(loan.amount) - Number(loan.repaid || 0));
    const entered = window.prompt(`Outstanding: ${formatMoney(outstanding)}\nEnter repayment amount:`, String(outstanding));
    if (entered === null) return;
    const amount = Number(entered);
    if (!Number.isFinite(amount) || amount <= 0 || amount > outstanding) {
      window.alert("Enter a repayment greater than zero and no more than the outstanding amount.");
      return;
    }

   
const newRepaid = Number(loan.repaid_amount || 0) + amount;
const newStatus = newRepaid >= Number(loan.amount) ? "settled" : "pending";
   const result = await supabase.from("loans")
      .update({ repaid_amount: newRepaid, status: newStatus })
      .eq("id", loan.id)
      .select()
      .single();

    if (result.error) {
      window.alert(result.error.message || "Unable to record the repayment.");
      return;
    }

    setLoans((current) => current.map((item) => item.id === loan.id ? mapLoan(result.data) : item));
  };

  const deleteLoan = async (id) => {
    if (window.confirm("Delete this lending/borrowing record?")) {
      const result = await supabase.from("loans").delete().eq("id", id);
      if (result.error) {
        window.alert(result.error.message || "Unable to delete this record.");
        return;
      }
      setLoans((current) => current.filter((item) => item.id !== id));
    }
  };

  const addInvestment = async (event) => {
    event.preventDefault();
    setInvestmentError("");
    if (!session?.user) return;

    const invested = Number(investmentForm.invested);
    const currentValue = investmentForm.currentValue === "" ? invested : Number(investmentForm.currentValue);
    if (!investmentForm.name.trim()) {
      setInvestmentError("Enter a stock or investment name.");
      return;
    }
    if (!Number.isFinite(invested) || invested <= 0 || !Number.isFinite(currentValue) || currentValue < 0) {
      setInvestmentError("Enter a valid invested amount and current value.");
      return;
    }

    const result = await supabase.from("investments").insert({
      user_id: session.user.id,
      name: investmentForm.name.trim(),
      symbol: investmentForm.symbol.trim().toUpperCase(),
      invested_amount: invested,
      current_value: currentValue,
      purchase_date: investmentForm.date || getToday(),
      notes: investmentForm.notes.trim(),
    }).select().single();

    if (result.error) {
      setInvestmentError(result.error.message || "Unable to save the investment.");
      return;
    }

    setInvestments((current) => [mapInvestment(result.data), ...current]);
    setInvestmentForm({ name: "", symbol: "", invested: "", currentValue: "", date: getToday(), notes: "" });
  };

  const updateInvestmentValue = async (item) => {
    const entered = window.prompt(`Invested: ${formatMoney(item.invested)}\nCurrent value of ${item.name}:`, String(item.currentValue));
    if (entered === null) return;
    const value = Number(entered);
    if (!Number.isFinite(value) || value < 0) {
      window.alert("Enter a valid current value of zero or more.");
      return;
    }

    const result = await supabase.from("investments")
      .update({ current_value: value })
      .eq("id", item.id)
      .select()
      .single();

    if (result.error) {
      window.alert(result.error.message || "Unable to update the investment.");
      return;
    }

    setInvestments((current) => current.map((investment) => investment.id === item.id ? mapInvestment(result.data) : investment));
  };

  const deleteInvestment = async (id) => {
    if (window.confirm("Delete this investment record?")) {
      const result = await supabase.from("investments").delete().eq("id", id);
      if (result.error) {
        window.alert(result.error.message || "Unable to delete this investment.");
        return;
      }
      setInvestments((current) => current.filter((item) => item.id !== id));
    }
  };

  const lentOutstanding = loans.filter((item) => item.direction === "lent").reduce((sum, item) => sum + Math.max(0, Number(item.amount) - Number(item.repaid || 0)), 0);
  const borrowedOutstanding = loans.filter((item) => item.direction === "borrowed").reduce((sum, item) => sum + Math.max(0, Number(item.amount) - Number(item.repaid || 0)), 0);

  const income = transactions

    .filter((item) => item.type === "income")

    .reduce((sum, item) => sum + Number(item.amount), 0);



  const expenses = transactions

    .filter((item) => item.type === "expense")

    .reduce((sum, item) => sum + Number(item.amount), 0);



  // Transaction balance is kept separate from manually tracked savings and investments.
  const balance = income - expenses;
  const totalInvested = investments.reduce((sum, item) => sum + Number(item.invested || 0), 0);
  const investmentValue = investments.reduce((sum, item) => sum + Number(item.currentValue || 0), 0);
  const investmentChange = investmentValue - totalInvested;
  const investmentChangePercent = totalInvested > 0 ? (investmentChange / totalInvested) * 100 : 0;

  const today = getToday();

  const currentMonth = today.slice(0, 7);
  const calendarMonthDate = new Date(`${calendarMonth}-01T12:00:00`);
  const calendarDaysCount = new Date(calendarMonthDate.getFullYear(), calendarMonthDate.getMonth() + 1, 0).getDate();
  const calendarStartOffset = new Date(calendarMonthDate.getFullYear(), calendarMonthDate.getMonth(), 1).getDay();
  const calendarDays = Array.from({ length: calendarDaysCount }, (_, index) => index + 1);
  const selectedDayTransactions = transactions.filter((item) => item.date === selectedCalendarDate);
  const selectedDayExpenses = selectedDayTransactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + Number(item.amount), 0);
  const calendarExpenseByDate = transactions.filter((item) => item.type === "expense" && item.date.startsWith(calendarMonth)).reduce((result, item) => {
    result[item.date] = (result[item.date] || 0) + Number(item.amount);
    return result;
  }, {});
  const monthDate = new Date(`${currentMonth}-01T12:00:00`);
  const previousMonthDate = new Date(monthDate.getFullYear(), monthDate.getMonth() - 1, 1);
  const previousMonthKey = `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, "0")}`;
  const previousMonthExpenses = transactions.filter((item) => item.type === "expense" && item.date.startsWith(previousMonthKey)).reduce((sum, item) => sum + Number(item.amount), 0);
  const currentMonthExpenseItems = transactions.filter((item) => item.type === "expense" && item.date.startsWith(currentMonth));
  const currentMonthCategoryTotals = currentMonthExpenseItems.reduce((result, item) => {
    result[item.category] = (result[item.category] || 0) + Number(item.amount);
    return result;
  }, {});
  const insightCategories = Object.entries(currentMonthCategoryTotals).sort((a, b) => b[1] - a[1]);
  const topExpenseCategory = insightCategories[0];
  const daysElapsed = Math.max(1, Number(today.slice(8, 10)));




  const todayExpenses = transactions

    .filter(

      (item) =>

        item.type === "expense" && item.date === today

    )

    .reduce((sum, item) => sum + Number(item.amount), 0);



  const monthExpenses = transactions

    .filter(

      (item) =>

        item.type === "expense" &&

        item.date.startsWith(currentMonth)

    )

    .reduce((sum, item) => sum + Number(item.amount), 0);

  const averageDailySpend = monthExpenses / daysElapsed;



  const monthIncome = transactions

    .filter(

      (item) =>

        item.type === "income" &&

        item.date.startsWith(currentMonth)

    )

    .reduce((sum, item) => sum + Number(item.amount), 0);



  const filteredTransactions = transactions.filter((item) =>

    `${item.title} ${item.category} ${item.type}`

      .toLowerCase()

      .includes(search.toLowerCase())

  );



  const addTransaction = async (event) => {
    event.preventDefault();
    setFormError("");
    if (!session?.user) return;

    const amount = Number(form.amount);
    if (!form.title.trim()) {
      setFormError("Please enter a description.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError("Enter an amount greater than zero.");
      return;
    }
    if (!form.date) {
      setFormError("Please select a date.");
      return;
    }

    const result = await supabase.from("transactions").insert({
      user_id: session.user.id,
      type: form.type,
      amount,
      category: form.category,
      description: form.title.trim(),
      transaction_date: form.date,
    }).select().single();

    if (result.error) {
      setFormError(result.error.message || "Unable to save the transaction.");
      return;
    }

    setTransactions((current) => [mapTransaction(result.data), ...current]);
    setForm({ title: "", category: "Food", type: "expense", amount: "", date: getToday() });
    setShowForm(false);
  };

  const deleteTransaction = async (id) => {
    if (window.confirm("Delete this transaction?")) {
      const result = await supabase.from("transactions").delete().eq("id", id);
      if (result.error) {
        window.alert(result.error.message || "Unable to delete this transaction.");
        return;
      }
      setTransactions((current) => current.filter((item) => item.id !== id));
    }
  };

  const openTransactionForm = (type = "expense") => {

    setForm({

      title: "",

      category: type === "income" ? "Allowance" : "Food",

      type,

      amount: "",

      date: getToday(),

    });

    setFormError("");

    setShowForm(true);

  };



  const savingsProgress = Math.min(

    100,

    (savings.current / Math.max(savings.goal, 1)) * 100

  );



  const pageDescriptions = {

    Dashboard: "Your money, in perspective.",

    Transactions: "Every rupee, accounted for.",

    "Money Management": "Keep track of what you own and owe.",
    Investments: "Track your stock investments separately from daily spending.",
    "Spending Calendar": "Explore your spending day by day.",
    "Smart Insights": "Simple insights to help you understand your habits.",
    Reports: "Understand your spending habits.",

  };



  if (authLoading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f6f4ef", color: "#1d2a22", fontFamily: "inherit" }}>
        <div style={{ padding: 28, textAlign: "center" }}>Loading Pocketwise…</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 20, background: "#f6f4ef", color: "#1d2a22" }}>
        <div style={{ width: "100%", maxWidth: 420, background: "#ffffff", border: "1px solid #e4e1d9", borderRadius: 20, padding: 30, boxShadow: "0 18px 50px rgba(32, 44, 37, 0.08)" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, letterSpacing: "0.12em", color: "#43866a", fontWeight: 700 }}>POCKETWISE</div>
            <h1 style={{ margin: "8px 0 6px", fontSize: 30 }}>Your personal finance space</h1>
            <p style={{ margin: 0, color: "#68736d", lineHeight: 1.6 }}>Sign in to keep your financial records securely synced across devices.</p>
          </div>
          <form onSubmit={handleAuthSubmit}>
            <label style={{ display: "block", marginBottom: 14, fontSize: 13, fontWeight: 600 }}>Email
              <input type="email" autoComplete="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" required style={{ display: "block", width: "100%", marginTop: 7, padding: "12px 13px", border: "1px solid #d8d8d2", borderRadius: 10, boxSizing: "border-box" }} />
            </label>
            <label style={{ display: "block", marginBottom: 16, fontSize: 13, fontWeight: 600 }}>Password
              <input type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="At least 6 characters" required style={{ display: "block", width: "100%", marginTop: 7, padding: "12px 13px", border: "1px solid #d8d8d2", borderRadius: 10, boxSizing: "border-box" }} />
            </label>
            {authError && <p role="alert" style={{ margin: "0 0 12px", color: "#b94b45", fontSize: 13 }}>{authError}</p>}
            {authMessage && <p style={{ margin: "0 0 12px", color: "#43866a", fontSize: 13 }}>{authMessage}</p>}
            <button type="submit" disabled={authSubmitting} style={{ width: "100%", border: 0, borderRadius: 10, padding: "12px 14px", background: "#43866a", color: "#fff", fontWeight: 700, cursor: authSubmitting ? "default" : "pointer", opacity: authSubmitting ? 0.7 : 1 }}>
              {authSubmitting ? "Please wait…" : authMode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>
          <button type="button" onClick={() => { setAuthMode(authMode === "login" ? "signup" : "login"); setAuthError(""); setAuthMessage(""); }} style={{ width: "100%", marginTop: 12, border: "1px solid #d8d8d2", borderRadius: 10, padding: "11px 14px", background: "transparent", color: "#1d2a22", fontWeight: 600, cursor: "pointer" }}>
            {authMode === "login" ? "Create a new account" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    );
  }

  return (

    <div className="app-shell">

      {mobileMenu && (

        <button

          className="mobile-backdrop"

          onClick={() => setMobileMenu(false)}

          aria-label="Close menu"

        />

      )}



      <aside className={`sidebar ${mobileMenu ? "sidebar-open" : ""}`}>

        <div className="brand">

          <div className="brand-icon">

            <Wallet size={21} />

          </div>

          <div>

            <strong>Pocketwise</strong>

            <span>PERSONAL FINANCE</span>

          </div>

          <button

            className="icon-button close-menu"

            onClick={() => setMobileMenu(false)}

            aria-label="Close menu"

          >

            <X size={19} />

          </button>

        </div>



        <div className="sidebar-label">WORKSPACE</div>



        <nav className="navigation">

          {navigation.map(({ label, icon: Icon }) => (

            <button

              key={label}

              className={`nav-item ${

                activePage === label ? "nav-active" : ""

              }`}

              onClick={() => {

                setActivePage(label);

                setMobileMenu(false);

              }}

            >

              <Icon size={19} strokeWidth={1.8} />

              <span>{label}</span>

              {label === "Transactions" && (

                <span className="nav-count">{transactions.length}</span>

              )}

            </button>

          ))}

        </nav>



        <div className="sidebar-spacer" />



        <div className="sidebar-note">

          <div className="note-icon">

            <HandCoins size={21} />

          </div>

          <strong>Small steps add up.</strong>

          <p>Track today. Understand tomorrow.</p>

        </div>



        <div className="profile">

          <div className="avatar">A</div>

          <div className="profile-text">

            <strong>My Finances</strong>

            <span>{session.user.email || "Student account"}</span>

          </div>

          <span className="status-dot" />

        </div>

      </aside>



      <main className="main-area">

        <header className="topbar">

          <button

            className="icon-button mobile-menu-button"

            onClick={() => setMobileMenu(true)}

            aria-label="Open menu"

          >

            <Menu size={22} />

          </button>



          <div className="breadcrumb">

            My workspace <span>/</span> <strong>{activePage}</strong>

          </div>



          <div className="topbar-actions">

            <span className="date-label">

              {new Date().toLocaleDateString("en-IN", {

                day: "numeric",

                month: "short",

                year: "numeric",

              })}

            </span>

            <button

              className="icon-button notification-button"

              title="Notifications"

              aria-label="Notifications"

            >

              <Bell size={19} />

            </button>

            <button className="avatar top-avatar" title="Sign out" onClick={signOut}>

              A

            </button>

          </div>

        </header>



        <div className="page-content">
          {dataLoading && (
            <div style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "rgba(67, 134, 106, 0.1)", color: "#43866a", fontSize: 13 }}>
              Loading your cloud data…
            </div>
          )}
          {dataError && (
            <div role="alert" style={{ marginBottom: 16, padding: "10px 14px", borderRadius: 10, background: "#fff1f0", color: "#b94b45", fontSize: 13 }}>
              {dataError}
            </div>
          )}

          <section className="page-heading">

            <div>

              <div className="eyebrow">

                YOUR PERSONAL FINANCE SPACE

              </div>

              <h1>

                {activePage === "Dashboard"

                  ? "Good to see you, Arjun."

                  : activePage}

              </h1>

              <p>{pageDescriptions[activePage]}</p>

            </div>

            {activePage !== "Investments" && (
              <button
                className="primary-button"
                onClick={() => openTransactionForm("expense")}
              >
                <Plus size={18} /> Add transaction
              </button>
            )}

          </section>



          {activePage === "Dashboard" && (

            <>

              <section className="summary-grid">

                <SummaryCard

                  title="Available balance"

                  amount={formatMoney(balance)}

                  icon={Wallet}

                  tone="green"

                  caption="Recorded income minus recorded expenses"

                />

                <SummaryCard

                  title="Money received"

                  amount={formatMoney(income)}

                  icon={ArrowDownLeft}

                  tone="blue"

                  caption="All recorded income"

                />

                <SummaryCard

                  title="Money spent"

                  amount={formatMoney(expenses)}

                  icon={ArrowUpRight}

                  tone="orange"

                  caption="All recorded expenses"

                />

                <SummaryCard

                  title="Spent today"

                  amount={formatMoney(todayExpenses)}

                  icon={ReceiptText}

                  tone="purple"

                  caption="Today's expenses"

                />

              </section>

              <section className="asset-overview-grid">
                <div className="panel asset-overview-card">
                  <div className="asset-overview-heading"><span className="asset-icon savings-asset"><PiggyBank size={19} /></span><div><strong>Personal savings</strong><small>Tracked separately</small></div></div>
                  <div className="asset-overview-value">{formatMoney(savings.current)}</div>
                  <div className="mini-progress-track"><div style={{ width: `${savingsProgress}%` }} /></div>
                  <div className="asset-overview-foot"><span>{Math.round(savingsProgress)}% of goal</span><button className="text-button" onClick={() => setActivePage("Money Management")}>Manage <ArrowUpRight size={14} /></button></div>
                </div>
                <div className="panel asset-overview-card">
                  <div className="asset-overview-heading"><span className="asset-icon investment-asset"><TrendingUp size={19} /></span><div><strong>Stock investments</strong><small>Not counted as expenses</small></div></div>
                  <div className="asset-overview-value">{formatMoney(investmentValue)}</div>
                  <div className={`investment-change ${investmentChange >= 0 ? "positive" : "negative"}`}>{investmentChange >= 0 ? "+" : "−"}{formatMoney(Math.abs(investmentChange))} ({investmentChangePercent.toFixed(1)}%) value change</div>
                  <div className="asset-overview-foot"><span>Invested {formatMoney(totalInvested)}</span><button className="text-button" onClick={() => setActivePage("Investments")}>View portfolio <ArrowUpRight size={14} /></button></div>
                </div>
              </section>

              <section className="insight-banner">

                <div className="insight-icon">

                  <ChartNoAxesCombined size={23} />

                </div>

                <div className="insight-copy">

                  <strong>Your spending at a glance</strong>

                  <p>

                    {monthExpenses > 0

                      ? `You've recorded ${formatMoney(

                          monthExpenses

                        )} in expenses this month. Keep logging your daily spending.`

                      : "Start recording your daily expenses to understand where your money goes."}

                  </p>

                </div>

                <div className="insight-period">THIS MONTH</div>

              </section>



              <section className="content-grid">

                <div className="panel transactions-panel">

                  <div className="panel-header">

                    <div>

                      <h2>Recent transactions</h2>

                      <p>Your latest money movements</p>

                    </div>

                    <button

                      className="text-button"

                      onClick={() => setActivePage("Transactions")}

                    >

                      View all <ArrowUpRight size={15} />

                    </button>

                  </div>

                  <TransactionList

                    transactions={[...transactions]

                      .sort((a, b) => b.date.localeCompare(a.date))

                      .slice(0, 5)}

                    onDelete={deleteTransaction}

                  />

                </div>



                <div className="panel category-panel">

                  <div className="panel-header">

                    <div>

                      <h2>Where it goes</h2>

                      <p>Expense category breakdown</p>

                    </div>

                  </div>

                  <CategoryBreakdown transactions={transactions} />

                  <div className="category-footnote">

                    Based on your recorded expenses

                  </div>

                </div>

              </section>

            </>

          )}



          {activePage === "Transactions" && (

            <section className="panel full-panel">

              <div className="panel-header transactions-toolbar">

                <div>

                  <h2>All transactions</h2>

                  <p>{transactions.length} records in your tracker</p>

                </div>

                <div className="search-box">

                  <Search size={17} />

                  <input

                    value={search}

                    onChange={(event) => setSearch(event.target.value)}

                    placeholder="Search transactions..."

                    aria-label="Search transactions"

                  />

                </div>

              </div>

              <TransactionList

                transactions={[...filteredTransactions].sort((a, b) =>

                  b.date.localeCompare(a.date)

                )}

                onDelete={deleteTransaction}

                showAll

              />

            </section>

          )}



          {activePage === "Money Management" && (

            <section className="management-grid">

              <div className="panel management-card">

                <div className="management-icon green-icon">

                  <Wallet size={22} />

                </div>

                <h2>Pocket money & savings</h2>

                <p>

                  Record transfers from your family whenever they arrive.

                  Set a savings goal and keep track of the money you have

                  put aside.

                </p>



                <div className="management-total">

                  {formatMoney(savings.current)}

                </div>

                <span className="muted-label">Your saved amount · separate from transactions</span>
                <div className="savings-donut-row">
                  <div className="savings-donut" style={{ "--progress": `${savingsProgress}%` }} role="img" aria-label={`${Math.round(savingsProgress)} percent of savings goal reached`}>
                    <div className="savings-donut-center"><strong>{Math.round(savingsProgress)}%</strong><span>of goal</span></div>
                  </div>
                  <div className="savings-donut-copy"><strong>{formatMoney(savings.current)}</strong><span>saved of {formatMoney(savings.goal)}</span><small>This is your own savings balance. It does not create an income or expense transaction.</small></div>
                </div>

                <form onSubmit={saveSavings} className="savings-form">

                  <label className="form-label">

                    Total money saved (₹)

                    <input

                      type="number"

                      min="0"

                      step="0.01"

                      required

                      value={savings.current}

                      onChange={(event) =>

                        setSavings({

                          ...savings,

                          current: Math.max(

                            0,

                            Number(event.target.value) || 0

                          ),

                        })

                      }

                    />

                  </label>



                  <label className="form-label">

                    Savings goal (₹)

                    <input

                      type="number"

                      min="1"

                      step="0.01"

                      required

                      value={savings.goal}

                      onChange={(event) =>

                        setSavings({

                          ...savings,

                          goal: Math.max(

                            1,

                            Number(event.target.value) || 1

                          ),

                        })

                      }

                    />

                  </label>



                  <div className="savings-progress-heading">

                    <span>Goal progress</span>

                    <strong>{Math.round(savingsProgress)}%</strong>

                  </div>

                  <div

                    className="category-track progress-track"

                    role="progressbar"

                    aria-valuenow={Math.round(savingsProgress)}

                    aria-valuemin={0}

                    aria-valuemax={100}

                    aria-label="Savings goal progress"

                  >

                    <div

                      className="category-fill"

                      style={{

                        width: `${savingsProgress}%`,

                        background: "#43866a",

                      }}

                    />

                  </div>



                  <p className="savings-caption">

                    {formatMoney(savings.current)} saved toward{" "}

                    {formatMoney(savings.goal)}.

                  </p>

                  <button type="submit" className="secondary-button full-width">

                    Save savings details

                  </button>

                </form>



                <div className="management-divider" />

                <h2>Record pocket money</h2>

                <p>

                  Add each transfer as income when you actually receive it.

                  No fixed salary or schedule is required.

                </p>

                <button

                  className="secondary-button"

                  onClick={() => openTransactionForm("income")}

                >

                  <Plus size={16} /> Record money received

                </button>

              </div>



              <div className="panel management-card">

                <div className="management-icon purple-icon">

                  <HandCoins size={22} />

                </div>

                <h2>Lent & borrowed</h2>
                <p>Keep track of money you lend to others or borrow, and record repayments as they happen.</p>

                <div className="loan-summary-grid">
                  <div className="loan-summary loan-summary-lent"><span>Still owed to you</span><strong>{formatMoney(lentOutstanding)}</strong></div>
                  <div className="loan-summary loan-summary-borrowed"><span>You still owe</span><strong>{formatMoney(borrowedOutstanding)}</strong></div>
                </div>

                <form className="loan-form" onSubmit={addLoan}>
                  <label className="form-label">Record type
                    <select value={loanForm.direction} onChange={(event) => setLoanForm({ ...loanForm, direction: event.target.value })}>
                      <option value="lent">I lent money</option>
                      <option value="borrowed">I borrowed money</option>
                    </select>
                  </label>
                  <label className="form-label">Person's name
                    <input value={loanForm.person} onChange={(event) => setLoanForm({ ...loanForm, person: event.target.value })} placeholder="e.g. Rahul" maxLength={80} required />
                  </label>
                  <label className="form-label">Amount (₹)
                    <input type="number" min="0.01" step="0.01" value={loanForm.amount} onChange={(event) => setLoanForm({ ...loanForm, amount: event.target.value })} placeholder="500" required />
                  </label>
                  <label className="form-label">Date
                    <input type="date" value={loanForm.date} onChange={(event) => setLoanForm({ ...loanForm, date: event.target.value })} required />
                  </label>
                  <label className="form-label">Expected repayment date (optional)
                    <input type="date" value={loanForm.dueDate} onChange={(event) => setLoanForm({ ...loanForm, dueDate: event.target.value })} />
                  </label>
                  <label className="form-label">Notes (optional)
                    <input value={loanForm.notes} onChange={(event) => setLoanForm({ ...loanForm, notes: event.target.value })} placeholder="Reason or details" maxLength={180} />
                  </label>
                  {loanError && <p className="form-error" role="alert">{loanError}</p>}
                  <button className="primary-button full-width" type="submit"><Plus size={16} /> Add record</button>
                </form>

                <div className="management-divider" />
                <h2>Records & repayments</h2>
                {loans.length === 0 ? (
                  <div className="empty-loans"><HandCoins size={24} /><strong>No lending or borrowing records yet</strong><span>Add a record above to track outstanding amounts.</span></div>
                ) : (
                  <div className="loan-list">
                    {loans.map((loan) => {
                      const outstanding = Math.max(0, Number(loan.amount) - Number(loan.repaid || 0));
                      const status = outstanding <= 0 ? "Settled" : Number(loan.repaid || 0) > 0 ? "Partially paid" : "Pending";
                      return (
                        <div className="loan-record" key={loan.id}>
                          <div className="loan-record-top">
                            <div className={`loan-direction-icon ${loan.direction === "lent" ? "lent" : "borrowed"}`}><HandCoins size={18} /></div>
                            <div className="loan-person"><strong>{loan.person}</strong><span>{loan.direction === "lent" ? "You lent" : "You borrowed"} · {new Date(`${loan.date}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></div>
                            <span className={`loan-status ${status.toLowerCase().replace(" ", "-")}`}>{status}</span>
                          </div>
                          <div className="loan-amount-row"><span>Original: {formatMoney(loan.amount)}</span><span>Paid: {formatMoney(loan.repaid || 0)}</span><strong>Due: {formatMoney(outstanding)}</strong></div>
                          {loan.dueDate && <div className="loan-note">Expected by {new Date(`${loan.dueDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>}
                          {loan.notes && <div className="loan-note">{loan.notes}</div>}
                          <div className="loan-actions">
                            {outstanding > 0 && <button type="button" className="secondary-button" onClick={() => recordLoanRepayment(loan)}>Record repayment</button>}
                            <button type="button" className="text-button loan-delete" onClick={() => deleteLoan(loan.id)}>Delete record</button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>

            </section>

          )}



          {activePage === "Investments" && (
            <section className="investment-page-grid">
              <div className="investment-metrics-grid">
                <div className="panel investment-metric"><span className="metric-icon"><Landmark size={19} /></span><span className="muted-label">TOTAL INVESTED</span><strong>{formatMoney(totalInvested)}</strong><small>Original amount you put in</small></div>
                <div className="panel investment-metric"><span className="metric-icon"><CircleDollarSign size={19} /></span><span className="muted-label">CURRENT VALUE</span><strong>{formatMoney(investmentValue)}</strong><small>Update this manually from your broker</small></div>
                <div className="panel investment-metric"><span className={`metric-icon ${investmentChange >= 0 ? "metric-positive" : "metric-negative"}`}>{investmentChange >= 0 ? <TrendingUp size={19} /> : <TrendingDown size={19} />}</span><span className="muted-label">VALUE CHANGE</span><strong className={investmentChange >= 0 ? "positive-text" : "negative-text"}>{investmentChange >= 0 ? "+" : "−"}{formatMoney(Math.abs(investmentChange))}</strong><small>{investmentChangePercent.toFixed(1)}% compared with invested amount</small></div>
              </div>
              <div className="panel investment-form-panel">
                <div className="panel-header"><div><h2>Add an investment</h2><p>Keep stocks separate from everyday transactions.</p></div></div>
                <form className="investment-form" onSubmit={addInvestment}>
                  <label className="form-label">Stock / investment name<input value={investmentForm.name} onChange={(event) => setInvestmentForm({ ...investmentForm, name: event.target.value })} placeholder="e.g. Reliance Industries" maxLength={80} required /></label>
                  <div className="form-row"><label className="form-label">Ticker / symbol (optional)<input value={investmentForm.symbol} onChange={(event) => setInvestmentForm({ ...investmentForm, symbol: event.target.value })} placeholder="e.g. RELIANCE" maxLength={15} /></label><label className="form-label">Purchase date<input type="date" value={investmentForm.date} onChange={(event) => setInvestmentForm({ ...investmentForm, date: event.target.value })} required /></label></div>
                  <div className="form-row"><label className="form-label">Amount invested (₹)<input type="number" min="0.01" step="0.01" value={investmentForm.invested} onChange={(event) => setInvestmentForm({ ...investmentForm, invested: event.target.value })} placeholder="500" required /></label><label className="form-label">Current value (₹)<input type="number" min="0" step="0.01" value={investmentForm.currentValue} onChange={(event) => setInvestmentForm({ ...investmentForm, currentValue: event.target.value })} placeholder="Same as invested amount" /></label></div>
                  <label className="form-label">Notes (optional)<input value={investmentForm.notes} onChange={(event) => setInvestmentForm({ ...investmentForm, notes: event.target.value })} placeholder="e.g. Fractional / small investment" maxLength={180} /></label>
                  {investmentError && <p className="form-error" role="alert">{investmentError}</p>}
                  <p className="form-hint">Investment entries are stored separately. They do not change income, expenses, or your transaction balance. Current value is manual, not live market data.</p>
                  <button className="primary-button full-width" type="submit"><Plus size={16} /> Add investment</button>
                </form>
              </div>
              <div className="panel investment-list-panel">
                <div className="panel-header"><div><h2>Your investments</h2><p>{investments.length} holding{investments.length === 1 ? "" : "s"} tracked</p></div></div>
                {investments.length === 0 ? <div className="empty-state"><TrendingUp size={28} /><strong>No investments recorded yet</strong><p>Add a stock or investment above to start tracking it.</p></div> : <div className="investment-list">{investments.map((item) => { const change = Number(item.currentValue) - Number(item.invested); const changePercent = Number(item.invested) > 0 ? change / Number(item.invested) * 100 : 0; return <div className="investment-row" key={item.id}><div className="investment-row-icon"><TrendingUp size={19} /></div><div className="investment-row-main"><strong>{item.name}</strong><span>{item.symbol ? `${item.symbol} · ` : ""}{new Date(`${item.date}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>{item.notes && <small>{item.notes}</small>}</div><div className="investment-row-values"><strong>{formatMoney(item.currentValue)}</strong><span>Invested {formatMoney(item.invested)}</span><small className={change >= 0 ? "positive-text" : "negative-text"}>{change >= 0 ? "+" : "−"}{formatMoney(Math.abs(change))} ({changePercent.toFixed(1)}%)</small></div><div className="investment-row-actions"><button className="secondary-button" type="button" onClick={() => updateInvestmentValue(item)}>Update value</button><button className="text-button loan-delete" type="button" onClick={() => deleteInvestment(item.id)}>Delete</button></div></div>; })}</div>}
              </div>
            </section>
          )}

          {activePage === "Spending Calendar" && (
            <section className="calendar-layout">
              <div className="panel calendar-panel">
                <div className="panel-header calendar-header"><div><h2>Daily spending calendar</h2><p>Days with expenses show a small spending marker.</p></div><div className="calendar-month-controls"><button className="icon-button" aria-label="Previous month" onClick={() => { const d = new Date(`${calendarMonth}-01T12:00:00`); d.setMonth(d.getMonth() - 1); const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; setCalendarMonth(next); setSelectedCalendarDate(`${next}-01`); }}><ChevronLeft size={18} /></button><strong>{calendarMonthDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</strong><button className="icon-button" aria-label="Next month" onClick={() => { const d = new Date(`${calendarMonth}-01T12:00:00`); d.setMonth(d.getMonth() + 1); const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`; setCalendarMonth(next); setSelectedCalendarDate(`${next}-01`); }}><ChevronRight size={18} /></button></div></div>
                <div className="calendar-weekdays">{["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => <span key={day}>{day}</span>)}</div>
                <div className="calendar-days">{Array.from({ length: calendarStartOffset }, (_, index) => <span className="calendar-blank" key={`blank-${index}`} />)}{calendarDays.map((day) => { const dateKey = `${calendarMonth}-${String(day).padStart(2, "0")}`; const amount = calendarExpenseByDate[dateKey] || 0; return <button type="button" key={dateKey} className={`calendar-day ${selectedCalendarDate === dateKey ? "calendar-day-selected" : ""} ${dateKey === today ? "calendar-day-today" : ""}`} onClick={() => setSelectedCalendarDate(dateKey)}><span>{day}</span>{amount > 0 && <small title={`${formatMoney(amount)} spent`}>{amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : Math.round(amount)}</small>}</button>; })}</div>
                <div className="calendar-legend"><span className="calendar-legend-dot" /> A number below a date represents expenses recorded that day.</div>
              </div>
              <div className="panel calendar-day-panel"><div className="panel-header"><div><h2>{new Date(`${selectedCalendarDate}T12:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "long" })}</h2><p>Selected day summary</p></div></div><div className="calendar-day-total"><span>Total spent</span><strong>{formatMoney(selectedDayExpenses)}</strong></div>{selectedDayTransactions.length === 0 ? <div className="empty-state"><CalendarDays size={25} /><strong>No transactions on this day</strong><p>Select another date or add a transaction.</p></div> : <TransactionList transactions={[...selectedDayTransactions].sort((a, b) => b.date.localeCompare(a.date))} onDelete={deleteTransaction} showAll />}</div>
            </section>
          )}

          {activePage === "Smart Insights" && (
            <section className="insights-page">
              <div className="insight-metrics-grid">
                <div className="panel insight-metric"><span className="muted-label">SPENT THIS MONTH</span><strong>{formatMoney(monthExpenses)}</strong><small>{currentMonthExpenseItems.length} expense records</small></div>
                <div className="panel insight-metric"><span className="muted-label">DAILY AVERAGE</span><strong>{formatMoney(averageDailySpend)}</strong><small>Monthly spending divided by days elapsed</small></div>
                <div className="panel insight-metric"><span className="muted-label">TOP CATEGORY</span><strong>{topExpenseCategory ? topExpenseCategory[0] : "Not yet available"}</strong><small>{topExpenseCategory ? formatMoney(topExpenseCategory[1]) : "Add expenses to discover a pattern"}</small></div>
              </div>
              <div className="insights-content-grid">
                <div className="panel insights-chart-panel"><div className="panel-header"><div><h2>Where your money goes</h2><p>Current month expense categories</p></div></div>{insightCategories.length === 0 ? <div className="empty-state"><ChartNoAxesCombined size={28} /><strong>No spending patterns yet</strong><p>Once you record expenses, category insights will appear here.</p></div> : <div className="insight-category-list">{insightCategories.map(([category, amount], index) => { const palette = ["#2f7357", "#7899d0", "#d7a16b", "#9b87c7", "#cf8178", "#8b9a80", "#d2bd76", "#9aabb5"]; const share = monthExpenses > 0 ? amount / monthExpenses * 100 : 0; return <div className="insight-category" key={category}><div className="insight-category-label"><span><i style={{ background: palette[index % palette.length] }} />{category}</span><strong>{formatMoney(amount)}</strong></div><div className="insight-bar-track"><div style={{ width: `${share}%`, background: palette[index % palette.length] }} /></div><small>{share.toFixed(1)}% of monthly expenses</small></div>; })}</div>}</div>
                <div className="panel insights-comparison-panel"><div className="panel-header"><div><h2>Month-to-month</h2><p>Current month vs previous month</p></div></div><div className="comparison-number"><span>This month</span><strong>{formatMoney(monthExpenses)}</strong></div><div className="comparison-track"><div className="comparison-current" style={{ width: `${monthExpenses || previousMonthExpenses ? monthExpenses / Math.max(monthExpenses, previousMonthExpenses, 1) * 100 : 0}%` }} /></div><div className="comparison-number previous"><span>Previous month</span><strong>{formatMoney(previousMonthExpenses)}</strong></div><div className="comparison-track"><div className="comparison-previous" style={{ width: `${monthExpenses || previousMonthExpenses ? previousMonthExpenses / Math.max(monthExpenses, previousMonthExpenses, 1) * 100 : 0}%` }} /></div><div className={`insight-message ${(monthExpenses - previousMonthExpenses) <= 0 ? "message-good" : "message-caution"}`}>{previousMonthExpenses === 0 && monthExpenses === 0 ? "Record spending over time to compare months." : previousMonthExpenses === 0 ? "This is your first month with recorded expenses. Keep tracking to build a comparison." : monthExpenses < previousMonthExpenses ? `You've spent ${formatMoney(previousMonthExpenses - monthExpenses)} less than last month so far.` : monthExpenses > previousMonthExpenses ? `You've spent ${formatMoney(monthExpenses - previousMonthExpenses)} more than last month so far.` : "Your spending matches last month so far."}</div></div>
              </div>
              <div className="panel insights-tip"><span className="insight-tip-icon"><ChartNoAxesCombined size={20} /></span><div><strong>Keep the picture clear</strong><p>Savings and stock investments are tracked separately. Only entries in Transactions affect income and spending insights. Investment values are manual and are not live stock prices.</p></div></div>
            </section>
          )}

          {activePage === "Reports" && (

            <section className="reports-grid">

              <div className="panel report-card">

                <span className="muted-label">TOTAL RECORDED INCOME</span>

                <div className="report-number positive">

                  {formatMoney(income)}

                </div>

              </div>

              <div className="panel report-card">

                <span className="muted-label">TOTAL RECORDED EXPENSES</span>

                <div className="report-number negative">

                  {formatMoney(expenses)}

                </div>

              </div>

              <div className="panel report-card">

                <span className="muted-label">AVAILABLE BALANCE</span>

                <div className="report-number">{formatMoney(balance)}</div>

              </div>

              <div className="panel report-card">

                <span className="muted-label">TOTAL SAVINGS</span>

                <div className="report-number positive">

                  {formatMoney(savings.current)}

                </div>

                <p className="report-note">

                  Goal: {formatMoney(savings.goal)} (

                  {Math.round(savingsProgress)}% reached)

                </p>

              </div>

              <div className="panel report-card">
                <span className="muted-label">CURRENT INVESTMENT VALUE</span>
                <div className="report-number positive">{formatMoney(investmentValue)}</div>
                <p className="report-note">Invested {formatMoney(totalInvested)} · {investmentChange >= 0 ? "+" : "−"}{formatMoney(Math.abs(investmentChange))} value change</p>
              </div>

              <div className="panel report-chart">

                <div className="panel-header">

                  <div>

                    <h2>This month's overview</h2>

                    <p>Income and spending recorded this month</p>

                  </div>

                </div>

                <div className="monthly-bars">

                  <div className="bar-row">

                    <span>Income</span>

                    <div className="bar-track">

                      <div

                        className="bar-fill income-fill"

                        style={{

                          width: `${

                            monthIncome

                              ? (monthIncome /

                                  Math.max(monthIncome, monthExpenses, 1)) *

                                100

                              : 0

                          }%`,

                        }}

                      />

                    </div>

                    <strong>{formatMoney(monthIncome)}</strong>

                  </div>

                  <div className="bar-row">

                    <span>Expenses</span>

                    <div className="bar-track">

                      <div

                        className="bar-fill expense-fill"

                        style={{

                          width: `${

                            monthExpenses

                              ? (monthExpenses /

                                  Math.max(monthIncome, monthExpenses, 1)) *

                                100

                              : 0

                          }%`,

                        }}

                      />

                    </div>

                    <strong>{formatMoney(monthExpenses)}</strong>

                  </div>

                </div>

                <p className="report-note">

                  Monthly totals use each transaction's recorded date.

                  Figures only include entries stored in Pocketwise.

                </p>

              </div>

            </section>

          )}



          <footer className="app-footer">

            <span>

              <span className="footer-dot" />

              Your records are securely saved in the cloud

            </span>

            <span>

              POCKETWISE <span className="footer-separator">·</span>

              PERSONAL FINANCE

            </span>

          </footer>

        </div>

      </main>



      {showForm && (

        <div

          className="modal-backdrop"

          onMouseDown={(event) => {

            if (event.target === event.currentTarget) {

              setShowForm(false);

              setFormError("");

            }

          }}

        >

          <div

            className="transaction-modal"

            role="dialog"

            aria-modal="true"

            aria-labelledby="transaction-modal-title"

          >

            <div className="modal-header">

              <div>

                <div className="eyebrow">RECORD YOUR MONEY MOVEMENT</div>

                <h2 id="transaction-modal-title">Add transaction</h2>

              </div>

              <button

                className="icon-button"

                onClick={() => {

                  setShowForm(false);

                  setFormError("");

                }}

                aria-label="Close form"

              >

                <X size={21} />

              </button>

            </div>



            <form onSubmit={addTransaction}>

              <div className="type-switch">

                <button

                  type="button"

                  className={

                    form.type === "expense"

                      ? "type-active expense-active"

                      : ""

                  }

                  onClick={() =>

                    setForm({ ...form, type: "expense", category: "Food" })

                  }

                >

                  <ArrowUpRight size={17} /> Expense

                </button>

                <button

                  type="button"

                  className={

                    form.type === "income"

                      ? "type-active income-active"

                      : ""

                  }

                  onClick={() =>

                    setForm({

                      ...form,

                      type: "income",

                      category: "Allowance",

                    })

                  }

                >

                  <ArrowDownLeft size={17} /> Income

                </button>

              </div>



              <label className="form-label">

                Amount (₹)

                <input

                  autoFocus

                  type="number"

                  min="0.01"

                  step="0.01"

                  required

                  placeholder="0.00"

                  value={form.amount}

                  onChange={(event) =>

                    setForm({ ...form, amount: event.target.value })

                  }

                />

              </label>



              <label className="form-label">

                Description

                <input

                  required

                  maxLength={80}

                  placeholder={

                    form.type === "income"

                      ? "e.g. Pocket money from family"

                      : "e.g. Petrol, lunch, outing..."

                  }

                  value={form.title}

                  onChange={(event) =>

                    setForm({ ...form, title: event.target.value })

                  }

                />

              </label>



              <div className="form-row">

                <label className="form-label">

                  Category

                  <select

                    value={form.category}

                    onChange={(event) =>

                      setForm({ ...form, category: event.target.value })

                    }

                  >

                    {(form.type === "income"

                      ? incomeCategories

                      : expenseCategories

                    ).map((category) => (

                      <option key={category} value={category}>

                        {category}

                      </option>

                    ))}

                  </select>

                </label>



                <label className="form-label">

                  Date

                  <input

                    type="date"

                    required

                    value={form.date}

                    onChange={(event) =>

                      setForm({ ...form, date: event.target.value })

                    }

                  />

                </label>

              </div>



              {formError && (

                <p className="form-error" role="alert">

                  {formError}

                </p>

              )}



              <div className="form-actions">

                <button

                  type="button"

                  className="secondary-button"

                  onClick={() => {

                    setShowForm(false);

                    setFormError("");

                  }}

                >

                  Cancel

                </button>

                <button type="submit" className="primary-button">

                  {form.type === "income" ? "Add income" : "Add expense"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}



function SummaryCard({ title, amount, icon: Icon, tone, caption }) {

  return (

    <div className="summary-card">

      <div className={`summary-icon ${tone}`}>

        <Icon size={20} strokeWidth={1.9} />

      </div>

      <div className="summary-title">{title}</div>

      <div className="summary-amount">{amount}</div>

      <div className="summary-caption">{caption}</div>

    </div>

  );

}



function TransactionList({

  transactions,

  onDelete,

  showAll = false,

}) {

  if (!transactions.length) {

    return (

      <div className="empty-state">

        <ReceiptText size={28} />

        <strong>No transactions found</strong>

        <p>Add your first transaction to get started.</p>

      </div>

    );

  }



  const iconFor = (category) => {

    if (category === "Transport") return Fuel;

    if (category === "Food") return Utensils;

    if (category === "Outing") return Coffee;

    if (category === "Shopping") return ShoppingBag;

    if (category === "College") return GraduationCap;

    if (category === "Allowance") return Wallet;

    return ReceiptText;

  };



  return (

    <div className="transaction-list">

      {transactions.map((item) => {

        const Icon = iconFor(item.category);

        return (

          <div className="transaction-row" key={item.id}>

            <div className={`transaction-icon ${item.type}`}>

              <Icon size={19} strokeWidth={1.8} />

            </div>

            <div className="transaction-info">

              <strong>{item.title}</strong>

              <span>

                {item.category}

                <span className="row-dot">·</span>

                {new Date(`${item.date}T12:00:00`).toLocaleDateString(

                  "en-IN",

                  { day: "numeric", month: "short", year: "numeric" }

                )}

              </span>

            </div>

            <div className={`transaction-amount ${item.type}`}>

              {item.type === "income" ? "+" : "−"}

              {formatMoney(item.amount)}

            </div>

            {showAll && (

              <button

                className="delete-button"

                onClick={() => onDelete(item.id)}

                aria-label={`Delete ${item.title}`}

              >

                Delete

              </button>

            )}

          </div>

        );

      })}

    </div>

  );

}



function CategoryBreakdown({ transactions }) {

  const expenses = transactions.filter(

    (item) => item.type === "expense"

  );



  const total = expenses.reduce(

    (sum, item) => sum + Number(item.amount),

    0

  );



  const grouped = expenses.reduce((result, item) => {

    result[item.category] =

      (result[item.category] || 0) + Number(item.amount);

    return result;

  }, {});



  const colors = [

    "#43866a",

    "#7899d0",

    "#d7a16b",

    "#9b87c7",

    "#cf8178",

    "#8b9a80",

    "#d2bd76",

    "#9aabb5",

  ];



  const items = Object.entries(grouped).sort(

    (a, b) => b[1] - a[1]

  );



  return (

    <div className="category-breakdown">

      <div className="category-total">

        <strong>{formatMoney(total)}</strong>

        <span>Total recorded expenses</span>

      </div>



      {items.length === 0 ? (

        <p className="no-categories">

          Your categories will appear here as you add expenses.

        </p>

      ) : (

        <div className="category-items">

          {items.slice(0, 6).map(([category, amount], index) => (

            <div className="category-item" key={category}>

              <div className="category-label">

                <span

                  className="category-color"

                  style={{

                    background: colors[index % colors.length],

                  }}

                />

                <span>{category}</span>

                <strong>{formatMoney(amount)}</strong>

              </div>

              <div className="category-track">

                <div

                  className="category-fill"

                  style={{

                    width: `${total ? (amount / total) * 100 : 0}%`,

                    background: colors[index % colors.length],

                  }}

                />

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

}



export default App;

