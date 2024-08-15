'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from "recharts";
import kv from "../lib/kv"; // Import the KV client

import { FaTrashAlt } from "react-icons/fa";

type Entry = {
  id: number;
  date: string;
  category: string;
  amount: number;
};

type NewEntry = Omit<Entry, "id">;

export default function Home() {
  const [expenses, setExpenses] = useState<Entry[]>([]);
  const [incomes, setIncomes] = useState<Entry[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<string[]>([]);
  const [incomeCategories, setIncomeCategories] = useState<string[]>([]);
  const [newExpense, setNewExpense] = useState<NewEntry>({
    date: "",
    category: "",
    amount: 0,
  });
  const [newIncome, setNewIncome] = useState<NewEntry>({
    date: "",
    category: "",
    amount: 0,
  });
  const [newExpenseCategory, setNewExpenseCategory] = useState("");
  const [newIncomeCategory, setNewIncomeCategory] = useState("");
  const [currency, setCurrency] = useState("EUR");

  useEffect(() => {
    async function fetchData() {
      const fetchedExpenses = await kv.get<Entry[]>("expenses");
      const fetchedIncomes = await kv.get<Entry[]>("incomes");
      const fetchedExpenseCategories = await kv.get<string[]>(
        "expenseCategories"
      );
      const fetchedIncomeCategories = await kv.get<string[]>(
        "incomeCategories"
      );

      setExpenses(fetchedExpenses || []);
      setIncomes(fetchedIncomes || []);
      setExpenseCategories(fetchedExpenseCategories || []);
      setIncomeCategories(fetchedIncomeCategories || []);
    }

    fetchData();
  }, []);

  const addEntry = async (
    e: FormEvent<HTMLFormElement>,
    type: "expense" | "income"
  ) => {
    e.preventDefault();
    const entry =
      type === "expense"
        ? { ...newExpense, amount: -Math.abs(newExpense.amount) }
        : newIncome; // Ensure expenses are negative
    const setEntries = type === "expense" ? setExpenses : setIncomes;
    const entries = type === "expense" ? expenses : incomes;

    if (entry.date && entry.category && entry.amount) {
      const updatedEntries = [...entries, { ...entry, id: Date.now() }].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setEntries(updatedEntries);
      type === "expense"
        ? setNewExpense({ date: "", category: "", amount: 0 })
        : setNewIncome({ date: "", category: "", amount: 0 });

      // Persist to KV
      await kv.set(type === "expense" ? "expenses" : "incomes", updatedEntries);
    }
  };

  const deleteEntry = async (id: number, type: "expense" | "income") => {
    const setEntries = type === "expense" ? setExpenses : setIncomes;
    const entries = type === "expense" ? expenses : incomes;
    const updatedEntries = entries.filter((entry) => entry.id !== id);

    setEntries(updatedEntries);
    await kv.set(type === "expense" ? "expenses" : "incomes", updatedEntries);
  };

  const addCategory = async (
    e: FormEvent<HTMLFormElement>,
    type: "expense" | "income"
  ) => {
    e.preventDefault();
    const newCategory =
      type === "expense" ? newExpenseCategory : newIncomeCategory;
    const setCategories =
      type === "expense" ? setExpenseCategories : setIncomeCategories;
    const categories =
      type === "expense" ? expenseCategories : incomeCategories;

    if (newCategory && !categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory];

      setCategories(updatedCategories);
      type === "expense" ? setNewExpenseCategory("") : setNewIncomeCategory("");

      // Persist to KV
      await kv.set(
        type === "expense" ? "expenseCategories" : "incomeCategories",
        updatedCategories
      );
    }
  };

  const deleteCategory = async (
    categoryName: string,
    type: "expense" | "income"
  ) => {
    const setCategories =
      type === "expense" ? setExpenseCategories : setIncomeCategories;
    const categories =
      type === "expense" ? expenseCategories : incomeCategories;
    const updatedCategories = categories.filter((cat) => cat !== categoryName);

    setCategories(updatedCategories);

    // Persist to KV
    await kv.set(
      type === "expense" ? "expenseCategories" : "incomeCategories",
      updatedCategories
    );
  };

  const handleEntryChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    type: "expense" | "income"
  ) => {
    const { name, value } = e.target;
    const setEntry = type === "expense" ? setNewExpense : setNewIncome;
    const entry = type === "expense" ? newExpense : newIncome;

    setEntry({
      ...entry,
      [name]: name === "amount" ? parseFloat(value) : value,
    });
  };

  const combinedData = [...expenses, ...incomes]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .reduce((acc, entry) => {
      const balance =
        (acc.length > 0 ? acc[acc.length - 1].balance : 0) + entry.amount;
      return [...acc, { ...entry, balance }];
    }, [] as Array<Entry & { balance: number }>);

  const totalBalance =
    combinedData.length > 0 ? combinedData[combinedData.length - 1].balance : 0;

  const incomeTotal = incomes.reduce((sum, income) => sum + income.amount, 0);
  const expenseTotal = expenses.reduce(
    (sum, expense) => sum + Math.abs(expense.amount),
    0
  );

  // Define the colors for the Pie Charts
  const incomeColors = ["#5ccf79", "#009c1a", "#22b600", "#59993d", "#85d762"];
  const expenseColors = ["#FF8042", "#e57138", "#e78e46", "#ec905d", "#b65b28"];
  const balanceColors = ["#5ccf79", "#FF8042"];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-6 flex flex-col items-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl font-bold mb-4">Overview</h1>

        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold">Current Balance</h2>
          <p className="text-2xl text-green-500">
            {currency} {totalBalance.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold">Total Income</h2>
          <p className="text-2xl text-green-500">
            {currency} {incomeTotal.toFixed(2)}
          </p>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg mb-6">
          <h2 className="text-xl font-semibold">Total Expenses</h2>
          <p className="text-2xl text-red-500">
            {currency} {expenseTotal.toFixed(2)}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div>
            <h3 className="text-lg font-semibold text-center">Income Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={incomes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#00C49F" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-center">Expense Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={expenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#FF8042" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-center">Balance Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Line type="monotone" dataKey="balance" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Charts */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {/* Income Distribution Pie Chart */}
          <div>
            <h3 className="text-lg font-semibold text-center">
              Income Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={incomeCategories.map((category) => ({
                    name: category,
                    value: incomes
                      .filter((income) => income.category === category)
                      .reduce((sum, income) => sum + income.amount, 0),
                  }))}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                >
                  {incomeCategories.map((category, index) => (
                    <Cell key={`cell-${index}`} fill={incomeColors[index % incomeColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Distribution Pie Chart */}
          <div>
            <h3 className="text-lg font-semibold text-center">
              Expense Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseCategories.map((category) => ({
                    name: category,
                    value: expenses
                      .filter((expense) => expense.category === category)
                      .reduce(
                        (sum, expense) => sum + Math.abs(expense.amount),
                        0
                      ),
                  }))}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                >
                  {expenseCategories.map((category, index) => (
                    <Cell key={`cell-${index}`} fill={expenseColors[index % expenseColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Balance Distribution Pie Chart */}
          <div>
            <h3 className="text-lg font-semibold text-center">
              Balance Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: "Total Income", value: incomeTotal },
                    { name: "Total Expenses", value: expenseTotal },
                  ]}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  labelLine={false}
                >
                  <Cell key="income" fill={balanceColors[0]} />
                  <Cell key="expense" fill={balanceColors[1]} />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="flex space-x-6 mb-10">
          <div className="w-1/2">
            <h2 className="text-lg font-semibold">Add Expense</h2>
            <form
              onSubmit={(e) => addEntry(e, "expense")}
              className="space-y-4"
            >
              <input
                type="date"
                name="date"
                value={newExpense.date}
                onChange={(e) => handleEntryChange(e, "expense")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
                required
              />
              <select
                name="category"
                value={newExpense.category}
                onChange={(e) => handleEntryChange(e, "expense")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
                required
              >
                <option value="">Select Category</option>
                {expenseCategories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="amount"
                value={newExpense.amount || ""}
                onChange={(e) => handleEntryChange(e, "expense")}
                placeholder="Amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
                required
              />
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Expense
              </button>
            </form>

            <h2 className="text-lg font-semibold mt-6">Expense Categories</h2>
            <form
              onSubmit={(e) => addCategory(e, "expense")}
              className="space-y-4"
            >
              <input
                type="text"
                value={newExpenseCategory}
                onChange={(e) => setNewExpenseCategory(e.target.value)}
                placeholder="New Expense Category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
                required
              />
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Add Category
              </button>
            </form>

            <ul className="space-y-2 mt-4">
              {expenseCategories.map((category) => (
                <li
                  key={category}
                  className="flex justify-between items-center"
                >
                  <span>{category}</span>
                  <button
                    onClick={() => deleteCategory(category, "expense")}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="w-1/2">
            <h2 className="text-lg font-semibold">Add Income</h2>
            <form onSubmit={(e) => addEntry(e, "income")} className="space-y-4">
              <input
                type="date"
                name="date"
                value={newIncome.date}
                onChange={(e) => handleEntryChange(e, "income")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
                required
              />
              <select
                name="category"
                value={newIncome.category}
                onChange={(e) => handleEntryChange(e, "income")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
                required
              >
                <option value="">Select Category</option>
                {incomeCategories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="amount"
                value={newIncome.amount || ""}
                onChange={(e) => handleEntryChange(e, "income")}
                placeholder="Amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
                required
              />
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Add Income
              </button>
            </form>

            <h2 className="text-lg font-semibold mt-6">Income Categories</h2>
            <form
              onSubmit={(e) => addCategory(e, "income")}
              className="space-y-4"
            >
              <input
                type="text"
                value={newIncomeCategory}
                onChange={(e) => setNewIncomeCategory(e.target.value)}
                placeholder="New Income Category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
                required
              />
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Add Category
              </button>
            </form>

            <ul className="space-y-2 mt-4">
              {incomeCategories.map((category) => (
                <li
                  key={category}
                  className="flex justify-between items-center"
                >
                  <span>{category}</span>
                  <button
                    onClick={() => deleteCategory(category, "income")}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4 text-center">
            All Transactions
          </h2>
          <ul className="space-y-2">
            {combinedData.map((entry) => (
              <li
                key={entry.id}
                className="grid grid-cols-5 items-center text-sm"
              >
                <span className="col-span-1">{entry.date}</span>
                <span className="col-span-2">{entry.category}</span>
                <span
                  className={`col-span-1 text-right ${
                    entry.amount > 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {entry.amount > 0
                    ? `+ ${currency} ${entry.amount.toFixed(2)}`
                    : `- ${currency} ${Math.abs(entry.amount).toFixed(2)}`}
                </span>
                <button
                  onClick={() =>
                    deleteEntry(
                      entry.id,
                      entry.amount > 0 ? "income" : "expense"
                    )
                  }
                  className="col-span-1 text-red-500 ml-2 flex justify-end"
                >
                  <FaTrashAlt />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
