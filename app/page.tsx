'use client';

import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import kv from '../lib/kv';  // Import the KV client

type Expense = {
  id: number;
  date: string;
  category: string;
  amount: number;
};

type NewExpense = Omit<Expense, 'id'>;

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newExpense, setNewExpense] = useState<NewExpense>({ date: '', category: '', amount: 0 });
  const [newCategory, setNewCategory] = useState('');
  const [currency, setCurrency] = useState('EUR');

  // Fetch data from KV when component mounts
  useEffect(() => {
    async function fetchData() {
      const fetchedExpenses = await kv.get<Expense[]>('expenses');
      const fetchedCategories = await kv.get<string[]>('categories');

      setExpenses(fetchedExpenses || []);
      setCategories(fetchedCategories || []);
    }

    fetchData();
  }, []);

  // Add expense and persist to KV
  const addExpense = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newExpense.date && newExpense.category && newExpense.amount) {
      const updatedExpenses = [
        ...expenses,
        { ...newExpense, id: Date.now() },
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setExpenses(updatedExpenses);
      setNewExpense({ date: '', category: '', amount: 0 });

      // Persist to KV
      await kv.set('expenses', updatedExpenses);
    }
  };

  // Add category and persist to KV
  const addCategory = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newCategory && !categories.includes(newCategory)) {
      const updatedCategories = [...categories, newCategory];

      setCategories(updatedCategories);
      setNewCategory('');

      // Persist to KV
      await kv.set('categories', updatedCategories);
    }
  };

  const handleExpenseChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewExpense({ ...newExpense, [name]: name === 'amount' ? parseFloat(value) : value });
  };

  const totalEarned = expenses.filter(expense => expense.amount > 0).reduce((sum, expense) => sum + expense.amount, 0);
  const totalSpent = expenses.filter(expense => expense.amount < 0).reduce((sum, expense) => sum + expense.amount, 0);

  // Preparing data for the PieChart
  const spendingData = categories.map((category) => ({
    name: category,
    value: expenses.filter((expense) => expense.category === category && expense.amount < 0).reduce((sum, expense) => sum + Math.abs(expense.amount), 0),
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="min-h-screen bg-gray-900 text-white py-6 flex flex-col items-center">
      <div className="max-w-md w-full">
        <h1 className="text-3xl font-bold mb-4">Overview</h1>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold">ACCOUNTS</h2>
              <p>Cash: <span className="text-blue-500">{currency} {totalEarned.toFixed(2)}</span></p>
              <p>Credit Debt: <span className="text-red-500">{currency} {totalSpent.toFixed(2)}</span></p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">BUDGETS</h2>
            <div className="bg-blue-500 rounded-full h-2.5 mt-2" style={{ width: '70%' }}></div>
            <p className="text-right text-sm mt-1">March</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">CASH FLOW</h2>
            <div className="flex justify-between">
              <p className="text-blue-500">{currency} {totalEarned.toFixed(2)} Earned</p>
              <p className="text-red-500">{currency} {Math.abs(totalSpent).toFixed(2)} Spent</p>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold">SPENDING</h2>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={spendingData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                  {spendingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Add Expense</h2>
            <form onSubmit={addExpense} className="space-y-4">
              <input
                type="date"
                name="date"
                value={newExpense.date}
                onChange={handleExpenseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
                required
              />
              <select
                name="category"
                value={newExpense.category}
                onChange={handleExpenseChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
              <input
                type="number"
                name="amount"
                value={newExpense.amount || ''}
                onChange={handleExpenseChange}
                placeholder="Amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
                required
              />
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Add Expense
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Add Category</h2>
            <form onSubmit={addCategory} className="space-y-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
                placeholder="New Category"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:border-blue-300 text-black"
                required
              />
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                Add Category
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Recent Expenses</h2>
            <ul className="space-y-2">
              {expenses.map((expense) => (
                <li key={expense.id} className="flex justify-between items-center text-sm">
                  <span>{expense.date}</span>
                  <span>{expense.category}</span>
                  <span>{currency} {expense.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 sm:mt-0 max-w-4xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4 text-center">Expense Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={expenses}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
