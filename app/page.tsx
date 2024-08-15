'use client'

import { useState, FormEvent, ChangeEvent } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

type Expense = {
  id: number;
  date: string;
  category: string;
  amount: number;
}

type NewExpense = Omit<Expense, 'id'>

export default function Home() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [newExpense, setNewExpense] = useState<NewExpense>({ date: '', category: '', amount: 0 })
  const [newCategory, setNewCategory] = useState('')
  const [currency, setCurrency] = useState('EUR')

  const addExpense = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newExpense.date && newExpense.category && newExpense.amount) {
      setExpenses([...expenses, { ...newExpense, id: Date.now() }].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()))
      setNewExpense({ date: '', category: '', amount: 0 })
    }
  }

  const addCategory = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory])
      setNewCategory('')
    }
  }

  const handleExpenseChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewExpense({ ...newExpense, [name]: name === 'amount' ? parseFloat(value) : value })
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Expense Tracker</h2>
        <nav>
          <a href="#" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Dashboard</a>
          <a href="#" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Expenses</a>
          <a href="#" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Categories</a>
          <a href="#" className="block py-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white">Settings</a>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 p-10 space-y-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Dashboard</h1>

        {/* Add Expense Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add Expense</h2>
          <form onSubmit={addExpense} className="space-y-4">
            <input
              type="date"
              name="date"
              value={newExpense.date}
              onChange={handleExpenseChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            />
            <select
              name="category"
              value={newExpense.category}
              onChange={handleExpenseChange}
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
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
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            />
            <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Add Expense</button>
          </form>
        </div>

        {/* Add Category Form */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Add Category</h2>
          <form onSubmit={addCategory} className="space-y-4">
            <input
              type="text"
              value={newCategory}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCategory(e.target.value)}
              placeholder="New Category"
              className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
              required
            />
            <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Add Category</button>
          </form>
        </div>

        {/* Expense List */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Expenses</h2>
          <ul className="space-y-2">
            {expenses.map((expense) => (
              <li key={expense.id} className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                <span>{expense.date}</span>
                <span>{expense.category}</span>
                <span>{currency} {expense.amount.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Expense Trend Graph */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Expense Trend</h2>
          <LineChart width={600} height={300} data={expenses}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#8884d8" />
          </LineChart>
        </div>

        {/* Settings */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Settings</h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600 dark:text-gray-300">Currency:</span>
            <select
              value={currency}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => setCurrency(e.target.value)}
              className="p-2 border rounded dark:bg-gray-700 dark:text-white"
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="RON">RON</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}